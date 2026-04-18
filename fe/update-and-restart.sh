#!/bin/bash
# Optional: RUN_DB_PUSH=1 ./update-and-restart.sh   or   ./update-and-restart.sh --push
# (--push runs db:backup before db:push)

set -euo pipefail

cd "$(dirname "$0")"

RUN_PUSH=false
for arg in "$@"; do
	case "$arg" in
		--push) RUN_PUSH=true ;;
	esac
done
[[ "${RUN_DB_PUSH:-}" == "1" ]] && RUN_PUSH=true

# Store current commit hash
CURRENT_COMMIT=$(git rev-parse HEAD)

# Track whether we actually created a stash entry.
STASH_CREATED=false
if ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
	git stash push --include-untracked
	STASH_CREATED=true
fi

restore_stash() {
	if [[ "$STASH_CREATED" != true ]]; then
		return 0
	fi

	if ! git stash pop; then
		echo "Failed to restore stashed changes."
		return 1
	fi
	STASH_CREATED=false
}

rollback_to_original_commit() {
	echo "Rolling back to commit $CURRENT_COMMIT..."
	git reset --hard "$CURRENT_COMMIT"
}

# Pull updates; on failure, return repo to original state (including stash).
if ! git pull origin dev; then
	echo "git pull failed."
	rollback_to_original_commit
	if ! restore_stash; then
		echo "Aborting: could not restore stash after pull failure."
		exit 1
	fi
	echo "Aborting after pull failure."
	exit 1
fi

# Restore stashed changes. If this fails post-pull, rollback and retry restore.
if ! restore_stash; then
	echo "Stash restore failed after pull. Reverting and retrying stash restore..."
	rollback_to_original_commit
	if ! restore_stash; then
		echo "Aborting: stash restore failed even after rollback."
		exit 1
	fi
	echo "Aborting: repository restored to pre-update state."
	exit 1
fi


# Build the app
if ! npm run build; then
	echo "Build failed. Rolling back to previous commit..."
	rollback_to_original_commit
	if ! restore_stash; then
		echo "Aborting: could not restore stash after build rollback."
		exit 1
	fi
	exit 1
fi

# Run db:backup and db:push if --push is set right before restart because build may have made schema changes
if [[ "$RUN_PUSH" == true ]]; then
	echo "Running db:backup (before db:push)..."
	npm run db:backup
	echo "Running db:push..."
	npm run db:push
fi

# Restart app with PM2
pm2 restart airesderio

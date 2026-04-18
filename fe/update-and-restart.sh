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

# Pull updates
git pull origin dev

if [[ "$RUN_PUSH" == true ]]; then
	echo "Running db:backup (before db:push)..."
	npm run db:backup
	echo "Running db:push..."
	npm run db:push
fi

# Build the app
npm run build

# If build fails, revert and exit
if [ $? -ne 0 ]; then
   echo "Build failed. Rolling back to previous commit..."
   git reset --hard $CURRENT_COMMIT
   exit 1
fi

# Restart app with PM2
pm2 restart airesderio

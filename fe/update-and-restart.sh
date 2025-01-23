#!/bin/bash

# Store current commit hash
CURRENT_COMMIT=$(git rev-parse HEAD)

# Pull updates
git pull origin dev

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

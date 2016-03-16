#!/bin/bash
set -e

# npm install
ls -la
echo "----------------------------------------------------------------------------------------------------------------"
# ls -la ../node_modules

if [ "$1" = 'develop' ]; then
  echo "Running Development Server"
  exec npm run develop
elif [ "$1" = 'startDev' ]; then
  echo "Running Start Dev"
  exec npm run startDev
elif [ "$1" = 'test' ]; then
  echo "Running Test"
  exec npm test
elif [ "$1" = 'start' ]; then
  echo "Running Start"
  exec npm start
fi

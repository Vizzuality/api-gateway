#!/bin/bash
set -e

if [ "$1" = 'develop' ]; then
  echo "Running Development Server"
  exec grunt --gruntfile app/Gruntfile.js
elif [ "$1" = 'startDev' ]; then
  echo "Running Start Dev"
  exec node app/index
elif [ "$1" = 'test' ]; then
  echo "Running Test"
  exec grunt --gruntfile app/Gruntfile.js test
elif [ "$1" = 'start' ]; then
  echo "Running Start"
  exec node app/index
else
  exec "$@"
fi

echo

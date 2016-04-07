#!/bin/bash
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec grunt --gruntfile app/Gruntfile.js | bunyan
        ;;
    startDev)
        echo "Running Start Dev"
        exec node app/index
        ;;
    test)
        echo "Running Test"
        exec grunt --gruntfile app/Gruntfile.js test
        ;;
    start)
        echo "Running Start"
        exec node app/index
        ;;
    *)
        exec "$@"
esac

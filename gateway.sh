#!/bin/bash

case "$1" in
    test-e2e)
        npm run test-e2e
        ;;
    test-unit)
        npm run test-unit
        ;;
    start)
        npm start
        ;;
    develop)
        type docker-compose >/dev/null 2>&1 || { echo >&2 "docker-compose is required but it's not installed.  Aborting."; exit 1; }
        docker-compose -f docker-compose-develop.yml build && docker-compose -f docker-compose-develop.yml up
        ;;
    test)
        type docker-compose >/dev/null 2>&1 || { echo >&2 "docker-compose is required but it's not installed.  Aborting."; exit 1; }
        docker-compose -f docker-compose-test.yml run test
        ;;
  *)
        echo "Usage: gateway.sh {test-e2e|test-unit|start|develop|test}" >&2
        exit 1
        ;;
esac

exit 0

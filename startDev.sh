#!/bin/bash
set -e
docker-compose -f docker-compose-develop.yml build
docker-compose -f docker-compose-develop.yml up

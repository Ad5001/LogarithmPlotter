#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/"

# Run python tests
PYTHONPATH="$PYTHONPATH:.." pytest --cov --cov-report term-missing ..



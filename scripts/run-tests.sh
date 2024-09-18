#!/bin/bash
cd "$(dirname "$(readlink -f "$0" || realpath "$0")")/.."

# Run python tests
pytest --cov --cov-report term-missing



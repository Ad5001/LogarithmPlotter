#!/bin/bash

python3 setup.py --command-packages=stdeb.command sdist_dsc --package accountfree --copyright-file linux/debian/copyright --suite hirsute --recommends "$(cat linux/debian/recommends)" --depends "$(cat linux/debian/depends)" --section science bdist_deb

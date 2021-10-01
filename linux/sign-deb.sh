#!/bin/bash
# This script is used to sign the LogarithmPlotter deb directly from it's DSC file.
# Adapted from https://github.com/astraw/stdeb/issues/181

PPA_ARCHIVE="ppa:ad5001/logarithmplotter"

cd ../deb_dist

# create a temporary folder
mkdir tmp -p
cd tmp
rm -rf *

# DSC file variables
dsc_file="$(find ../ -regextype sed -regex ".*/*\-ppa[0-9]*.dsc" | cut -c 4-)"
source_package_name="$(echo $dsc_file | cut -c -$(expr ${#dsc_file} - 4))"

# extract and sign the files
dpkg-source -x "../$dsc_file"
cd "$(find . -type d | head -n 2 | tail -n 1 | cut -c 3-)" # go to the (only) directory.
debuild -S -sa -k"mail@ad5001.eu"

# upload package to my PPA
dput $PPA_ARCHIVE "../${source_package_name}_source.changes"

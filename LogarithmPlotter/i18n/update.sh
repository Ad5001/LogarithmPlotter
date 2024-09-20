#!/bin/bash
#
# This file automatically renames .mjs files to js, and (tries) to fix most common ECMAScript
# specificities so that lupdate doesn't cry out in pain.
# See also: https://bugreports.qt.io/browse/QTBUG-123819
# 

files=$(find .. -name *.mjs)
for file in $files; do
    echo "Moving '$file' to '${file%.*}.js'..."
    mv "$file" "${file%.*}.js"
    # Replacements to make it valid js
    sed -i 's/^import/\/\/import/g' "${file%.*}.js"
    sed -i 's/^export default/\/*export default*\//g' "${file%.*}.js"
    sed -i 's/^export/\/*export*\//g' "${file%.*}.js"
done

echo "------------------------"
echo "Updating translations..."
echo "------------------------"
lupdate -extensions js,qs,qml,py -recursive .. -ts lp_*.ts
# Updating locations in files
for lp in *.ts; do
    echo "Replacing locations in $lp..."
    for file in $files; do
        echo "    > Replacing for file $file..."
        f="${file//\//\\/}" # Escape slashes
        sed -i "s/${f%.*}.js/$f/g" "$lp"
    done
done

for file in $files; do
    echo "Moving '${file%.*}.js' to '$file'..."
    mv "${file%.*}.js" "$file"
    # Resetting changes
    sed -i 's/^\/\/import/import/g' "$file"
    sed -i 's/^\/\*export default\*\//export default/g' "$file"
    sed -i 's/^\/\*export\*\//export/g' "$file"
done

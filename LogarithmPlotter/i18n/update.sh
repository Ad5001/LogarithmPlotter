#!/bin/bash
#
# This file automatically renames .mjs files to js, and (tries) to fix most common ECMAScript
# specificities so that lupdate doesn't cry out in pain.
# See also: https://bugreports.qt.io/browse/QTBUG-123819
# 

escape() {
    str="$1"
    str="${str//\//\\/}" # Escape slashes
    str="${str//\*/\\*}" # Escape asterixes
    echo "$str"
}

replace() {
    file="$1"
    from="$(escape "$2")"
    to="$(escape "$3")"
    sed -i "s/${from}/${to}/g" "$file"
}

files=$(find .. -name *.mjs)
for file in $files; do
    echo "Moving '$file' to '${file%.*}.js'..."
    mv "$file" "${file%.*}.js"
    # Replacements to make it valid js
    replace "${file%.*}.js" "^import" "/*import"
    replace "${file%.*}.js" '.mjs"$' '.mjs"*/'
    replace "${file%.*}.js" "^export default" "/*export default*/"
    replace "${file%.*}.js" "^export" "/*export*/"
done

echo "----------------------------"
echo "| Updating translations... |"
echo "----------------------------"
lupdate -extensions js,qs,qml,py -recursive .. -ts lp_*.ts
# Updating locations in files
for lp in *.ts; do
    echo "Replacing locations in $lp..."
    for file in $files; do
        echo "    > Replacing for file $file..."
        replace "$lp" "${file%.*}.js" "$file"
    done
done

for file in $files; do
    echo "Moving '${file%.*}.js' to '$file'..."
    mv "${file%.*}.js" "$file"
    # Resetting changes
    replace "$file" "^/*import" "import"
    replace "$file" '.mjs"*/$' '.mjs"'
    replace "$file" "^/*export default*/" "export default"
    replace "$file" "^/*export*/" "export"
done

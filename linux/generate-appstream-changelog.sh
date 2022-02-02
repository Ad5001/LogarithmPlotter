cat ../CHANGELOG.md | awk '
BEGIN {
    listBegan=0
    latest=1
}
/^\s*##/ {
    if(!latest) {
        listBegan=0
        print "            </ul>"
        print "        </release>"
    }
    latest=0
    cmd ="date \"+%Y-%m-%d\" -d \""substr($3,2,2)" "$4" "substr($5,0,4)"\""
    cmd | getline date
    print "        <release version=\""substr($2,2,5)"\" date=\""date"\">"
    print "            <p><b>Changes for "$2":</b></p>"
}
/^\s*\*\*/ {
    if(listBegan) {
        print "            </ul>"
    }
    listBegan=1
    s = ""; for (i = 1; i <= NF; i++) s = s " " $i;
    print "            <p>"substr(s,4,length(s)-5)"</p>" 
    print "            <ul>"
}
/^\s*\* / {
    if(!listBegan) {
        listBegan=1
        print "            <ul>"
    }
    s = ""; for (i = 2; i <= NF; i++) s = s " " $i;
    print "                <li>"substr(s,2)"</li>" 
}
/^\s*--/ {
    listBegan=0
    print "            </ul>"
    print "        </release>"
}
END {
    print "            </ul>"
    print "        </release>"
}'

#'{
#if($1 == "*") { 
#    s = ""; for (i = 2; i <= NF; i++) s = s " " $i;
#    print "                <li>"substr(s,2)"</li>" 
#} else if($1 == "##") { 
#    cmd ="date \"+%Y-%m-%d\" -d \""substr($3,2,2)" "$4" "substr($5,0,4)"\""
#    cmd | getline date
#    print "        <release version=\""substr($2,2,5)"\" date=\""date"\">"
#    print "            <p>Changes for "$2":</p>"
#    print "            <ul>"
#} else if($1 == "--") {
#    print "            </ul>"
#    print "        </release>"
#}
#}'

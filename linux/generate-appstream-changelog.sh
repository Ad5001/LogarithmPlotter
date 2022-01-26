cat ../CHANGELOG.md | awk '{
if($1 == "*") { 
    s = ""; for (i = 2; i <= NF; i++) s = s " " $i;
    print "                <li>"substr(s,2)"</li>" 
} else if($1 == "##") { 
    cmd ="date \"+%Y-%m-%d\" -d \""substr($3,2,2)" "$4" "substr($5,0,4)"\""
    cmd | getline date
    print "        <release version=\""substr($2,2,5)"\" date=\""date"\">"
    print "            <p>Changes for "$2":</p>"
    print "            <ul>"
} else if($1 == "--") {
    print "            </ul>"
    print "        </release>"
}
}'

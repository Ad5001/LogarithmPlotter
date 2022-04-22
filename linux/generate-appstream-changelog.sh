cat ../CHANGELOG.md | gawk '
BEGIN {
    listBegan=0
    latest=1
    version=0
}
/^\s*##/ {
    if(!latest) {
        listBegan=0
        print "                </ul>"
        print "            </description>"
        print "            <artifacts>"
        print "                <artifact type=\"binary\" platform=\"x86_64-windows-any\">"
        print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-v"version"-setup.exe</location>"
        print "                </artifact>"
        print "                <artifact type=\"binary\" platform=\"x86_64-macos-any\">"
        print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/LogarithmPlotter-v"version"-setup.dmg</location>"
        print "                </artifact>"
        print "                <artifact type=\"source\">"
        print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-"version".tar.gz</location>"
        print "                </artifact>"
        print "            </artifacts>"
        print "        </release>"
    }
    latest=0
    cmd ="date \"+%Y-%m-%d\" -d \""substr($3,2,2)" "$4" "substr($5,0,4)"\""
    cmd | getline date
    version = substr($2,2,5)
    print "        <release version=\""version"\" date=\""date"\">"
    print "            <description>"
    print "                <p><b>Changes for "$2":</b></p>"
}
/^\s*\*\*/ {
    if(listBegan) {
        print "                </ul>"
    }
    listBegan=1
    s = ""; for (i = 1; i <= NF; i++) s = s " " $i;
    print "                <p>"substr(s,4,length(s)-5)"</p>" 
    print "                <ul>"
}
/^\s*\* / {
    if(!listBegan) {
        listBegan=1
        print "                <ul>"
    }
    s = ""; for (i = 2; i <= NF; i++) s = s " " $i;
    text = substr(s,2)
    # Removing links
    text = gensub(/\[([^\]]+)\]\(([^\)]+)\)/, "\\1", "g", text);
    # Fixing & in text.
    text = gensub(/&/, "&amp;", "g", text)
    print "                    <li>"text"</li>" 
}
/^\s*--/ {
    listBegan=0
    print "                </ul>"
    print "            </description>"
    print "            <artifacts>"
    print "                <artifact type=\"binary\" platform=\"x86_64-windows-any\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-v"version"-setup.exe</location>"
    print "                </artifact>"
    print "                <artifact type=\"binary\" platform=\"x86_64-macos-any\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/LogarithmPlotter-v"version"-setup.dmg</location>"
    print "                </artifact>"
    print "                <artifact type=\"source\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-"version".tar.gz</location>"
    print "                </artifact>"
    print "            </artifacts>"
    print "        </release>"
}
END {
    print "                </ul>"
    print "            </description>"
    print "            <artifacts>"
    print "                <artifact type=\"binary\" platform=\"x86_64-windows-any\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-v"version"-setup.exe</location>"
    print "                </artifact>"
    print "                <artifact type=\"binary\" platform=\"x86_64-macos-any\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/LogarithmPlotter-v"version"-setup.dmg</location>"
    print "                </artifact>"
    print "                <artifact type=\"source\">"
    print "                    <location>https://artifacts.accountfree.org/repository/apps.ad5001.eu-apps/logarithmplotter/v"version"/logarithmplotter-"version".tar.gz</location>"
    print "                </artifact>"
    print "            </artifacts>"
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

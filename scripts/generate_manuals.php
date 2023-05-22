<?php
#
# LogarithmPlotter - 2D plotter software to make BODE plots, sequences and repartition functions.
# Copyright (C) 2023  Ad5001 <mail@ad5001.eu>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
# 

# This PHP script generates manuals for LogarithmPlotter in Markdown, HTML and PDF.

declare(strict_types=1);
error_reporting(E_ALL);

function generate_html(string $title, string $body) : string {
    $h = "<!DOCTYPE html>
<html>
<head>
    <title>$title</title>
    <meta charset=\"utf-8\">
    <style>* {
        font-family: sans-serif
    }</style>
</head>
<body>$body</body>
</html>";
    return $h;
}

function fetch_page(string $man) : string {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://git.ad5001.eu/api/v1/repos/Ad5001/LogarithmPlotter/wiki/page/{$man}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    
    $data = json_decode(curl_exec($ch));
    return base64_decode($data->content_base64);
}

function extract_markdown_links(string $content) : array {
    preg_match_all(
        "/\[[\w\d+:',é -]*\]\(([\w\d'+%-]+)\)/i",
        $content,
        $matches
    );
    return $matches[1];
}

function do_replacements(string $man_name, string $content) : string {
    $cnt = preg_replace("/# /", "## ", $content);
    if(str_contains($cnt, $man_name))
        $cnt = preg_replace("/$man_name/", "#$man_name", $cnt);
    return $cnt;
}

function remove_navigation(string $content) : string {
    $lines = explode("\n", $content);
    return implode("\n", array_slice($lines, 2, count($lines)-3));
}

function fetch_full_manual(string $man_page) : string {
    $intro = fetch_page($man_page);
    $pages = extract_markdown_links($intro);
    # Extract content from first page
    $lines = explode("\n", $intro);
    $content = implode("\n", array_slice($lines, 0, count($lines)-count($pages)));
    $content .= "\n\n[Online version](https://git.ad5001.eu/Ad5001/LogarithmPlotter/wiki/$man_page)\n";
    # Extract pages
    foreach($pages as $page) {
        $content .= "\n<span id=\"$page\"></span>\n";
        $content .= do_replacements($man_page, remove_navigation(fetch_page($page)));
    }
    return $content;
}

function convert_to_html(string $md_content) : string {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://git.ad5001.eu/api/v1/markdown/raw");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/plain', 'Accept: text/html'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $md_content);
    
    return curl_exec($ch);
}

function save_manuals(string $man_page) {
    $md = fetch_full_manual($man_page);
    $html = generate_html("$man_page", convert_to_html($md));
    file_put_contents("$man_page.md", $md);
    file_put_contents("$man_page.html", $html);
    system("wkhtmltopdf \"$man_page.html\" \"$man_page.pdf\"");
}

save_manuals("User-Manual");
save_manuals("Manuel-d'utilisation");

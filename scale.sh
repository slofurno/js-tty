#!/bin/sh

while true
do
curl 'https://api.scaleway.com/ips' -H 'Pragma: no-cache' -H 'Origin: https://cloud.scaleway.com' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Cache-Control: no-cache' -H 'x-auth-token: 09cdae16-cf3e-4c3e-a570-9464219481a6' -H 'Referer: https://cloud.scaleway.com/' -H 'Connection: keep-alive' -H 'X-FirePHP-Version: 0.0.6' --data-binary '{"organization":"3620d986-3fa7-4c62-a7ac-56932dcd550d"}' --compressed
printf "\n"
sleep 1
done;
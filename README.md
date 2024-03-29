# puppeteer-js-render

- [English](https://github.com/qshine/puppeteer-js-render/blob/master/README.md)
- [中文](https://github.com/qshine/puppeteer-js-render/blob/master/README-CN.md) 

----

`puppeteer-js-render` is a html/js renderer which it use puppeteer and express, you can use it to write web crawlers or other things.

## Features
- execute js script
- remove browser fingerprints
- screenshot
- custom cookies and headers
- ...

## Installation
```sh
# install node package
npm install
```

It is recommend to use `pm2` to manage the process.
```sh
npm install -g pm2

pm2 start app
pm2 stop app
pm2 logs app
pm2 list
```

## Run
```sh
node app.js
```
The server will listen `22222` port

## Parameter description
- `url`: target url
- `method`: Get/Post. default Get
- `proxy`: setting the proxy is only valid for browsers. eg:127.0.0.1:1080
- `data`: post data if method is POST
- `load_images`: whether load images. defualt true
- `headless`: default true
- `viewport_width`: default 1280
- `viewport_height`: default 1024
- `timeout`: request timeout(unit: s). default 20s
- `screenshot_name`: the screenshot name, eg: test.png. stored in current_path
- `cookies`: custom cookies. eg:
  ```
  [
      {
          "domain":".github.com",
          "expirationDate":1652020053,
          "hostOnly":false,
          "httpOnly":false,
          "name":"_ga",
          "path":"/",
          "sameSite":"unspecified",
          "secure":false,
          "session":false,
          "storeId":"0",
          "value":"GA1.2.792623144.1577201184",
          "id":1
      }
  ]
  ```
- `mobile`: optional. if you want to simulate a mobile device set true
- `headers`: http request headers, eg
  ```
  {
  	"accept": "text/html",
  	"referer": "https://www.google.com/",
  	"user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
  }
  ```
- `js_script`: execute after page loaded
- `sleep_time`: sleep time after execute js_script. eg:2000 (2000ms)

## Example
run the app server
`node app.js`

run curl command
```
curl --location --request POST '127.0.0.1:22222' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'url=https://www.httpbin.org/headers' \
--data-urlencode 'js_script=function test(){
    return "hello world"
}
test()' \
--data-urlencode 'screenshot_name=eg.png'
```

response content
```
{"code":200,"err_msg":null,"time":2160,"data":{"input_url":"https://www.httpbin.org/headers","final_url":"https://www.httpbin.org/headers","headers":{"status":"200","date":"Tue, 01 Mar 2022 14:41:10 GMT","content-type":"application/json","content-length":"648","server":"gunicorn/19.9.0","access-control-allow-origin":"*","access-control-allow-credentials":"true"},"all_cookies":[],"content":"<html><head></head><body><pre style=\"word-wrap: break-word; white-space: pre-wrap;\">{\n  \"headers\": {\n    \"Accept\": \"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\", \n    \"Accept-Encoding\": \"gzip, deflate, br\", \n    \"Cache-Control\": \"no-cache\", \n    \"Host\": \"www.httpbin.org\", \n    \"Pragma\": \"no-cache\", \n    \"Sec-Fetch-Mode\": \"navigate\", \n    \"Sec-Fetch-Site\": \"none\", \n    \"Sec-Fetch-User\": \"?1\", \n    \"Upgrade-Insecure-Requests\": \"1\", \n    \"User-Agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36\", \n    \"X-Amzn-Trace-Id\": \"Root=1-621e3086-724827e7705cb691268ef1de\"\n  }\n}\n</pre></body></html>","js_script_result":"hello world"}}
```

below is the screenshot
![](resource/eg.png)

## TODO
- [ ] Dockerfile

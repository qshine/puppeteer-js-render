# puppeteer-js-render

`puppeteer-js-render` is a js renderer which it use puppeteer and express, you can use it to write web crawlers or other things.

## Features
- execute js script
- remove browser fingerprints
- screenshot
- cookies
- headers

## Installation
```sh
# install node package
npm install

# run server
node app.js
```
The server will listen `22222`

It is recommended to use `pm2` for manage the process.
```sh
# install
npm install -g pm2

pm2 start app
pm2 stop app
pm2 logs app
pm2 list
```

## Parameter description
- `url`: web url
- `method`: default GET
- `data`: post data if method is POST
- `load_images`: defualt true
- `headless`: default true
- `js_viewport_width`: default 1280
- `js_viewport_height`: default 1024
- `timeout`: eg:3. default 20s
- `screenshot_name`: the screenshot name, eg: test.png. stored in current_path
- `cookies`: json
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

- `mobile`: optional. Set to true if you want to simulate a mobile device


- `headers`: http request headers, eg
  ```
  {
  	"accept": "text/html",
  	"referer": "https://www.google.com/",
  	"user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
  }
  ```
- `click_button`: click button after goto(url) is finished and before execute js_script. eg: `#name`
- `js_script`: execute after page loaded
- `sleep_time`: sleep time after execute js_script. eg:2000 (2s)

## TODO
- [ ] Dockerfile

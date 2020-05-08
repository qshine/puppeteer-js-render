const express = require("express");
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
require('console-stamp')(console, {pattern: 'yyyy-mm-dd HH:MM:ss.l'});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let init_browser = true;
let browser_settings = {};

app.use(async (req, res, next) => {
    if (init_browser) {
        args = [
            '--disable-infobars', 
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--password-store=basic', 
            '--account-consistency', 
            '--aggressive', 
            '--allow-running-insecure-content', 
            '--allow-no-sandbox-job', 
            '--allow-outdated-plugins', 
            '--disable-gpu'
        ];
        var options = req.body;
        if (options.proxy) {
            if (options.proxy.indexOf("://") == -1) {
                options.proxy = "http://" + options.proxy;
            }
            args.push("--proxy-server=" + options.proxy);
        }
        browser_settings["args"] = args;
        browser_settings["headless"] = options.headless === "false" ? false : true
        browser_settings["ignoreDefaultArgs"] = ["--enable-automation"];

        browser = await puppeteer.launch(browser_settings);
        init_browser = false;
        console.log("init browser success!");
        next();
    } else {
        next();
    }
});


async function init_page(page) {
    await page.evaluateOnNewDocument(() => {
        // Set webdriver false
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    }).catch(err => {
        console.log(err)
    });

    await page.evaluateOnNewDocument(() => {
        // We can mock this in as much depth as we need for the test.
        window.navigator.chrome = {
            runtime: {},
            // etc.
        };
    }).catch(err => {
        console.log(err)
    });

    await page.evaluateOnNewDocument(() => {
        // Pass the Chrome Test.
        Object.defineProperty(navigator, 'languages', {
            get: function () {
                return ["zh-CN", "zh", "en", "zh-TW", "fr", "pt", "pl"];
            },
        });
    }).catch(err => {
        console.log(err)
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
            // This just needs to have `length > 0` for the current test,
            // but we could mock the plugins too if necessary.
            get: () => [1, 2, 3, 4, 5],
        });
    }).catch(err => {
        console.log(err)
    });

    await page.evaluateOnNewDocument(() => {
        const getParameter = WebGLRenderingContext.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (parameter) {
            // UNMASKED_VENDOR_WEBGL
            if (parameter === 37445) {
                return 'Intel Open Source Technology Center';
            }
            // UNMASKED_RENDERER_WEBGL
            if (parameter === 37446) {
                return 'Mesa DRI Intel(R) Ivybridge Mobile ';
            }

            return getParameter(parameter);
        };
    }).catch(err => {
        console.log(err)
    });

    await page.evaluateOnNewDocument(() => {
        // Pass the Permissions Test.
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({state: Notification.permission}) :
                originalQuery(parameters)
        );
    }).catch(err => {
        console.log(err)
    });

    console.log('Init page success.');
    return page
}


async function fetch(options) {
    var page = await browser.newPage();
    options.start_time = Date.now();
    try {
        await init_page(page);
        await _fetch(page, options);
        var result = await make_result(page, options);
        await page.close();
        return result
    } catch (error) {
        var result = await make_result(page, options, error);
        await page.close();
        return result
    }
}

async function _fetch(page, options) {
    if (options.cookies){
        all_cookies = JSON.parse(options.cookies)
        await page.setCookie(...all_cookies)
        console.log('init page cookies success.')
    }
    
    if (options.mobile){
        await page.emulate(iPhone);
    }

    width = options.js_viewport_width || 1280;
    height = options.js_viewport_height || 1024;
    await page.setViewport({
        "width": width,
        "height": height
    });

    if (options.headers) {
        options.headers = JSON.parse(options.headers);
        await page.setExtraHTTPHeaders(options.headers);
    }

    if (options.headers && options.headers["user-agent"]) {
        page.setUserAgent(options.headers["user-agent"]);
    } else {
        page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')
    }

    page.on("console", msg => {
        console.log('console: ' + msg.text());
    });

    // Http post method
    let first_request = true;
    let request_reseted = false;
    await page.setRequestInterception(true);
    if (options.method && options.method.toLowerCase() === "post") {
        page.on("request", interceptedRequest => {
            request_reseted = false;
            end_time = null;
            if (first_request) {
                first_request = false;
                var data = {
                    "method": "POST",
                    "postData": options.data
                };
                console.log(data);
                interceptedRequest.continue(data);
                request_reseted = true
            }
        })
    } else {
        page.on("request", interceptedRequest => {
            request_reseted = false;
            end_time = null;
        })
    }

    // load images or not
    if (options.load_images && options.load_images.toLowerCase() === "false") {
        page.on("request", request => {
            if (!!!request_reseted) {
                if (request.resourceType() === 'image')
                    request.abort();
                else
                    request.continue();
            }
        })
    } else {
        page.on("request", request => {
            if (!!!request_reseted)
                request.continue()
        })
    }

    let error_message = null;
    page.on("error", e => {
        error_message = e
    });
    page.on("pageerror", e => {
        error_message = e
    });

    let page_settings = {};
    var page_timeout = options.timeout ? options.timeout * 1000 : 20 * 1000;
    page_settings["timeout"] = page_timeout;
    page_settings["waitUntil"] = ["domcontentloaded", "networkidle0"];

    var response = await page.goto(options.url, page_settings);

    if (error_message) {
        throw error_message
    }

    if (options.click_button) {
        console.log('start click button ......');
        await page.click(options.click_button);
        console.log("end click done !!!");
    }

    if (options.js_script) {
        console.log('running document-end script.');
        script_result = await page.evaluate(x => {
            eval(x)
        }, options.js_script);
        console.log("end script_result is: ", script_result);
        options.script_result = script_result
    }

    if (options.sleep_time) {
        console.log('start sleep ...');
        sleep_time = parseInt(options.sleep_time, 10);
        await page.waitFor(sleep_time);
        console.log('sleep end !!!');
    }

    if (options.screenshot_name) {
        await page.screenshot({path: "./" + options.screenshot_name});
    }

    options.response = response
}

async function make_result(page, options, error) {
    response = options.response;

    var cookies = {};
    var tmp_cookies = await page.cookies();
    tmp_cookies.forEach(function (e) {
        cookies[e.name] = e.value;
    });

    let status_code = null;
    let headers = null;
    let page_content = null;
    console.log("error: ", error);
    if (!!!error) {
        response = options.response;
        status_code = response.status();
        headers = response.headers();
        page_content = await page.content();
    }
    var all_cookies = await page._client.send('Network.getAllCookies');

    return {
        orig_url: options.url,
        status_code: status_code || 599,
        error: error,
        content: page_content,
        headers: headers,
        url: page.url(),
        cookies: cookies,
        all_cookies: all_cookies['cookies'],
        time: (Date.now() - options.start_time) / 1000,
        js_script_result: options.script_result,
        save: options.save
    }
}

app.get("/", function (request, response) {
    body = "method not allowed!";
    response.status(403);
    response.set({
        "cache": "no-cache",
        "Content-Length": body.length
    });
    response.send(body);
});


let max_open_pages = 5;
let opened_page_nums = 0;

app.post("/", async (request, response) => {
    console.log("opened pages: " + opened_page_nums);
    if (opened_page_nums >= max_open_pages) {
        body = "browser pages is too many, please open new a browser!";
        response.status(403);
        response.set({
            "cache": "no-cache",
            "Content-Length": body.length
        });
        response.send(body);
    } else {
        opened_page_nums += 1;
        let options = request.body;
        result = await fetch(options);
        opened_page_nums -= 1;
        response.send(result)
    }
});


let port = 22222;

if (process.argv.length === 3) {
    port = parseInt(process.argv[2])
}

app.listen(port, function () {
    console.log("server listen: " + port);
});
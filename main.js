const fs = require("fs");
const async = require("async");
const request = require('request');
const Nightmare = require("nightmare");
const { JSDOM } = require("jsdom");
const nightmare = Nightmare({ show: true }); // monitor what the browser is doing on execution

// Set the desired webpage and file types to scrape
const WEBPAGE = 'https://www.learningcontainer.com/mp4-sample-video-files-download/'; // webpage to scrape
const FILE_TYPES = ["mp4", "gif", "png", "jpg", "webp"]; // file types to download

// Set the username and password to automate login if needed
const USERNAME = "";
const PASSWORD = "";

// Set the html elements to automate login if needed
const USERNAME_ELEMENT = ""; // css selector for input box username field on webpage
const PASSWORD_ELEMENT = ""; // css selector for input box password field on webpage
const LOGIN_ELEMENT = ""; // css selector for login button on webpage
const NEW_PAGE_TIMEOUT = 5000; // ms to wait for a page to render

// Tag and attribute types
const TAG_TYPES = ["a", "img", "link"]; // html tags to scrape
const TAG_ATTR_MAP = { // attributes to scrape for each tag
    "a": "href",
    "img": "src",
    "link": "href"
};

// Number of files to download in parallel
const ASYNC_LIMIT = 2; // decrease to 1 if throttling suspected, increase if download is too slow

// A simple class for link processing
class Link {
    constructor(tag, attr) {
        this.tag = tag;
        this.attr = attr;
    }
}

/**
 * Determines if the html element contains a desired file type
 * @param {Link} link - The html element
 */
const isFileType = (link) => {
    // return false if there is no attribute in the Link
    if (typeof link.attr === 'undefined') { return false }
    // check if any desired file type is found in the Link's attribute
    return FILE_TYPES.some(fileType => link.attr.includes(`.${fileType.toLowerCase()}`));
};

// Simulate browser interaction
if (USERNAME && PASSWORD && USERNAME_ELEMENT && PASSWORD_ELEMENT && LOGIN_ELEMENT) {
    // if login needed
    nightmare
        .goto(WEBPAGE) // go to page
        .wait(USERNAME_ELEMENT) // wait for page to render
        .type(USERNAME_ELEMENT, USERNAME) // type username
        .type(PASSWORD_ELEMENT, PASSWORD) // type password
        .click(LOGIN_ELEMENT) // login
        .wait(NEW_PAGE_TIMEOUT) // wait for new page
        .evaluate(() => document.querySelector('body').innerHTML) // fetch the rendered html
        .end() // close the browser
        .then(response => processHtml(response)) // process the html
        .catch(err => {
            console.log(err);
        });
} else {
    // no login needed
    nightmare
        .goto(WEBPAGE) // go to page
        .wait(NEW_PAGE_TIMEOUT) // wait for page
        .evaluate(() => document.querySelector('body').innerHTML) // fetch the rendered html
        .end() // close the browser
        .then(response => processHtml(response)) // process the html
        .catch(err => {
            console.log(err);
        });
}

/**
 * Downloads a URL to a local file.
 * @param {URL} url - The url of the file to be downloaded
 * @param {String} outputFileName - The name of the output file
 */
const downloadFile = (url, outputFileName) => new Promise((resolve, reject) => {
    // options for http request
    const options = {
        uri: url.toString(),
        headers: {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36",
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        gzip: true
    };
    // initiate http request
    request(options)
        .pipe(fs.createWriteStream(outputFileName))
        .on('finish', () => {
            console.log(`  ✅ Successfully downloaded ${url.toString()} to ${outputFileName}` + '\n');
            resolve();
        })
        .on('error', (err) => {
            console.log(`  ❌ There was an error downloading ${url.toString()} to ${outputFileName}` + '\n');
            reject(err);
        });
});

/**
 * Process a URL before downloading to a local file.
 * @param {URL} url - The url to be processed
 * @param {Function} cb - The next function
 */
const processThenDownload = (url, cb) => {
    // extract name of resource
    const urlPathName = url.pathname.split("/").pop();
    // initiate file stream
    downloadFile(url, urlPathName)
        .then(() => cb())
        .catch(err => {
            cb({ file: url.toString(), error: err });
        });
};

/**
 * Extract and download all desired files from an html webpage
 * @param {String} html - An html webpage string
 */
const processHtml = html => {
    // create the dom tree
    const dom = new JSDOM(html);

    // map all tree nodes to Links
    const links = TAG_TYPES.reduce((acc, tag) => {
        return acc.concat(
            [...dom.window.document.querySelectorAll(tag)]
                .map(node => new Link(tag, node[TAG_ATTR_MAP[tag]])));
    }, []);

    // extract the unique attribute strings from all Links
    const attributes = [...new Set(
        links
            .filter(isFileType)
            .map(link => link.attr)
    )];

    // download each file in parallel
    console.log(`>> Downloading ${attributes.length} file(s)...` + '\n');
    async.eachOfLimit(attributes, ASYNC_LIMIT, (attr, _idx, cb) => {
        try {
            // case 1: attribute is a full url
            // e.g. http://website.com/image.png
            const url = new URL(attr);
            processThenDownload(url, (err) => {
                if (err) {
                    cb({ file: url.toString(), error: err });
                } else {
                    cb();
                }
            });
        } catch (error) {
            // case 2: attribute is a relative path
            // e.g. ./image.png
            const url = new URL(WEBPAGE);
            url.pathname = attr;
            processThenDownload(url, (err) => {
                if (err) {
                    cb({ file: url.toString(), error: [error, err] });
                } else {
                    cb();
                }
            });
        }
    }, (err) => {
        if (err) {
            console.log(">> A file failed to download:");
            console.log(err);
        } else {
            console.log("❤  All files downloaded successfully.");
        }
    });
};
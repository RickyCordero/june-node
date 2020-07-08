const fs = require("fs");
const async = require("async");
const got = require('got');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const WEBPAGE_URL = 'https://www.learningcontainer.com/mp4-sample-video-files-download/'; // webpage to scrape
const FILE_TYPES = ["ogv", "mp4", "3g2"]; // file types to download
const ASYNC_LIMIT = 2; // decrease to 1 if getting download error, increase if download too slow

/**
 * Determines if the html element contains a desired file type
 * @param {Object} link - The html element
 */
const isFileType = (link) => {
    // Return false if there is no href attribute in the element
    if (typeof link.href === 'undefined') { return false }
    // Check if any desired file type is found in the link
    return FILE_TYPES.some(fileType => link.href.includes(`.${fileType.toLowerCase()}`));
};

(async () => {
    const response = await got(WEBPAGE_URL);
    const dom = new JSDOM(response.body);

    // Create an array of all anchor (link) elements
    const links = [...dom.window.document.querySelectorAll('a')];
    const hrefs = [...new Set(
        links
            .filter(isFileType)
            .map(link => link.href)
    )];
    // Download each file
    console.log(`>> Downloading ${hrefs.length} file(s)...` + '\n');
    hrefs.forEach(href => console.log(href));
    console.log("\n");
    async.eachOfLimit(hrefs, ASYNC_LIMIT, (href, _idx, cb) => {
        const uri_1 = href;
        const baseUrl = WEBPAGE_URL.substring(0, WEBPAGE_URL.lastIndexOf("/"));
        const urlFileName = href.split("/").pop();
        const outputFileName = urlFileName;
        const downloadFile = (uri) => new Promise((resolve, reject) => {
            request({
                uri: uri,
                headers: {},
                gzip: true
            })
                .pipe(fs.createWriteStream(outputFileName))
                .on('finish', () => {
                    console.log(`  ✅ Successfully downloaded ${uri} to ${outputFileName}` + '\n');
                    resolve();
                })
                .on('error', (err) => {
                    console.log(`  ❌ There was an error downloading ${uri} to ${outputFileName}` + '\n');
                    reject(err);
                });
        });
        // Initiate file stream
        downloadFile(uri_1)
            .then(() => cb())
            .catch(err_1 => {
                const uri_2 = `${baseUrl}/${urlFileName}`;
                downloadFile(uri_2)
                    .then(() => cb())
                    .catch(err_2 => {
                        cb({ file: uri, error: err_1 });
                        cb({ file: uri_2, error: err_2 })
                    });
            });
    }, (err) => {
        if (err) {
            console.log(">> A file failed to download:");
            console.log(err);
        } else {
            console.log("❤  All files downloaded successfully.");
        }
    });
})();
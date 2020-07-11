# june-node

A simple file scraper with Node.js

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (tested with v12.18.0)

### Installing

Install the necessary packages in your local directory:

```
npm i
```

## Usage

Set the webpage url in ```main.js``` to the desired page containing files for download:

```const WEBPAGE = 'https://...'```

Then modify the file types array to contain only the file types you want to download:

```const FILE_TYPES = ["mp4", "gif", ... ]```

To start the script, run the following command:

```
npm start
```

If the webpage to be scraped requires login credentials, specify the login credentials in ```main.js```:

```
// Set the username and password to automate login if needed
const USERNAME = "";
const PASSWORD = "";
```
and specify the css selectors for the username input box, the password input box, and the login/submit button:

```
// Set the html elements to automate login if needed
const USERNAME_ELEMENT = ""; // css selector for input box username field on webpage
const PASSWORD_ELEMENT = ""; // css selector for input box password field on webpage
const LOGIN_ELEMENT = ""; // css selector for login button on webpage
```

All files found in an anchor, image, or link tag on the given webpage will be downloaded in parallel and written to the current folder with their original file names. If other tags are needed or different attributes should be scraped, add the desired tag to ```TAG_TYPES``` and the desired tag/attribute pair to ```TAG_ATTR_MAP```:

```
// Tag and attribute types
const TAG_TYPES = ["a", "img", "link"]; // html tags to scrape
const TAG_ATTR_MAP = { // attributes to scrape for each tag
    "a": "href",
    "img": "src",
    "link": "href"
};
```

## Debugging

If you encounter an error during downloading, check your connection first, but lower the number of concurrent requests in case throttling is suspected:

```
// Number of files to download in parallel
const ASYNC_LIMIT = 2; // decrease to 1 if throttling suspected, increase if download is too slow
```

If the downloads are blocking for too long, increase the limit.

## Built With

* [nightmare](https://github.com/segmentio/nightmare) - Browser automation library
* [jsdom](https://github.com/jsdom/jsdom) - JavaScript based headless browser
* [async](https://caolan.github.io/async/v3/) - Asynchronous processing library
* [request](https://github.com/request/request) - HTTP library


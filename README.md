# june

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

```const WEBPAGE_URL = 'https://...'```

Then modify the file types array to contain only the file types you want to download:

```const FILE_TYPES = ["mp4", "mov", ... ]```

To start the script, run the following command:

```
npm start
```

All files found in an anchor tag on the given webpage will be downloaded in parallel and written to the current folder with their original file names.

## Debugging

If you encounter an error during downloading, check your connection first, but lower the number of concurrent requests in case throttling is suspected:

```
const ASYNC_LIMIT = 1;
```

If the downloads are blocking for too long, increase the limit.

## TODO:

- Authentication handling

## Built With

* [jsdom](https://github.com/jsdom/jsdom) - JavaScript based headless browser
* [async](https://caolan.github.io/async/v3/) - Asynchronous processing library


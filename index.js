const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

const html = (__dirname + '/temp.html');
const defaults = {
  debug: false,
  radius: 100,
  multiplier: 2,
  attempts: 1,
  throttle: 1,
  google: false,
}

// Function declared as async so await can be used:
async function getRandStreetview(opts) {

  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
  const browser = await puppeteer.launch({
    dumpio: opts.debug,
  });
  const page = await browser.newPage();

  // Instead of using `goto().then()`, use await:
  await page.goto(`file://${path.resolve(html)}`);

  // Waiting for `window.panoData` to populate:
  await page.waitFor(() => typeof(panoData) !== 'undefined');

  // We should have `window.panoData` object from the puppeteer request:
  let result = await page.evaluate(() => panoData);

  // Garbage collect:
  await browser.close();

  // Resolve this async function with the result:
  return result;

}

async function run(options = {}) {

  // Create a new shallow copy using Object Spread Params (last one in wins):
  const opts = {
    ...defaults,
    ...options,
  };

  if (opts.debug) {

    console.log(opts);

  }

  if (opts.key && opts.key.length) {

    let template = `
      <script src="https://maps.googleapis.com/maps/api/js?key=${opts.key}"></script>
      <script>window.options=${JSON.stringify(opts)};</script>
      <script src="coords.js"></script>
    `.replace(/\s{2,}/g, '\n').trim(); // This line is purely for cosmetics.

    await fs.writeFile(html, template, 'utf8');

    let result = await getRandStreetview(opts);

    if ( ! opts.debug) {

      await fs.unlink(html);

    }

    return result;

  } else {

    throw new Error('key is required');

  }

}

module.exports = run;

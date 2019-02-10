const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

const html = (__dirname + '/temp.html');
const defaults = {
  debug: false, // Shows extra information about streetview attempts.
  restart: false, // If the Google Maps script should request a new random location after `restartAfter` attempts.
  maxRestarts: 1, // Maximum number of “restarts”.
  restartAfter: 25, // Request a new random location after this number of street view radius checks from starting coordinates.
  throttleSeconds: 1, // Seconds to throttle API requests to Google Maps.
  googlePanosOnly: false // Set to true if you only want official Google panorama data.
}

// Function declared as async so await can be used:
async function getRandStreetview() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Instead of using `goto().then()`, use await:
  await page.goto(`file://${path.resolve(html)}`);

  if (debug) {

    // Display console messages:
    await page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  }

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
  options = {
    ...defaults,
    ...options,
  };

  if (options.key && options.key.length) {

    let template = `
      <script src="https://maps.googleapis.com/maps/api/js?key=${options.key}"></script>
      <script>window.options=${JSON.stringify(options)};</script>
      <script src="coords.js"></script>
    `.replace(/\s{2,}/g, '\n').trim(); // This line is purely cosmetic.

    await fs.writeFile(html, template, 'utf8');

    let result = await getRandStreetview();

    await fs.unlink(html);

    return result;

  } else {

    throw new Error('key is required');

  }

}

module.exports = run;

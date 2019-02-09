const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const html = (__dirname + '/temp.html');

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

  if (options.key && options.key.length) {

    let opts = [];

    if (options.startingCoords) {

      opts.push(`startingCoords:{latitude:${options.startingCoords.latitude},longitude:${options.startingCoords.longitude}}`);

    }

    if (options.googlePanosOnly) {

      opts.push(`googlePanosOnly:true`);

    }

    let template = `
      <script src="https://maps.googleapis.com/maps/api/js?key=${options.key}"></script>
      <script>window.options={${opts.join(',')}};</script>
      <script src="coords.js"></script>
    `.replace(/\s{2,}/g, '\n').trim();

    await fs.writeFile(html, template, 'utf8');

    let result = await getRandStreetview();

    await fs.unlink(html);

    return result;

  } else {

    throw new Error('key is required');

  }

}

module.exports = run;

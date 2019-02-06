const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const html = (__dirname + '/temp.html');

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

    fs.writeFileSync(html, template, 'utf8');

    let result = await getRandStreetview();

    fs.unlinkSync(html);

    return result;

  } else {

    throw new Error('key is required');

  }

}

async function getRandStreetview() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`file://${path.resolve(html)}`);

  // Debugging:
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.waitFor(() => typeof(panoData) !== 'undefined') // <== WAITING

  let result = await page.evaluate(() => panoData);

  browser.close();

  return result;

}

module.exports = run;

const streetview = require('./index');

const key = require('./key');

(async function start() {

  console.log('before');

  const options = {
    debug: true,
    key: key,
    startingCoords: {
      // Starting lattitude/longitud; defaults to random lat/lon:
      latitude: 39.8283,
      longitude: 98.5795
    },
    googlePanosOnly: false // Set to true if you only want Google panorama data.
  };

  try {

    let result = await streetview();

    console.log(result); // { latitude: 32, longitude: 96.5 }

  } catch(err) {

    console.log(err);

  }

  console.log('after');

})();

const streetview = require('./index');

const key = require('./key');

(async function start() {

  console.log('before');

  const options = {
    debug: true,
    key: key,
    // startingCoords: {
    //   latitude: 39.8283,
    //   longitude: 98.5795
    // },
  };

  try {

    let result = await streetview(options);

    console.log(result); // { latitude: 32, longitude: 96.5 }

  } catch(err) {

    console.log(err);

  }

  console.log('after');

})();

const streetview = require('./index');

const key = require('./key');

(async function start() {

  console.log('before');

  const options = {
    debug: true,
    throttle: 2,
    key: key,
    attempts: 15,
    // coords: {
    //   latitude: 39.8283,
    //   longitude: 98.5795
    // },
  };
  const getRandomLatLon = () => {

    return {
      latitude: (Math.round(Math.acos(2 * Math.random() - 1) * 180 / Math.PI) - 90),
      longitude: (Math.floor(Math.random() * 360) - 180),
    };

  };

  try {

    let result;

    await (async function recursor(counter = 0) {

      counter++;

      options.coords = getRandomLatLon();

      console.log(options.coords, counter);

      let data = await streetview(options);

      data = JSON.parse(data);

      // We only want official Google panoramas:
      if ((data.status == 'error') || ( ! data.copyright.toLowerCase().includes('google'))) {

        if (counter <= 5) {

          console.log('');
          console.log(`Recursing: ${counter -1}`);

          await recursor(counter);

        } else {

          throw new Error(`Max recursion reached: ${counter - 1}`);

        }

      } else {

        console.log('Found:', data);

        result = data;

      }

    })();

    console.log(result);

  } catch(err) {

    console.log(err);

  }

  console.log('after');

})();

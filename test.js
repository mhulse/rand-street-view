const streetview = require('./index');

const key = require('./key');

(async function start() {

  console.log('before');
  console.log('');

  const options = {
    debug: true,
    throttle: 2,
    key: key,
    attempts: 15,
    // google: true,
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

      options.coords = (options.coords || getRandomLatLon());

      console.log('Coordinates:', options.coords);
      console.log('Counter:', counter);
      console.log('');

      console.log('Searching for panorama, please wait …');
      console.log('');

      let data = await streetview(options);

      data = JSON.parse(data);

      if (data.status == 'error') {

        if (counter <= 5) {

          console.log('');
          console.log(`Recursing: ${counter -1}`);

          await recursor(counter);

        } else {

          throw new Error(`Max recursion reached: ${counter - 1}`);

        }

      } else {

        // console.log('Found:', data);

        result = data;

      }

    })();

    console.log(result);

  } catch(err) {

    console.log(err);

  }

  console.log('');
  console.log('after');

})();

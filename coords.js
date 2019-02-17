(function(coords, google, JSON, window, undefined) {

  let streetViewService = {};
  let o = {};
  let counter;

  const getPanorama = () => {

    let latLon = {};

    // (re)Initialize:
    counter = 0;

    if (o.coords && o.coords.latitude && o.coords.longitude) {

      // Use custom starting cooridinates:
      latLon = o.coords;

    } else {

      // Use randomly-generated cooridinates:
      latLon = getRandomLatLon();

    }

    console.log(getGoogleMapsLink(latLon.latitude, latLon.longitude));

    getNearestPanorama(new google.maps.LatLng(latLon.latitude, latLon.longitude));

  };

  const getGoogleMapsLink = (latitude, longitude, zoom = 0) => {

    // console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Zoom: ${zoom}`);

    return `https://maps.google.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=${zoom}`;

  }

  const getRandomLatLon = () => {

    // https://stackoverflow.com/a/46210570/922323
    let randomLatitude = (Math.round(Math.acos(2 * Math.random() - 1) * 180 / Math.PI) - 90);
    let randomLongitude = (Math.floor(Math.random() * 360) - 180);

    return {
      latitude: randomLatitude,
      longitude: randomLongitude,
    };

  };

  // This must be called on success AND failure (so Puppeteer knows it can exit):
  const setWindowPanoData = (data) => {

    // Looks like Puppeteer prefers new objects like `window.panoData`
    // vs. nested objects like `coords.panoData`.
    window.panoData = JSON.stringify(data);

    console.log(`Pano data: ${window.panoData}`);

  };

  const getNearestPanorama = (coords, bounds) => {

    let radius = (bounds || o.radius); // Meters!

    console.log(`Searching within a ${radius} meter (${(radius * 0.00062137).toFixed(2)} miles) radius of ${coords.lat()},${coords.lng()}.`);

    // The `getPanoramaByLocation` retrieves the `StreetViewPanoramaData`
    // for a panorama within a given radius of the given `LatLng`.
    // Note that this method is no longer documented in the API.
    streetViewService.getPanoramaByLocation(
      coords,
      radius,
      (data) => {

        let found = (data && data.location && data.location.latLng);

        if (
          (found && ( ! o.google))
          ||
          (found && o.google && data.copyright.toLowerCase().includes('google'))
        ) {

          console.log('Found!');

          let loc = data.location.latLng;
          let foundLatitude = loc.lat();
          let foundLongitude = loc.lng();
          let link = getGoogleMapsLink(foundLatitude, foundLongitude);

          console.log(link);

          // console.log(data);

          setWindowPanoData({
            status: 'success',
            message: `Panorama found within ${counter} attempts.`,
            lat: foundLatitude,
            lng: foundLongitude,
            id: data.location.pano,
            copyright: data.copyright,
            description: loc.description,
            link: link,
            tiles: data.tiles,
            image_key: (data.takeDownUrl && (() => {
              let searchParams = new URLSearchParams(data.takeDownUrl);
              return searchParams.get('image_key').split('2s')[1];
            })() || ''),
          });

        } else {

          counter++;

          console.log('Panorama not found!');

          if (counter < o.attempts) {

            console.log(`Restarting in ${o.throttle} second(s).`);

            console.log(`${o.attempts - counter} attempts remaining.`)

            setTimeout(
              getNearestPanorama,
              (o.throttle * 1000),
              coords,
              (radius * o.multiplier)
            );

          } else {

            setWindowPanoData({
              status: 'error',
              message: `Maximum of ${o.attempts} attempts reached.`
            });

          }

        }

      }

    );

  };

  coords.init = (options = {}) => {

    o = options;

    // A `StreetViewService` object performs searches for Street View data:
    streetViewService = new google.maps.StreetViewService();

    getPanorama();

  };

})(window.coords = (window.coords || {}), google, JSON, window);

document.addEventListener('DOMContentLoaded', function(event) {

  // Stringifying for `stdout` and `stderr` into `process.stdout` and `process.stderr`:
  console.log(`Options: ${JSON.stringify(window.options)}`);

  window.coords.init(window.options);

});

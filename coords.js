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
      latlon = o.coords;

    } else {

      // Use randomly-generated cooridinates:
      latLon = getRandomLatLng();

    }

    logGoogleMapsLink(latlon.latitude, latlon.longitude);

    getNearestPanorama(new google.maps.LatLng(latlon.latitude, latlon.longitude));

  };

  const logGoogleMapsLink = (latitude, longitude, zoom = 0) => {

    console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Zoom: ${zoom}`);

    console.log(`https://maps.google.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=${zoom}`);

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
      (panoData) => {

        if (panoData && panoData.location && panoData.location.latLng) {

          console.log('Found!');

          let loc = panoData.location.latLng;
          let foundLatitude = loc.lat();
          let foundLongitude = loc.lng();

          logGoogleMapsLink(foundLatitude, foundLongitude);

          setWindowPanoData({
            status: 'success',
            message: `Panorama found within ${counter} attempts.`,
            lat: foundLatitude,
            lng: foundLongitude,
            id: panoData.location.pano,
            copyright: panoData.copyright,
            description: loc.description,
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

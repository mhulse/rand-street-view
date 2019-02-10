(function(coords, google, JSON, window, undefined) {

  let streetViewService = {};
  let o = {};

  const getPanorama = () => {

    let latLon = getRandomLatLng();

    setNearestPanorama(latLon);

  };

  const getGoogleMapsLink = (latitude, longitude, zoom = 0) => {

    console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Zoom: ${zoom}`);

    return `https://maps.google.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=${zoom}`;

  }

  const getRandomLatLng = () => {

    // https://stackoverflow.com/a/46210570/922323
    let randomLatitude = (Math.round(Math.acos(2 * Math.random() - 1) * 180 / Math.PI) - 90);
    let randomLongitude = (Math.floor(Math.random() * 360) - 180);

    console.log(getGoogleMapsLink(randomLatitude, randomLongitude));

    return new google.maps.LatLng(randomLatitude, randomLongitude);

  };

  const setNearestPanorama = (coords, bounds) => {

    let checkAround = (bounds || o.boundsRadius); // Meters!

    streetViewService.getPanoramaByLocation(
      coords,
      checkAround,
      (panoData) => {

        if (panoData && panoData.location && panoData.location.latLng) {

          console.log('Found!');

          let loc = panoData.location.latLng;
          let foundLatitude = loc.lat();
          let foundLongitude = loc.lng();

          console.log(getGoogleMapsLink(foundLatitude, foundLongitude));

          // Looks like puppeteer prefers new objects like `window.panoData`
          // vs. nested objects like `coords.panoData`.
          window.panoData = JSON.stringify({
            lat: foundLatitude,
            lng: foundLongitude,
            id: panoData.location.pano,
            copyright: panoData.copyright,
            description: loc.description,
          });

          console.log(window.panoData);

        } else {

          console.log('Not found!');

          setTimeout(
            setNearestPanorama,
            (o.throttleSeconds * 1000),
            coords,
            (checkAround * o.boundsRadiusMultiplier)
          );

        }

      }

    );

  };

  coords.init = (options = {}) => {

    o = options;

    streetViewService = new google.maps.StreetViewService();

    getPanorama();

  };

})(window.coords = (window.coords || {}), google, JSON, window);

document.addEventListener('DOMContentLoaded', function(event) {

  // Stringifying for `stdout` and `stderr` into `process.stdout` and `process.stderr`:
  console.log(`Options: ${JSON.stringify(window.options)}`);

  window.coords.init(window.options);

});

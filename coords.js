(function(coords, google, JSON, window, undefined) {

  let streetViewService = {};
  let o = {};
  let counter;

  const getPanorama = (randomize = false) => {

    let latlon = {};

    // (re)Initialize:
    counter = 0;

    if (( ! randomize) && o.startingCoords && o.startingCoords.latitude && o.startingCoords.longitude) {

      latlon = o.startingCoords;

    } else {

      latlon = getRandomLatLon();

    }

    setNearestPanorama(new google.maps.LatLng(latlon.latitude, latlon.longitude));

  };

  const getRandomLatLon = () => {

    return {
      latitude: ((Math.random() * Math.max((180 * 0.25), 120)) - (90 - Math.min(0.25, 45))),
      longitude: ((Math.random() * 360) - 180)
    };

  };

  setNearestPanorama = (coords, bounds) => {

    let checkAround = (bounds || 100); // Meters!

    streetViewService.getPanoramaByLocation(coords, checkAround, (panoData) => {

      if (panoData && panoData.location && panoData.location.latLng) {

        console.log('Found!', panoData.copyright);

        if (( ! o.googlePanosOnly) || (o.googlePanosOnly && panoData.copyright.toLowerCase().includes('google'))) {

          let loc = panoData.location.latLng;

          // Looks like puppeteer prefers new objects vs. nested objects (e.g. `coords.panoData`):
          window.panoData = JSON.stringify({
            lat: loc.lat(),
            lng: loc.lng(),
            id: panoData.location.pano,
            copyright: panoData.copyright,
          });

          console.log(window.panoData);

        } else if (o.restart) {

          console.log('New search!');

          // At this point, we’re going to assume any `startingCoords` failed us,
          // and fall back to randomized latitude/longitude picks:
          getPanorama(true);

        }

      } else {

        counter++;

        console.log('Not found!', checkAround, counter);

        // Not finding any panos?
        if (o.maxRestarts && (counter >= o.restartAfter)) {

          // Screw it, let’s start over:
          getPanorama(true);

        } else {

          // Throttling requests:
          setTimeout(setNearestPanorama, (o.throttleSeconds * 1000), coords, (checkAround * 2));

        }

      }

    });

  };

  coords.init = (options = {}) => {

    o = options;

    streetViewService = new google.maps.StreetViewService();

    getPanorama();

  };

})(window.coords = (window.coords || {}), google, JSON, window);

document.addEventListener('DOMContentLoaded', function(event) {

  window.coords.init(window.options);

});

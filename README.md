# rand-steet-view

Get random Google Street View data.

## Options

option | default | description
--- | --- | ---
`key` | | Required. **Your** [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).
`coords` | | Custom starting coordinates in the form of `{lattitude:0, longitude:0}`. If not defined, randomly picked coordinates will be used.
`debug` | `false` | Among other things, this option pipes the browser process `stdout` and `stderr` into `process.stdout` and `process.stderr`.
`radius` | `100` | Starting radius (in meters) from given `LatLng` to look for `StreetViewPanoramaData`.
`multiplier` | `2` | Exponentially grows the radius by this number on each attempt.
`attempts` | `1` | Number of times the script should grow the radius to search for a nearby panorama.
`throttle` | `1` | Seconds to delay next API call to search for a panorama.

## Development

Notes pertaining to module development … More information coming soon.

## Debugging the Google Maps HTML

Set `debug` to `true`. Next, locate `templ.html` and open it in Chrome and enable the Web Developer Toolbar.

## Google Maps API key

In order to make testing easier, create a `key.js` file and add in your [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key):

```js
// Non-functional example key (you’ll have to generate your own):
module.exports = 'AIzaSyDNuylDKnjnYY46zkORPEt2-g4HK3O6wnw';
```

## License

Copyright © 2019 [Michael Hulse](http://mky.io).

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

<img src="https://github.global.ssl.fastly.net/images/icons/emoji/octocat.png">

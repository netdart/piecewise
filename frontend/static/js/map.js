var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

const bounds = [
  [-167, 16], // Southwest coordinates
  [-46, 72] // Northeast coordinates
];

let geojson;

// fetch data from api
const getjson = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getjson('$PIECEWISE_BACKEND_URL', (error, data) => {
  if (error !== null) {
    alert('Something went wrong: ' + error);
  } else {
    geojson = data;

    const allPoints = geojson.map(point => ({
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [
              [point.longitude, point.latitude]
            ],
        },
        properties: {
          isp_user: point.survey_service_type,
          other_isp: point.survey_service_type_other,
          cost_of_service: point.survey_current_cost,
          advertised_download: point.survey_subscribe_download,
          advertised_upload: point.survey_subscribe_upload,
          actual_download: point.actual_download,
          actual_upload: point.actual_upload,
          min_rtt: point.min_rtt,
        }
    }));

    geojson = {
      "type": "FeatureCollection",
      "features": allPoints
    }
  }
})

const mapContainer = document.getElementById('Map');
const main = document.getElementsByClassName('main')[0];
const survey = document.getElementById('SurveyForm');
const results = document.getElementById('results');
const loader = document.getElementById('Loader');

// only create map if the survey and map container exist on the page
// if so, build the Mapbox map
if (!!survey && !!mapContainer) {

  const map = new mapboxgl.Map({
    container: 'Map',
    center: [-79.2407191, 35.2712601],
    maxBounds: bounds,
    style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
    zoom: 6,
  });

  map.on('load', function() {

    map.addSource('points', {
      'type': 'geojson',
      'data': geojson
    })

    map.addLayer({
      'id': 'points',
      'type': 'circle',
      'source': 'points',
      'paint': {
        'circle-radius': 10,
        'circle-color': '#ff442b',
        'circle-opacity': 0.6
      }
    });

    geojson.features.forEach(function(marker) {

      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'marker';

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates.flat())
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
        .addTo(map);

    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'points', function() {
      map.getCanvas().style.cursor = 'pointer';
      console.log('on item');
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'points', function() {
      map.getCanvas().style.cursor = '';
      console.log('off item');
    });

    survey.addEventListener('submit', logSubmit);

    function logSubmit(event) {
      console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);

      main.classList.add('visually-hidden');
      survey.classList.add('visually-hidden');
      loader.classList.remove('visually-hidden');
      results.classList.remove('visually-hidden');

      const userLatitude = document.getElementById('latitude').value;
      const userLongitude = document.getElementById('longitude').value;

      console.log('LOCATION: ', userLatitude, userLongitude);

      const userData = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [userLongitude, userLatitude],
            ]
          }
        }]
      }

      userData.features.forEach(function(marker) {

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates.flat())
          .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
          .addTo(map);
      });
    }
  });
}

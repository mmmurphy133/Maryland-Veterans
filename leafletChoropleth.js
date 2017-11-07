////////////////////////////////////////////////////////////////////////////////
// initialize the map
var coords = [38.9, -76.84]; // map center point
var zoom = 8.5; // map zoom level lower number is out higher number is in
var map = L.map('map').setView(coords, zoom); // put it all together

////////////////////////////////////////////////////////////////////////////////
// load a basemap tile layer
L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  maxZoom: 60,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Data by <a href="https://github.com/mmmurphy133">Meghan Murphy</a>'
}).addTo(map);

////////////////////////////////////////////////////////////////////////////////
// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML = '<h4>Number of Veterans</h4>' + '</br>' + '<h4>Per County</h4>' + (props ?
    '<b>' + props.county + '</b><br />' + props.vets + ' vets' :
    'Hover over a county');
};

info.addTo(map);

////////////////////////////////////////////////////////////////////////////////
// get color depending on population density value
function getColor(d) {
  return d > 33000 ? '#CB181D' :
    d > 13000 ? '#FB6A4A' :
    d > 5500 ? '#FCAE91' :
    '#FEE5D9';
}
// set color of the json based on its Population Density
function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.vets)
  };
}
// highlightFeature function
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

// temporary map.getCenter() function
map.on('moveend', function(e) {
   var bounds = map.getCenter();
   console.log(bounds);
});

var geojson;
// reset previously highlighted feature function
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}
// zoom to feature function
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}
// tie functions to DOM events like onClick etc.
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}
// specify the functions will execute on statesData
geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

////////////////////////////////////////////////////////////////////////////////
// customize map attribution in lower left corner
map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

////////////////////////////////////////////////////////////////////////////////
// add legend layer to map at the given position
var legend = L.control({
  position: 'bottomright'
});
// populate legend with provided data referencing color of statesData at break points
legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 5500, 13000, 33000],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};
// add legend to map
legend.addTo(map);

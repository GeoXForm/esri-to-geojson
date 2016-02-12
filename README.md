# GeoJSON
*Converts Esri JSON and CSV to GeoJSON format*

Example: Convert Esri JSON to GeoJSON
```javascript
const GeoJSON = require('geojson')

GeoJSON.fromEsri([], esri.json, (err, geojson) => {
    console.log(geojson);
});
```
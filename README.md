[![Build Status](https://travis-ci.org/GeoXForm/esri-to-geojson.svg?branch=master)](https://travis-ci.org/GeoXForm/esri-to-geojson)

# esri-to-geojson

*Converts Esri JSON and CSV to GeoJSON format*

Besides translating geometries this project **make changes** to
actual field values.

* decoding domains
* creating x & y fields from CSVs
* Translate date fields to be human readable text


Example: Convert Esri JSON to GeoJSON
```js
const GeoJSON = require('geojson')
const CSV = require('csv')
const input = '"y","x"\n"-180","90"\n"30","-60"'

const options = [{
        name: 'NAME',
        type: 'esriFieldTypeSmallInteger',
        alias: 'NAME',
        domain: {
            type: 'codedValue',
            name: 'NAME',
            codedValues: [
                {
                    name: 'Name0',
                    code: 0
                },
                {
                    name: 'Name1',
                    code: 1
                }
            ]
        }
    }]
    const esriJSON = {
        features: [{
            attributes: {
                NAME: 0
            }
        }, {
            attributes: {
                NAME: 1
            }
        }]
    }

const geojson = GeoJSON.fromEsri(esriJSON, options)

console.log(geojson)

csv.parse(input, (err, output) => {
    const csvGeoJSON = GeoJSON.fromCSV(output)
    console.log(csvGeoJSON)
})

```

## Set up

esri-to-geojson should be installed as a dependency in a Node.js project like so:

- `npm install esri-to-geojson --save`


## Development

### Install dependencies
- `npm install`

### Transpile to ES5
- `npm compile`

### Test
- `npm test`


## API
### `GeoJSON.fromEsri(esriJSON, options)`
Converts Esri JSON to GeoJSON
- esriJSON: the entire Esri JSON object
- Options:
``` javascript
{
    fields: array // fields object returned from esri json
}

```

### `GeoJSON.fromCSV(csv)`
Converts CSV to GeoJSON
- csv: csv file parsed using https://www.npmjs.com/package/csv

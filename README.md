[![Build Status](https://travis-ci.org/koopjs/EsriToGeojson.svg?branch=master)](https://travis-ci.org/koopjs/EsriToGeojson)

# GeoJSON
*Converts Esri JSON and CSV to GeoJSON format*

## Install

EsriToGeojson should be installed as a dependency in a Node.js project like so:

```
npm install esritogeojson --save
```

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

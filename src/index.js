'use strict'

const arcgisToGeoJSON = require('arcgis-to-geojson-utils').arcgisToGeoJSON
const _ = require('lodash')
const toGeoJSON = {}


/**
 * Converts csv to geojson
 *
 * @param {array} csv - csv file parsed using https://www.npmjs.com/package/csv
 * @returns {object} geojson - geojson object
 * */

toGeoJSON.fromCSV = (csv) => {
    const geojson = { type: 'FeatureCollection', features: [] }
    let lat = null
    let lon = null
    let feature, headers

    csv.forEach( (row, i) => {
        if (i === 0) {
            headers = row

            // Search a whitelist of lat/longs to try to build a geometry

            headers.forEach((h, i) => {
                switch (h.trim().toLowerCase()) {
                    case 'lat':
                    case 'latitude':
                    case 'latitude_deg':
                    case 'y':
                        lat = i + ''
                        break
                    case 'lon':
                    case 'longitude':
                    case 'longitude_deg':
                    case 'x':
                        lon = i + ''
                        break
                }
            })
        } else {
            feature = { type: 'Feature', id: i, properties: {}, geometry: null }

            row.forEach((col, j) => {
                const colNum = col.replace(/,/g, '')
                feature.properties[headers[j]] = (!isNaN(colNum)) ? parseFloat(colNum) : col
            })

            // add an object to csv data
            feature.properties.OBJECTID = i

            if (lat && lon) {
                feature.geometry = {
                    type: 'Point',
                    coordinates: [parseFloat(row[parseInt(lon, 10)]), parseFloat(row[parseInt(lat, 10)])]
                }
            }
            geojson.features.push(feature)
        }
    })

    return geojson ? geojson : null
}

/**
 * Converts esri json to GeoJSON
 *
 * @param {object} esriJSON - The entire esri json response
 * @param {object} options - The fields object returned in esri json
 * @returns {object} geojson - geojson object
 *
 * */


toGeoJSON.fromEsri = (esriJSON, options) => {

    if (!options) options = {}
    if (!options.fields) options.fields = esriJSON.fields

    let geojson = { type: 'FeatureCollection' }
    const fields = convertFields(options.fields)

    geojson.features = _.map(esriJSON.features, (feature) => {
        return transformFeature(feature, fields)
    })

    return geojson ? geojson : null
}


/**
 * Converts a set of fields to have names that work well in JS
 *
 * @params {object} inFields - the original fields object from the esri json
 * @returns {object} fields - converted fields
 * @private
 * */

function convertFields(infields) {
    const fields = {}

    _.each(infields, (field) => {
        field.outName = convertFieldName(field.name)
        fields[field.name] = field
    })
    return fields
}


/**
 * Converts a single field name to a legal javascript object key
 *
 * @params {string} name - the original field name
 * @returns {string} outName - a cleansed field name
 * @private
 * */

function convertFieldName(name) {
    const regex = new RegExp(/\.|\(|\)/g)
    return name.replace(regex, '')
}


/**
 * Converts a single feature from esri json to geojson
 *
 * @param {object} feature - a single esri feature
 * @param {object} fields - the fields object from the service
 * @returns {object} feature - a geojson feature
 * @private
 * */

function transformFeature(feature, fields) {
    const attributes = {}

    // first transform each of the features to the converted field name and transformed value
    if (feature.attributes && Object.keys(feature.attributes)) {
        _.each(Object.keys(feature.attributes), (name) => {
            let attr = {}
            attr[name] = feature.attributes[name]
            try {
                attributes[fields[name].outName] = convertAttribute(attr, fields[name])
            } catch (e) {
                console.error('Field was missing from attribute')
            }
        })
    }

    return {
        type: 'Feature',
        properties: attributes,
        geometry: parseGeometry(feature.geometry)
    }
}

/**
 * Decodes an attributes CVD and standardizes any date fields
 *
 * @params {object} attribute - a single esri feature attribute
 * @params {object} field - the field metadata describing that attribute
 * @returns {object} outAttribute - the converted attribute
 * @private
 * */

function convertAttribute(attribute, field) {
    const inValue = attribute[field.name]
    let value

    if (inValue === null) return inValue

    if (field.domain && field.domain.type === 'codedValue') {
        value = cvd(inValue, field)
    } else if (field.type === 'esriFieldTypeDate') {
        try {
            value = new Date(inValue).toISOString()
        } catch (e) {
            value = inValue
        }
    } else {
        value = inValue
    }
    return value
}

/**
 * Looks up a value from a coded domain
 *
 * @params {integer} value - The original field value
 * @params {object} field - metadata describing the attribute field
 * @returns {string/integerfloat} - The decoded field value
 * */

function cvd(value, field) {
    const domain = _.find(field.domain.codedValues, d => {
        return value === d.code
    })
    return domain ? domain.name : value
}

/**
 * Convert an esri geometry to a geojson geometry
 *
 * @param {object} geometry - an esri geometry object
 * @return {object} geojson geometry
 * @private
 * */

function parseGeometry(geometry) {
    try {
        const parsed = geometry ? arcgisToGeoJSON(geometry) : null
        if (parsed && parsed.type && parsed.coordinates) return parsed
        else {
            return null
        }

        return parsed
    } catch (e) {
        console.error(e)
        return null
    }
}


module.exports = toGeoJSON
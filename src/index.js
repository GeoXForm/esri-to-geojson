'use strict'

const arcgisToGeoJSON = require('arcgis-to-geojson-utils').arcgisToGeoJSON
const _ = require('lodash')
const toGeoJSON = {}


/**
 * Converts esri json to GeoJSON
 *
 * @param {object} esriJSON - The entire esri json response
 * @param {object} options - The fields object returned in esri json
 *
 * */


toGeoJSON.fromEsri = (esriJSON, options) => {
    if (!options || !options.length) options = esriJSON.fields
    let geojson = { type: 'FeatureCollection' }
    const fields = convertFields(options)

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
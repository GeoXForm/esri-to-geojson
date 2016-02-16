'use strict'

const test = require('tape')
const GeoJSON = require('../')
const esri_json = require('./fixtures/esri_json_short.json')
const esri_with_null = require('./fixtures/esri_json_null.json')
const esri_with_invalid = require('./fixtures/esri_json_invalid.json')
const date_json = require('./fixtures/esri_date.json')


/**
 *  GeoJSON.fromEsri tests
 *
 *  When converting esri style features to GeoJSON:
 *      Should return proper geojson object
 *      Should handle malformed null geometries gracefully
 *      Should return null when the geometry is invalid
 *
 *  When converting fields with unix timestamps:
 *      Should convert to ISO strings
 *
 *  When Getting fields with special characters in them:
 *      Should replace periods and parenthesis
 *
 *  When Converting fields with domains:
 *      Should return a proper geojson object
 *      Should not translate an empty field that has a domain
 *
 *  Converting Date Fields:
 *      Should not convert null fields to 1970
 *
 * */

// When converting esri style features to GeoJSON

test('Should return proper geojson object', (assert) => {
    const geojson = GeoJSON.fromEsri(esri_json, [])

    assert.is(typeof geojson, 'object',
        'geojson should return object')

    assert.equal(geojson.length, esri_json.length,
        'GeoJSON and esriJSON should be the same length')

    assert.equal(geojson.features[0].geometry.coordinates.length, 2,
        'GeoJSON.geometry.coordinates length should equal 2')

    assert.equal(geojson.features[0].geometry.type, 'Point',
        'GeoJSON type should return "Point"')

    assert.equal(Object.keys(geojson.features[0].properties).length, 22,
        'GeoJSON properties should return a count of 22')

    assert.end()
})

test('Should handle malformed null geometries gracefully', (assert) => {
    const geojson = GeoJSON.fromEsri(esri_with_null, [])

    assert.equal(geojson.features.length, 1,
        'Malformed null geometries should return a single feature')

    assert.end()
})

test('Should return null when the geometry is invalid', (assert) => {
    const geojson = GeoJSON.fromEsri(esri_with_invalid, [])

    assert.notOk(geojson.features[0].geometry,
        'Geometries should be null')

    assert.end()
})


// When converting fields with unix timestamps

test('when converting fields with unix timestamps', (assert) => {
    const geojson = GeoJSON.fromEsri(date_json, null)

    assert.equal(geojson.features[0].properties.last_edited_date, '2015-05-20T18:47:50.000Z',
        'should convert to ISO strings')

    assert.end()
})


// When getting fields with special characters in them

test('when getting fields with special characters in them', (assert) => {
    const geojson = GeoJSON.fromEsri(date_json, null)

    assert.ok(geojson.features[0].properties.EVTRT,
        'should replace periods and parentheses')

    assert.end()
})


// when converting fields with domains

test('Should return a proper geojson object', (assert) => {
    const fields = [{
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

    const json = {
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
    const geojson = GeoJSON.fromEsri(json, fields)

    assert.is(typeof geojson, 'object',
        'GeoJSON should be a object')

    assert.equal(geojson.features.length, json.features.length,
        'geojson length should equal json length')

    assert.equal(geojson.features[0].properties.NAME, fields[0].domain.codedValues[0].name,
        'NAME should equal Name0')

    assert.equal(geojson.features[1].properties.NAME, fields[0].domain.codedValues[1].name,
        'NAME should equal Name1')

    assert.end()

})


test('Should not translate an empty field that has a domain', (assert) => {
    const fields = [{
        name: 'ST_PREFIX',
        type: 'esriFieldTypeString',
        alias: 'ST_PREFIX',
        length: 3,
        domain: {
            type: 'codedValue',
            name: 'Prefix',
            codedValues: [
                {
                    name: 'N',
                    code: 'N'
                },
                {
                    name: 'S',
                    code: 'S'
                },
                {
                    name: 'E',
                    code: 'E'
                },
                {
                    name: 'W',
                    code: 'W'
                }
            ]
        }
    }]

    const json = {
        features: [{
            attributes: {
                ST_PREFIX: ' '
            }
        }]
    }

    const geojson = GeoJSON.fromEsri(json, fields)

    assert.is(typeof geojson, 'object',
        'geojson should be an object')

    assert.equals(geojson.features.length, json.features.length,
        'geojson and json lengths should equal')

    assert.equals(geojson.features[0].properties.ST_PREFIX, json.features[0].attributes.ST_PREFIX,
        'ST_prefixes should match')

    assert.end()
})


// converting date fields

test('converting date fields', (assert) => {
    const fields = [{
        name: 'date',
        type: 'esriFieldTypeDate',
        alias: 'date'
    }]

    const json = {
        features: [{
            attributes: {
                date: null
            }
        }]
    }

    const geojson = GeoJSON.fromEsri(json, fields)

    assert.notOk(geojson.features[0].properties.date,
        'should not convert null fields to "1970"')

    assert.end()
})

















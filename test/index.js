'use strict'

const test = require('tape')
const csv = require('csv')
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

test('Should return proper geojson object', (t) => {
    const geojson = GeoJSON.fromEsri(esri_json, {})

    t.is(typeof geojson, 'object',
        'geojson should return object')

    t.equal(geojson.length, esri_json.length,
        'GeoJSON and esriJSON should be the same length')

    t.equal(geojson.features[0].geometry.coordinates.length, 2,
        'GeoJSON.geometry.coordinates length should equal 2')

    t.equal(geojson.features[0].geometry.type, 'Point',
        'GeoJSON type should return "Point"')

    t.equal(Object.keys(geojson.features[0].properties).length, 22,
        'GeoJSON properties should return a count of 22')

    t.end()
})

test('Should handle malformed null geometries gracefully', (t) => {
    const geojson = GeoJSON.fromEsri(esri_with_null, {})

    t.equal(geojson.features.length, 1,
        'Malformed null geometries should return a single feature')

    t.end()
})

test('Should return null when the geometry is invalid', (t) => {
    const geojson = GeoJSON.fromEsri(esri_with_invalid, {})

    t.notOk(geojson.features[0].geometry,
        'Geometries should be null')

    t.end()
})


// When converting fields with unix timestamps

test('when converting fields with unix timestamps', (t) => {
    const geojson = GeoJSON.fromEsri(date_json, null)

    t.equal(geojson.features[0].properties.last_edited_date, '2015-05-20T18:47:50.000Z',
        'should convert to ISO strings')

    t.end()
})


// When getting fields with special characters in them

test('when getting fields with special characters in them', (t) => {
    const geojson = GeoJSON.fromEsri(date_json, null)

    t.ok(geojson.features[0].properties.EVTRT,
        'should replace periods and parentheses')

    t.end()
})


// when converting fields with domains

test('Should return a proper geojson object', (t) => {
    const fields = {
        fields: [{
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
    }

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

    t.is(typeof geojson, 'object',
        'GeoJSON should be a object')

    t.equal(geojson.features.length, json.features.length,
        'geojson length should equal json length')

    t.equal(geojson.features[0].properties.NAME, fields.fields[0].domain.codedValues[0].name,
        'NAME should equal Name0')

    t.equal(geojson.features[1].properties.NAME, fields.fields[0].domain.codedValues[1].name,
        'NAME should equal Name1')

    t.end()

})


test('Should not translate an empty field that has a domain', (t) => {
    const fields = {
        fields: [{
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
    }

    const json = {
        features: [{
            attributes: {
                ST_PREFIX: ' '
            }
        }]
    }

    const geojson = GeoJSON.fromEsri(json, fields)

    t.is(typeof geojson, 'object',
        'geojson should be an object')

    t.equals(geojson.features.length, json.features.length,
        'geojson and json lengths should equal')

    t.equals(geojson.features[0].properties.ST_PREFIX, json.features[0].attributes.ST_PREFIX,
        'ST_prefixes should match')

    t.end()
})


// converting date fields

test('converting date fields', (t) => {
    const fields = {
        fields: [{
            name: 'date',
            type: 'esriFieldTypeDate',
            alias: 'date'
        }]
    }

    const json = {
        features: [{
            attributes: {
                date: null
            }
        }]
    }

    const geojson = GeoJSON.fromEsri(json, fields)

    t.notOk(geojson.features[0].properties.date,
        'should not convert null fields to "1970"')

    t.end()
})


/**
 * GeoJson.fromCSV tests
 *
 * When converting esri style features to GeoJSON:
 *      Should return proper geojson object
 *      Should handle malformed null geometries gracefully
 *      Should return null when the geometry is invalid
 *
 * */

test('Should return a valid geojson object', (t) => {
    const input = '"y","x"\n"-180","90"\n"30","-60"'
    csv.parse(input, (err, output) => {
        const geojson = GeoJSON.fromCSV(output)

        t.is(typeof geojson, 'object',
            'Geojson should return object')

        t.equal(geojson.features[0].geometry.coordinates.length, 2,
            'GeoJSON.geometry.coordinates length should equal 2')

        t.equal(geojson.features[0].geometry.type, 'Point',
            'GeoJSON type should return "Point"')

        t.equal(Object.keys(geojson.features[0].properties).length, 3,
            'GeoJSON properties should return a count of 3')

        t.end()
    })
})

test('Should handle invalid geometry', (t) => {
    const input = '"fakeY","fakeX"\n"-180","90"\n"30","-60"'
    csv.parse(input, (err, output) => {
        const geojson = GeoJSON.fromCSV(output)

        t.is(typeof geojson, 'object',
            'geojson should return object')

        t.notOk(geojson.features[0].geometry, 'geometries should be null')

        t.end()
    })
})

test('Should take any number of columns', (t) => {
    const input = '"y","x","name","sentiment"\n"-180","90","tweet1","positive"\n"30","-60","tweet2","negative"'
    csv.parse(input, (err, output) => {
        const geojson = GeoJSON.fromCSV(output)

        t.is(typeof geojson, 'object',
            'Geojson should return object')

        t.equal(Object.keys(geojson.features[0].properties).length, 5,
            'GeoJson should return proper number of properties')

        t.end()
    })
})

test('Should sanitize illegal characters', (t) => {
    const input = '"y","x","name.Says","sentiment opinion"\n"-180","90","tweet1","positive"\n"30","-60","tweet2","negative"'
    csv.parse(input, (err, output) => {
        const geojson = GeoJSON.fromCSV(output)

        t.is(typeof geojson, 'object',
            'Geojson should return object')

        t.equal(Object.keys(geojson.features[0].properties).length, 5,
            'Geojson should return proper number of properties')

        t.ok(geojson.features[0].properties.nameSays,
            'name.Says should be sanitized to nameSays')

        t.ok(geojson.features[0].properties.sentiment_opinion,
            'spaces should be sanitized to _')

        t.end()
    })
})

test('Should handle a variety of x/y column names', (t) => {
    const input = [
        '"y","x"\n"-180","90"\n"30","-60"',
        '"lat","lon"\n"-180","90"\n"30","-60"',
        '"latitude","longitude"\n"-180","90"\n"30","-60"',
        '"latitude_deg","longitude_deg"\n"-180","90"\n"30","-60"'
    ]
    input.forEach((inp) => {
        csv.parse(inp, (err, output) => {
            t.test('x/y Column', (t) => {
                const geojson = GeoJSON.fromCSV(output)

                t.is(typeof geojson, 'object',
                    'Geojson should return object')

                t.equal(geojson.features[0].geometry.coordinates.length, 2,
                    'GeoJSON.geometry.coordinates length should equal 2')

                t.equal(geojson.features[0].geometry.type, 'Point',
                    'GeoJSON type should return "Point"')

                t.equal(Object.keys(geojson.features[0].properties).length, 3,
                    'GeoJSON properties should return a count of 3')
                t.end()
            })
        })
    })
    t.end()
})

'use strict';

const fs = require('fs');
const should = require('should/as-function');
const Geo = require('../main');
const binarySearch = require('../lib/helpers').binarySearch;

const fixtures = `${__dirname}/fixtures`;

const dataOne = JSON.parse(fs.readFileSync(`${fixtures}/fixture1.json`, 'utf8'));
const dataTwo = JSON.parse(fs.readFileSync(`${fixtures}/fixture2.json`, 'utf8'));
const dataThree = JSON.parse(fs.readFileSync(`${fixtures}/fixture3.json`, 'utf8'));
const dataFour = fs.readFileSync(`${fixtures}/fixture4.geojson`, 'utf8');
const dataFive = fs.readFileSync(`${fixtures}/fixture5.json`, 'utf8');
const dataSix = fs.readFileSync(`${fixtures}/fixture6.json`, 'utf8');

describe('Geo()', () => {
  describe('.createCompactSet()', () => {
    const unparsedDataThree = fs.readFileSync(`${fixtures}/fixture3.json`, 'utf8');
    const dataSeven = JSON.parse(fs.readFileSync(`${fixtures}/fixture7.json`, 'utf8'));
    const dataEight = JSON.parse(fs.readFileSync(`${fixtures}/fixture8.geojson`, 'utf8'));
    const dataNine = JSON.parse(fs.readFileSync(`${fixtures}/fixture9.geojson`, 'utf8'));
    const dataTen = JSON.parse(fs.readFileSync(`${fixtures}/fixture10.geojson`, 'utf8'));
    describe('from unparsed JSON', () => {
      it('should be ok', () => {
        should(Geo.createCompactSet(unparsedDataThree, { id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon'] })).be.eql(dataOne);
        should(Geo.createCompactSet(unparsedDataThree, { id: '_id', hash: 'geoHash', file: `${fixtures}/temp.tmp` })).be.eql(dataOne);
      });
      it('should throw', () => {
        should(() => Geo.createCompactSet(' ')).throw('data must be correct JSON or GeoJSON');
        should(() => Geo.createCompactSet()).throw('data must be correct JSON or GeoJSON');
      });
    });
    describe('from parsed JSON', () => {
      it('should be ok', () => {
        should(Geo.createCompactSet(dataThree, { id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon'] })).be.eql(dataOne);
        should(Geo.createCompactSet(dataThree, { id: '_id', hash: 'geoHash' })).be.eql(dataOne);
      });
    });
    describe('from unparsed GeoJSON', () => {
      it('should be ok', () => {
        should(Geo.createCompactSet(dataFour, { id: 'name' })).be.eql(dataSeven);
      });
    });
    describe('from parsed GeoJSON', () => {
      it('should be ok', () => {
        should(Geo.createCompactSet(JSON.parse(dataFour), { id: 'name' })).be.eql(dataSeven);
      });
      it('should be an empty array', () => {
        should(Geo.createCompactSet(dataNine)).be.an.empty();
        should(Geo.createCompactSet(dataTen)).be.an.empty();
      });
      it('should throw', () => {
        should(() => Geo.createCompactSet(dataEight)).throw('data must be correct JSON or GeoJSON');
      });
    });
    after(() => {
      fs.unlinkSync(`${fixtures}/temp.tmp`);
    });
  });

  describe('.nearBy() - sorted set', () => {
    describe('with default hash', () => {
      const geoSorted = new Geo(dataOne, { sorted: true });
      it('should be an empty array', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50)).be.empty().Array();
        should(geoSorted.nearBy(64.54, 40.54)).be.empty().Array();
        should(geoSorted.nearBy(64.54)).be.empty().Array();
        should(geoSorted.nearBy()).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });

    describe('with custom hash', () => {
      const geoSorted = new Geo(dataTwo, { hash: 'geoHash', sorted: true });
      it('should be an empty array', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });
  });

  describe('.nearBy() - not sorted set', () => {
    describe('with default hash', () => {
      const geo = new Geo(dataOne);
      const geoLimited = new Geo(dataOne, { limit: 1 });
      it('should be an empty array', () => {
        should(new Geo().nearBy()).be.empty().Array();
        should(geo.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
        should(geoLimited.nearBy(64.54, 40.54, 12000000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
        should(geoLimited.limit(0).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
        should(geoLimited.limit(2).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
        should(geoLimited.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
        should(geoLimited.limit(0).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
        should(geoLimited.limit(2).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });
    describe('with custom hash', () => {
      const geo = new Geo(dataThree, { hash: 'geoHash' });
      it('should be an empty array', () => {
        should(geo.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });
  });

  describe('.nearBy() - sort set', () => {
    describe('with default hash', () => {
      const geoSorted = new Geo(dataOne, { sort: true });
      const geoHuge = new Geo(dataFive, { limit: 100, sort: true });
      it('should be an empty array', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50)).be.empty().Array();
        should(geoHuge.nearBy(-33.87, 151.2, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
        should(geoHuge.limit(1).nearBy(-33.87, 151.2, 12000000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geoSorted.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
        should(geoHuge.limit(1).nearBy(-33.87, 151.2, [50, 500000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoSorted.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });

    describe('with custom hash', () => {
      const geoCustomOptionsHash = new Geo(dataThree, { setOptions: { hash: 'geoHash' } });
      const geoCustomHash = new Geo(dataThree, { hash: 'geoHash', sort: true });
      it('should be an empty array', () => {
        should(geoCustomOptionsHash.nearBy(64.54, 40.54, 50)).be.empty().Array();
        should(geoCustomHash.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geoCustomOptionsHash.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
        should(geoCustomHash.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoCustomOptionsHash.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
        should(geoCustomHash.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geoCustomOptionsHash.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
        should(geoCustomHash.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoCustomOptionsHash.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
        should(geoCustomHash.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });

    describe('with custom set syntax', () => {
      const geoCustom = new Geo(dataThree, { setOptions: { id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon'] } });
      it('should be an empty array', () => {
        should(geoCustom.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geoCustom.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoCustom.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geoCustom.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geoCustom.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
    });

    describe('with GeoJSON set', () => {
      const geo = new Geo(dataFour, { setOptions: { id: 'name', geoJSON: true } });
      it('should be an empty array', () => {
        should(geo.nearBy(64.54, 40.54, 50)).be.empty().Array();
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, 50000)).be.an.Array().with.length(2);
      });
      it('should be an array with 1 element', () => {
        should(geo.limit(1).nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(1);
      });
      it('should be an array with 2 elements', () => {
        should(geo.nearBy(64.54, 40.54, [50, 50000])).be.an.Array().with.length(2);
      });
      it('should throw', () => {
        should(() => new Geo(JSON.parse(dataFour)).nearBy()).throw('data must be an array, for GeoJSON please specify setOptions');
      });
    });
  });
});

describe('helpers', () => {
  describe('.binarySearch()', () => {
    it('should be equal 2', () => {
      should(binarySearch(new Geo(dataSix, { sorted: true }), 3727843024015751, 0, 5)).be.eql(2);
    });
  });
});

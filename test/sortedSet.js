'use strict';

var should = require('should/as-function');
var Geo = require('../main');
var geo;

var data = [
  {i:496285, g:3727718899203691},
  {i:581049, g:3727753082411929},
  {i:518909, g:3727843024015751},
  {i:581043, g:3728383955366409},
  {i:543704, g:3819087592574594}
];

var test = {
  name: 'Geo(data, {sorted: true})',
  data: Geo(data, {sorted: true}),
  lat: 64.54,
  lon: 40.54,
  length: 2,
  binarySearch: true
};

function nearby(lat, lon, length, limit) {
  describe('.nearBy()', function() {
    it('should be an empty array', function() {
      should(geo.nearBy()).be.an.empty().Array();
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', 50)', function() {
    it('should be an empty array', function() {
      should(geo.nearBy(lat, lon, 50)).be.empty().Array();
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', 50000)', function() {
    it('should be an array with ' + length + ' element', function() {
      should(geo.nearBy(lat, lon, 50000)).be.an.Array().with.length(length);
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', [50, 50000])', function() {
    it('should be equal nearBy(' + lat + ', ' + lon + ', 50000)', function() {
      var bar = geo.limit(limit).nearBy(lat, lon, 50000);
      var foo = geo.limit(limit).nearBy(lat, lon, [50, 50000]);
      should(foo).be.eql(bar);
    });

    it('should be an array with ' + length + ' element', function() {
      should(geo.nearBy(lat, lon, [5000, 50000])).be.an.Array().with.length(length);
    });
  });
}

describe(test.name, function() {
  before(function() {
    geo = test.data;
  });

  var limits = [
    {
      limit: '',
      length: 2
    },
    {
      limit: 1,
      length: 1
    }
  ];

  limits.forEach(function(l) {
    describe('.limit(' + l.limit + ')', function() {
      beforeEach(function() {
        geo.limit(l.limit);
      });

      nearby(test.lat, test.lon, test.limit || l.length, l.limit);
    });
  });

  nearby(test.lat, test.lon, test.length);
  describe('.nearBy(' + test.lat + ', ' + test.lon + ', [5000, 50000])', function() {
    it('should be an array with 4 element', function() {
      should(geo.limit(2).nearBy(test.lat, test.lon, [5000, 500000])).be.an.Array().with.length(2);
    });
  });

  describe('.nearBy(' + test.lat + ', ' + test.lon + ', 20000000)', function() {
    it('should be an array with 5 element', function() {
      should(geo.nearBy(test.lat, test.lon, 20000000)).be.an.Array().with.length(5);
    });
  });
});

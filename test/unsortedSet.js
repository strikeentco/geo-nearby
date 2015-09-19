'use strict';

var should = require('should/as-function');
var Geo = require('../main');
var geo;

var dataTwo = [
  {_id: 518909, name: 'Novodvinsk',              country:'RU', geo:3727843024015751, admin1:'Arkhangelskaya'},
  {_id: 581043, name: 'Arkhangel’skaya Oblast’', country:'RU', geo:3728383955366409, admin1:'Arkhangelskaya'},
  {_id: 581049, name: 'Arkhangelsk',             country:'RU', geo:3727753082411929, admin1:'Arkhangelskaya'},
  {_id: 496285, name: 'Severodvinsk',            country:'RU', geo:3727718899203691, admin1:'Arkhangelskaya'},
  {_id: 543704, name: 'Kotlas',                  country:'RU', geo:3819087592574594, admin1:'Arkhangelskaya'}
];
var dataThree = [
  {i:'Perth',     g:3149853951719405},
  {i:'Adelaide',  g:3243323516150966},
  {i:'Melbourne', g:3244523307653507},
  {i:'Canberra',  g:3251896081369449},
  {i:'Sydney',    g:3252342838034651},
  {i:'Brisbane',  g:3270013708086451}
];

var tests = [
  {
    name: 'Geo(dataTwo, {geo: \'geo\'})',
    lat: 64.54,
    lon: 40.54,
    length: 2,
    data: Geo(dataTwo, {geo: 'geo'})
  },
  {
    name: 'Geo(dataThree, {limit: 1})',
    data: Geo(dataThree, {limit: 1}),
    lat: -33.87,
    lon: 151.2,
    length: 1,
    limit: 1
  }
];

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
      should(geo.nearBy(lat, lon, [50, 50000])).be.an.Array().with.length(length);
    });
  });
}

tests.forEach(function(test) {
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
    describe('.nearBy(' + test.lat + ', ' + test.lon + ', 5000)', function() {
      it('should be an array with 0 element', function() {
        should(Geo().nearBy(test.lat, test.lon, 5000)).be.an.Array().with.length(0);
      });
    });
  });
});

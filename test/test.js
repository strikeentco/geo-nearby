'use strict';

var should = require('should/as-function');
var Geo = require('../main');

var dataOne = [
  {i:496285, g:3727718899203691},
  {i:581049, g:3727753082411929},
  {i:518909, g:3727843024015751},
  {i:581043, g:3728383955366409},
  {i:543704, g:3819087592574594}
];
var dataTwo = [
  {_id: 581043, name: 'Arkhangel’skaya Oblast’', country:'RU', coord:{lon:44, lat:64}, geo:3728383955366409, admin1:'Arkhangelskaya'},
  {_id: 581049, name: 'Arkhangelsk', country:'RU', coord:{lon:40.5433, lat:64.5401}, geo:3727753082411929, admin1:'Arkhangelskaya'},
  {_id: 496285, name: 'Severodvinsk', country:'RU', coord:{lon:39.8302, lat:64.5635}, geo:3727718899203691, admin1:'Arkhangelskaya'},
  {_id: 518909, name: 'Novodvinsk', country:'RU', coord:{lon:40.8122, lat:64.4165}, geo:3727843024015751, admin1:'Arkhangelskaya'},
  {_id: 543704, name: 'Kotlas', country:'RU', coord:{lon:46.64963, lat:61.25745}, geo:3819087592574594, admin1:'Arkhangelskaya'}
];
var dataThree = [
  {i:'Perth',     g:3149853951719405},
  {i:'Adelaide',  g:3243323516150966},
  {i:'Melbourne', g:3244523307653507},
  {i:'Canberra',  g:3251896081369449},
  {i:'Sydney',    g:3252342838034651},
  {i:'Brisbane',  g:3270013708086451}
];
var dataFour = [
  [-35.30278, 149.14167, 'Canberra'],
  [-33.86944, 151.20833, 'Sydney'],
  [-37.82056, 144.96139, 'Melbourne'],
  [-34.93333, 138.58333, 'Adelaide'],
  [-27.46778, 153.02778, 'Brisbane'],
  [-31.95306, 115.85889, 'Perth']
];

var tests = [
  {
    name: 'Geo(dataOne, {sorted: true})',
    data: Geo(dataOne, {sorted: true}),
    lat: 64.54,
    lon: 40.54,
    length: 2,
    binarySearch: true
  },
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
  },
  {
    name: 'Geo(dataFour).createCompactSet()',
    data: Geo(dataFour).createCompactSet(),
    expected: dataThree,
    compactSet: true
  },
  {
    name: 'Geo(dataTwo).createCompactSet({id: \'_id\', lat: [\'coord\', \'lat\'], lon: [\'coord\', \'lon\']})',
    data: Geo(dataTwo).createCompactSet({id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon']}),
    expected: dataOne,
    compactSet: true
  }
];

function nearby(lat, lon, length, limit) {
  describe('.nearBy()', function() {
    it('should be an empty array', function() {
      should(this.Geo.nearBy()).be.an.empty().Array();
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', 50)', function() {
    it('should be an empty array', function() {
      should(this.Geo.nearBy(lat, lon, 50)).be.empty().Array();
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', 50000)', function() {
    it('should be an array with ' + length + ' element', function() {
      should(this.Geo.nearBy(lat, lon, 50000)).be.an.Array().with.length(length);
    });
  });

  describe('.nearBy(' + lat + ', ' + lon + ', [50, 50000])', function() {
    it('should be equal nearBy(' + lat + ', ' + lon + ', 50000)', function() {
      var bar = this.Geo.limit(limit).nearBy(lat, lon, 50000);
      var foo = this.Geo.limit(limit).nearBy(lat, lon, [50, 50000]);
      should(foo).be.eql(bar);
    });

    it('should be an array with ' + length + ' element', function() {
      should(this.Geo.nearBy(lat, lon, [50, 50000])).be.an.Array().with.length(length);
    });
  });
}

tests.forEach(function(test) {
  if (test.compactSet) {
    describe(test.name, function() {
      it('should create compact set', function() {
        should(test.data).be.eql(test.expected);
      });
    });
  } else {
    describe(test.name, function() {
      before(function() {
        this.Geo = test.data;
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
            this.Geo.limit(l.limit);
          });

          nearby(test.lat, test.lon, test.limit || l.length, l.limit);
        });
      });

      nearby(test.lat, test.lon, test.length);
    });
  }
});

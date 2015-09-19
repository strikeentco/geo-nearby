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
  {_id: 581043, name: 'Arkhangel’skaya Oblast’', country:'RU', coord:{lon:44,       lat:64},       admin1:'Arkhangelskaya'},
  {_id: 581049, name: 'Arkhangelsk',             country:'RU', coord:{lon:40.5433,  lat:64.5401},  admin1:'Arkhangelskaya'},
  {_id: 496285, name: 'Severodvinsk',            country:'RU', coord:{lon:39.8302,  lat:64.5635},  admin1:'Arkhangelskaya'},
  {_id: 518909, name: 'Novodvinsk',              country:'RU', coord:{lon:40.8122,  lat:64.4165},  admin1:'Arkhangelskaya'},
  {_id: 543704, name: 'Kotlas',                  country:'RU', coord:{lon:46.64963, lat:61.25745}, admin1:'Arkhangelskaya'}
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

describe('Geo(data).createCompactSet()', function() {
  it('should create compact set', function() {
    should(Geo(dataFour).createCompactSet()).be.eql(dataThree);
  });
});

describe('Geo(data).createCompactSet({file: \'./test.json\'})', function() {
  before(function() {
    Geo(dataFour).createCompactSet({file: './test.json'});

    var e = new Date().getTime() + 5;
    while (new Date().getTime() <= e);
  });

  after(function() {
    require('fs').unlink('./test.json');
  });

  it('should create compact set', function() {
    should(Geo(dataFour).createCompactSet({file: './.'})).be.eql(dataThree);
    should(require('../test.json')).be.eql(dataThree);
  });
});

describe('Geo(data).createCompactSet({id: \'_id\', lat: [\'coord\', \'lat\'], lon: [\'coord\', \'lon\']})', function() {
  it('should create compact set', function() {
    should(Geo(dataTwo).createCompactSet({id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon']})).be.eql(dataOne);
    should(Geo(dataTwo).createCompactSet({id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon'], sort: 'desc'})).be.eql(dataOne.reverse());
  });
});

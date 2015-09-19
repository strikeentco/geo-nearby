'use strict';

var should = require('should/as-function');
var Geo = require('../main');
var binarySearch = require('../lib/helpers').binarySearch;
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

describe('binarySearch()', function() {
  it('should be equal 2', function() {
    should(binarySearch(Geo(data, {sorted: true}), 3727843024015751, 0, 5)).be.eql(2);
  });
});

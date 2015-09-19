'use strict';

var geohash = require('ngeohash');
var helpers = require('./helpers');
var get = helpers.get;
var flatten = helpers.flatten;
var uniq = helpers.uniq;
var rangeIndex = helpers.rangeIndex;
var binarySearch = helpers.binarySearch;

module.exports.createCompactSet = function(data, opt) {
  var geo = [];

  data.forEach(function(n) {
    var c = {};
    c.i = get(n, opt.id);
    c.g = geohash.encode_int(get(n, opt.lat), get(n, opt.lon));
    geo.push(c);
  });

  geo.sort(function(a, b) {
    return a.g - b.g;
  });

  opt.sort.toLowerCase() === 'asc' || (geo = geo.reverse());

  if (opt.file) {
    require('fs').writeFile(opt.file, JSON.stringify(geo), function(err) {
      if (err) {
        throw err;
      }
    });
  }

  return geo;
};

function rangeDepth(radius) {
  for (var i = 0; i < rangeIndex.length - 1; i++) {
    if (radius - rangeIndex[i] < rangeIndex[i + 1] - radius) {
      return 52 - (i * 2);
    }
  }

  return 2;
}

function buildBoxSet(hash, radiusBitDepth) {
  var neighbors = geohash.neighbors_int(hash, radiusBitDepth);

  neighbors.push(hash);
  neighbors.sort();

  return uniq(neighbors);
}

function rangesFromBoxSet(neighbors) {
  var ranges = [];
  var lowerRange = 0;
  var upperRange = 0;

  for (var i = 0; i < neighbors.length; i++) {
    lowerRange = neighbors[i];
    upperRange = lowerRange + 1;
    while (neighbors[i + 1] === upperRange) {
      neighbors.shift();
      upperRange = neighbors[i] + 1;
    }

    ranges.push([lowerRange, upperRange]);
  }

  return ranges;
}

function leftShift(hash, bit) {
  return hash * Math.pow(2, bit);
}

function rangeSet(lat, lon, radiusBitDepth, bitDepth) {
  var hash = geohash.encode_int(lat, lon, radiusBitDepth);
  var neighbors = buildBoxSet(hash, radiusBitDepth);
  var ranges = rangesFromBoxSet(neighbors);

  var bitDiff = bitDepth - radiusBitDepth;

  for (var i = 0; i < ranges.length; i++) {
    ranges[i][0] = leftShift(ranges[i][0], bitDiff);
    ranges[i][1] = leftShift(ranges[i][1], bitDiff);
  }

  return ranges;
}

function searchBetween(set, min, max) {
  var geo = set.geo;
  var data = set.data;
  var result = [];
  var length = data.length;

  if (set._sorted) {
    var _min = binarySearch(set, min, 0, length - 1);
    var _max = binarySearch(set, max, 0, length - 1, true);
    for (var i = _min; i <= _max; i++) {
      result.push(data[i]);
    }

    return result;
  } else {
    for (var i = 0; i < length; i++) {
      var value = data[i];
      if (value[geo] >= min && value[geo] <= max) {
        result.push(value);
      }
    }

    return result;
  }
}

function queryByRanges(data, ranges, limit) {
  var replies = [];
  var range;

  for (var i = 0; i < ranges.length; i++) {
    range = ranges[i];
    var replie = searchBetween(data, range[0], range[1]);
    if (limit && replie.length >= limit) {
      return replie;
    }

    replies.push(replie);
    replies = flatten(replies);
    if (limit && replies.length >= limit) {
      return replies;
    }
  }

  return replies;
}

module.exports.nearBy = function(data, lat, lon, radius, limit) {
  var ranges = rangeSet(lat, lon, rangeDepth(radius), 52);
  return queryByRanges(data, ranges, limit);
};

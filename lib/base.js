'use strict';

const geohash = require('ngeohash');
const fs = require('fs');
const sort = require('./sort');
const helpers = require('./helpers');

const get = helpers.get;
const getFeatureCollection = helpers.getFeatureCollection;
const getCoords = helpers.getCoords;
const isArray = helpers.isArray;
const isGeoJSON = helpers.isGeoJSON;
const uniq = helpers.uniq;
const rangeIndex = helpers.rangeIndex;
const rangeIndexLength = rangeIndex.length;
const binarySearch = helpers.binarySearch;

module.exports.createCompactSet = (data, opts) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      throw new TypeError('data must be correct JSON or GeoJSON');
    }
  }

  let geo = [];

  if (isArray(data)) {
    if (data[0].i && data[0].g) {
      return sort(data);
    }
    data.forEach(item => {
      let g;
      if (opts.hash) {
        g = get(item, opts.hash);
      }
      g = g || geohash.encode_int(get(item, opts.lat), get(item, opts.lon));
      geo.push({
        i: get(item, opts.id),
        g
      });
    });
  } else if (isGeoJSON(data)) {
    const features = getFeatureCollection(data);
    features.forEach(feature => {
      const geometry = feature.geometry;
      const coords = getCoords(geometry);
      if (coords) {
        const properties = feature.properties;
        geo.push({
          i: get(properties, opts.id),
          g: geohash.encode_int(coords.lat, coords.lon)
        });
      }
    });
  } else {
    throw new TypeError('data must be correct JSON or GeoJSON');
  }

  geo = sort(geo);

  if (opts.file) {
    fs.writeFileSync(opts.file, JSON.stringify(geo));
  }

  return geo;
};

function rangeDepth(radius) {
  for (let i = 0; i < rangeIndexLength - 1; i++) {
    if (radius - rangeIndex[i] < rangeIndex[i + 1] - radius) {
      return 52 - (i * 2);
    }
  }

  return 2;
}

function buildBoxSet(hash, radiusBitDepth) {
  const neighbors = geohash.neighbors_int(hash, radiusBitDepth);

  neighbors.push(hash);
  neighbors.sort();

  return uniq(neighbors);
}

function leftShift(hash, bit) {
  return hash * Math.pow(2, bit);
}

function rangeSet(lat, lon, radiusBitDepth, bitDepth) {
  const hash = geohash.encode_int(lat, lon, radiusBitDepth);
  const neighbors = buildBoxSet(hash, radiusBitDepth);
  const bitDiff = bitDepth - radiusBitDepth;

  const ranges = [];
  let lowerRange = 0;
  let upperRange = 0;

  for (let i = 0; i < neighbors.length; i++) {
    lowerRange = neighbors[i];
    upperRange = lowerRange + 1;
    while (neighbors[i + 1] === upperRange) {
      neighbors.shift();
      upperRange = neighbors[i] + 1;
    }

    ranges.push({ lower: leftShift(lowerRange, bitDiff), upper: leftShift(upperRange, bitDiff) });
  }

  return ranges;
}

function searchBetween(set, min, max, limit) {
  const hash = set.hash;
  const data = set.data;
  const result = [];
  const length = data.length;

  if (set._sorted) {
    const _min = binarySearch(set, min, 0, length - 1);
    const _max = binarySearch(set, max, 0, length - 1, true);
    for (let i = _min; i <= _max; i++) {
      if (limit && result.length >= limit) {
        return result;
      }
      result.push(data[i]);
    }

    return result;
  }

  // eslint-disable-next-line no-var, vars-on-top
  for (var i = 0; i < length; i++) { // Low performance when use "let" in "for" loop - https://bugs.chromium.org/p/v8/issues/detail?id=4762
    const value = data[i];
    if (value[hash] >= min && value[hash] <= max) {
      if (limit && result.length >= limit) {
        return result;
      }
      result.push(value);
    }
  }

  return result;
}

function queryByRanges(data, ranges, limit) {
  let replies = [];
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const replie = searchBetween(data, range.lower, range.upper, limit);
    if (replie.length) {
      replies = replies.concat(replie);
    }
    if (limit && replies.length >= limit) {
      return replies;
    }
  }

  return replies;
}

module.exports.nearBy = (data, opts) =>
  queryByRanges(data, rangeSet(opts.lat, opts.lon, rangeDepth(opts.radius), 52), opts.limit);

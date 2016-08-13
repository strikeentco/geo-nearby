'use strict';

const rangeIndex = module.exports.rangeIndex = [
  0.6, // 52
  1, // 50
  2.19, // 48
  4.57, // 46
  9.34, // 44
  14.4, // 42
  33.18, // 40
  62.1, // 38
  128.55, // 36
  252.9, // 34
  510.02, // 32
  1015.8, // 30
  2236.5, // 28
  3866.9, // 26
  8749.7, // 24
  15664, // 22
  33163.5, // 20
  72226.3, // 18
  150350, // 16
  306600, // 14
  474640, // 12
  1099600, // 10
  2349600, // 8
  4849600, // 6
  10018863 // 4
];

const geoTypes = {
  Point: 'coordinates',
  MultiPoint: 'coordinates',
  LineString: 'coordinates',
  MultiLineString: 'coordinates',
  Polygon: 'coordinates',
  MultiPolygon: 'coordinates',
  GeometryCollection: 'geometries',
  Feature: 'geometry',
  FeatureCollection: 'features'
};

const isArray = module.exports.isArray = Array.isArray;

module.exports.isGeoJSON = data => {
  if (data) {
    if (data.type) {
      if (geoTypes[data.type]) {
        return true;
      }
    }
  }
  return false;
};

module.exports.getFeatureCollection = data => {
  if (data && data.type === 'FeatureCollection') {
    return data.features;
  }
  return [];
};

module.exports.getCoords = data => {
  if (data && data.type === 'Point') {
    const coords = data.coordinates;
    if (isArray(coords) && coords.length === 2) {
      const lat = coords[1];
      const lon = coords[0];
      if (lat && lon && !(isArray(lat) || isArray(lon))) {
        return { lat, lon };
      }
    }
  }
  return false;
};

module.exports.get = (object, path) => {
  if (isArray(path)) {
    // eslint-disable-next-line no-var, vars-on-top
    for (var i = 0; i < path.length; i++) { // Low performance when use "let" in "for" loop - https://bugs.chromium.org/p/v8/issues/detail?id=4762
      object = object[path[i]];
    }

    return object;
  }
  return object[path];
};

module.exports.uniq = array => array.filter((value, index, self) => self.indexOf(value) === index);

module.exports.rangeBetween = (min, max) => {
  const result = [];

  for (let i = 0; i < rangeIndex.length; i++) {
    const value = rangeIndex[i];
    if (value >= min && value < max) {
      result.push(value);
    }
  }

  result.push(max);

  return result;
};

module.exports.binarySearch = (set, needle, low, high, max) => {
  const hash = set.hash;
  const data = set.data;

  while (low <= high) {
    const mid = low + (high - low >> 1);
    const cmp = data[mid][hash] - needle;

    if (cmp < 0) {
      low = mid + 1;
    } else if (cmp > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  if (max) {
    return low - 1;
  }
  return low;
};

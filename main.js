'use strict';

const nearBy = require('./lib/base').nearBy;
const createCompactSet = require('./lib/base').createCompactSet;
const helpers = require('./lib/helpers');
const isArray = helpers.isArray;
const isGeoJSON = helpers.isGeoJSON;
const uniq = helpers.uniq;
const rangeBetween = helpers.rangeBetween;

class Geo {
  constructor(data, opts) {
    opts = opts || {};
    this.data = data || [];
    this.hash = opts.hash || 'g';
    this.setOptions = opts.setOptions || false;
    this._sort = opts.sort || false;
    this._sorted = opts.sorted || false;
    this._limit = this._constLimit = (opts.limit && opts.limit > 0) ? opts.limit : 0;

    if ((this._sort || this.setOptions) && !this._sorted) {
      this._sorted = true;
      this.data = Geo.createCompactSet(this.data, Object.assign({
        hash: this.hash
      }, this.setOptions));
      this.hash = 'g';
    }
  }

  static createCompactSet(data, opts) {
    opts = Object.assign({}, {
      file: false,
      id: 2,
      lat: 0,
      lon: 1
    }, opts);

    return createCompactSet(data, opts);
  }

  limit(limit) {
    this._limit = (limit > 0) ? limit : 0;
    return this;
  }

  nearBy(lat, lon, radius) {
    const limit = this._limit;
    this._limit = this._constLimit;

    if (isGeoJSON(this.data)) {
      throw new TypeError('data must be an array, for GeoJSON please specify setOptions');
    }

    if (!lat || !lon || !radius) {
      return [];
    } else if (isArray(radius)) {
      let replies = [];
      const range = rangeBetween(radius[0], radius[1]);
      for (const item of range) {
        const data = nearBy(this, { lat, lon, radius: item, limit });
        if (limit === 1 && data && data.length === 1) {
          return data;
        } else if (data && data.length) {
          replies = replies.concat(data);
          replies = uniq(replies);
          if (limit && replies.length >= limit) {
            return replies.slice(0, limit);
          }
        }
      }

      return replies;
    }
    if (limit > 0) {
      return nearBy(this, { lat, lon, radius, limit }).slice(0, limit);
    }
    return nearBy(this, { lat, lon, radius });
  }
}

module.exports = Geo;

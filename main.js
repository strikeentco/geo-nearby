'use strict';

var _nearBy = require('./lib/base').nearBy;
var _createCompactSet = require('./lib/base').createCompactSet;
var helpers = require('./lib/helpers');
var isArray = helpers.isArray;
var flatten = helpers.flatten;
var uniq = helpers.uniq;
var rangeBetween = helpers.rangeBetween;

module.exports = function(data, options) {
  options = options || {};
  return new Geo(data, options);
};

function Geo(data, options) {
  this.data = data || [];
  this.geo = options.geo || 'g';
  this._limit = this._constLimit = (options.limit && options.limit > 0) ? options.limit : 0;
  return this;
}

Geo.prototype.createCompactSet = function(options) {
  options || (options = {});
  options.file || (options.file = false);
  options.id || (options.id = 2);
  options.sort || (options.sort = 'asc');
  options.lat || (options.lat = 0);
  options.lon || (options.lon = 1);

  return _createCompactSet(this.data, options);
};

Geo.prototype.limit = function(limit) {
  this._limit = (limit > 0) ? limit : 0;
  return this;
};

Geo.prototype.nearBy = function(lat, lon, radius) {
  var limit = this._limit;
  this._limit = this._constLimit;
  if (isArray(radius)) {
    var replies = [];
    var range = rangeBetween(radius[0], radius[1]);
    for (var i = 0; i < range.length; i++) {
      var l = _nearBy(this, lat, lon, range[i], limit) || [];
      if (limit === 1 && l.length === 1) {
        return l;
      } else if (l.length) {
        replies.push(l);
        replies = uniq(flatten(replies));
        if (limit && replies.length >= limit) {
          return replies.slice(0, limit);
        }
      }
    }

    if (limit > 0) {
      return replies.slice(0, limit);
    } else {
      return replies;
    }
  } else {
    if (limit > 0) {
      return _nearBy(this, lat, lon, radius, limit).slice(0, limit);
    } else {
      return _nearBy(this, lat, lon, radius);
    }
  }
};

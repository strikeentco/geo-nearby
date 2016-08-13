geo-nearby [![License](https://img.shields.io/npm/l/geo-nearby.svg)](https://github.com/strikeentco/geo-nearby/blob/master/LICENSE)  [![npm](https://img.shields.io/npm/v/geo-nearby.svg)](https://www.npmjs.com/package/geo-nearby)
==========
[![Build Status](https://travis-ci.org/strikeentco/geo-nearby.svg)](https://travis-ci.org/strikeentco/geo-nearby) [![node](https://img.shields.io/node/v/geo-nearby.svg)](https://www.npmjs.com/package/geo-nearby)  [![Test Coverage](https://codeclimate.com/github/strikeentco/geo-nearby/badges/coverage.svg)](https://codeclimate.com/github/strikeentco/geo-nearby/coverage) [![bitHound Score](https://www.bithound.io/github/strikeentco/geo-nearby/badges/score.svg)](https://www.bithound.io/github/strikeentco/geo-nearby)

**Note:** *This module stores all data in memory - remember that.*

Uber fast nearby locations search by coordinates.

Supports `Array`, `Object`, `JSON` and `GeoJSON` as input data.

# Usage

```sh
$ npm install geo-nearby --save
```

```javascript
const Geo = require('geo-nearby');

const dataSet = [
  { i: 'Perth',     g: 3149853951719405 },
  { i: 'Adelaide',  g: 3243323516150966 },
  { i: 'Melbourne', g: 3244523307653507 },
  { i: 'Canberra',  g: 3251896081369449 },
  { i: 'Sydney',    g: 3252342838034651 },
  { i: 'Brisbane',  g: 3270013708086451 },
  { i: 'Sydney',    g: 3252342838034651 }
];

const geo = new Geo(dataSet);

geo.nearBy(-33.87, 151.2, 5000); // 5000 - 5km
```
In `g` stored geohash with 52-bit precision.

If you want to change property name, you can do that with options:

```javascript
const Geo = require('geo-nearby');

const dataSet = [
  { id: 1, name: 'Perth',     geoHash: 3149853951719405 },
  { id: 2, name: 'Adelaide',  geoHash: 3243323516150966 },
  { id: 3, name: 'Melbourne', geoHash: 3244523307653507 },
  { id: 4, name: 'Canberra',  geoHash: 3251896081369449 },
  { id: 5, name: 'Sydney',    geoHash: 3252342838034651 },
  { id: 6, name: 'Brisbane',  geoHash: 3270013708086451 },
  { id: 7, name: 'Sydney',    geoHash: 3252342838034651 }
];

const geo = new Geo(dataSet, { hash: 'geoHash' });

geo.nearBy(-33.87, 151.2, 5000);
```

## Data set

For best performance it is recommended to use the default data set syntax:

```javascript
const dataSet = [
  ...
  { i: <id>, g: <geo hash> },
  { i: <id>, g: <geo hash> },
  ...
];
```

You can use a [`createCompactSet`](#createcompactsetdataset-options) method for creating a data set with recommended syntax of your data:

```javascript
const data = [
  [-35.30278, 149.14167, 'Canberra'],
  [-33.86944, 151.20833, 'Sydney'],
  [-37.82056, 144.96139, 'Melbourne'],
  [-34.93333, 138.58333, 'Adelaide'],
  [-27.46778, 153.02778, 'Brisbane'],
  [-31.95306, 115.85889, 'Perth']
];

const dataSet = Geo.createCompactSet(data);
const geo = new Geo(dataSet, { sorted: true });

geo.nearBy(-33.87, 151.2, 5000);
```

`createCompactSet` supports `Array`, parsed and unparsed `JSON`, parsed and unparsed `GeoJSON` as input data:

```javascript
const data = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [44, 64] }, properties: { name: 'Arkhangelskaya Oblast' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [40.5433, 64.5401] }, properties: { name: 'Arkhangelsk' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [39.8302, 64.5635] }, properties: { name: 'Severodvinsk' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [40.8122, 64.4165] }, properties: { name: 'Novodvinsk' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [46.64963, 61.25745] }, properties: { name: 'Kotlas' } }
  ]
};

const dataSet = Geo.createCompactSet(data, { id: 'name' });
const geo = new Geo(dataSet, { sorted: true });

geo.nearBy(64.54, 40.54, 5000);
```

You also can change default values for a [`createCompactSet`](#createcompactsetdataset-options) method if your data looks different:

```javascript
const data = [
  { _id: 1000, name: 'Arkhangel’skaya Oblast’', country: 'RU', coord: { lon: 44, lat: 64 }, admin1: 'Arkhangelskaya' },
  { _id: 1001, name: 'Arkhangelsk', country: 'RU', coord: { lon: 40.5433, lat: 64.5401 }, admin1: 'Arkhangelskaya' },
  { _id: 1002, name: 'Severodvinsk', country: 'RU', coord: { lon: 39.8302, lat: 64.5635 }, admin1: 'Arkhangelskaya' },
  { _id: 1003, name: 'Novodvinsk', country: 'RU', coord: { lon: 40.8122, lat: 64.4165 }, admin1: 'Arkhangelskaya' },
  { _id: 1004, name: 'Kotlas', country: 'RU', coord: { lon: 46.64963, lat: 61.25745 }, admin1: 'Arkhangelskaya' }
];

const dataSet = Geo.createCompactSet(data, { id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon'] });
const geo = new Geo(dataSet, { sorted: true });

geo.nearBy(64.54, 40.54, 5000);
```

You can specify `setOptions` property in [constructor](#new-geodataset-options) `options`, it will create data set automatically, but it may take lots of time for large data:

```javascript
const data = [
  { lat: -35.30278, lon: 149.14167, name: 'Canberra' },
  { lat: -33.86944, lon: 151.20833, name: 'Sydney' },
  { lat: -37.82056, lon: 144.96139, name: 'Melbourne' },
  { lat: -34.93333, lon: 138.58333, name: 'Adelaide' },
  { lat: -27.46778, lon: 153.02778, name: 'Brisbane' },
  { lat: -31.95306, lon: 115.85889, name: 'Perth' }
];

const geo = new Geo(data, { setOptions: { id: 'name', lat: 'lat', lon: 'lon' } });

geo.nearBy(-33.87, 151.2, 5000);
```

If you have a huge data it may be more wisely save them to file:

```javascript
const data = require('./huge.data.set.file.json');

Geo.createCompactSet({ id: '_id', lat: 'lat', lon: 'lon', file: './compact.set.json' });
```

And then load in variable:

```javascript
const dataSet = require('./compact.set.json');
const geo = new Geo(dataSet, { sorted: true });

geo.nearBy(64.54, 40.54, 5000);
```

# Advanced usage

## Limiting results

For limiting results, you have two ways:

**1.** Define limit in the options. That allows you to define a permanent limit for results.

```javascript
const geo = new Geo(dataSet, { limit: 1 });

geo.nearBy(64.54, 40.54, 3000);
new Geo(dataSet, { limit: 1 }).nearBy(64.54, 40.54, 3000);
geo.nearBy(-33.87, 151.2, 5000);
```
In all these cases, the results will be limited to 1.

**2.** Define limit by `limit()` method. That allows you to define a temporary limit for results.

```javascript
const foo = new Geo(dataSet).limit(1);
foo.nearBy(64.54, 40.54, 5000); //up to 1
foo.nearBy(64.54, 40.54, 5000); //no limits

const bar = new Geo(dataSet, { limit: 1 }).limit(10);
bar.nearBy(64.54, 40.54, 5000); //up to 10
bar.nearBy(64.54, 40.54, 5000); //up to 1. Options limit - permanent limit.
bar.limit(2).nearBy(64.54, 40.54, 5000); //up to 2
```

## A range of distances

For a more precise definition, you can use a range of distances.
It's a bit slower but more accurate.

```javascript
const geo = new Geo(dataSet);
geo.limit(2).nearBy(64.54, 40.54, [250, 30000]);
```

**Note:** *Don't use too small distance for start value. For values, less than 250 script execution may take too much time for unsorted data set. 250 - 500 is usually sufficient.*

## Binary search

If you created data set by [`createCompactSet`](#createcompactsetdataset-options) method or your own data set is sorted by `geohash` property in ascending order, you can activate extremely fast binary search.

Just set `sorted` property as `true` in [constructor](#new-geodataset-options) `options`.

A binary search is 20 times faster than normal.

```javascript
const geo = new Geo(dataSet, { sorted: true });
geo.limit(1).nearBy(64.54, 40.54, [250, 30000]);
```

## Sorting data

If you have data set (with [recommended syntax](#data-set)) which is unsorted, you can easily sort it, just set `sort` property as `true` in [constructor](#new-geodataset-options) `options`.

Data set will be automatically sorted using fast introsort algorithm. But keep in mind, sorting will take some time.

In some case, search in unsorted data set will be faster than sort and search.

```javascript
const geo = new Geo(dataSet, { sort: true });
geo.limit(1).nearBy(64.54, 40.54, [250, 30000]);
```

# Methods

## new Geo(dataSet, [options])

Constructor.

### Params:

* **dataSet** (*String|Array|Object*) - Data set (JSON, GeoJSON, etc)
* **[options]** (*Object*) - Options:
  * **hash** (*String*) - Key path (by default = 'g')
  * **limit** (*Integer*) - Limit results (by default no limits)
  * **sort** (*Boolean*) - Will sort data set with introsort algorithm
  * **sorted** (*Boolean*) - If data set is sorted in ascending order, set `sorted` as `true` it will enable [binary search](#binary-search) (uber fast mode)
  * **setOptions** (*Object*) - Options from [createCompactSet](#createcompactsetdataset-options):
    * **hash** (*String|Array*) - Key (name|path) (by default inherits `hash` from above)
    * **id** (*String|Array*) - Key (name|path) (by default = 2)
    * **lat** (*String|Array*) - Key (name|path) (by default = 0)
    * **lon** (*String|Array*) - Key (name|path) (by default = 1)
    * **file** (*String*) - File path to save

```javascript
const geo = new Geo(dataSet, { hash: 'geo', limit: 1, sorted: true });
```

## .nearBy(lat, lon, distance)

Search method of nearby places.

### Params:

* **lat** (*Float*) - Latitude
* **lon** (*Float*) - Longitude
* **distance** (*Integer|Array*) - Distance in meters

```javascript
const geo = new Geo(dataSet);
geo.nearBy(64.54, 40.54, [500, 300000]);
```

## .limit([limit])

Temporary limit for results.

### Params:

* **[limit]** (*Integer*) - Limit results (by default no limits)

```javascript
const geo = new Geo(dataSet);
geo.limit(1).nearBy(64.54, 40.54, [500, 300000]);
```

## .createCompactSet(dataSet, [options])

Method creates data set.

Static method.

### Params:

* **dataSet** (*String|Array|Object*) - Data set (JSON, GeoJSON, etc)
* **[options]** (*Object*) - Options:
  * **hash** (*String|Array*) - Key (name|path)
  * **id** (*String|Array*) - Key (name|path) (by default = 2)
  * **lat** (*String|Array*) - Key (name|path) (by default = 0)
  * **lon** (*String|Array*) - Key (name|path) (by default = 1)
  * **file** (*String*) - File path to save

```javascript
const dataSet = Geo.createCompactSet(data, { id: ['names', 'name', 'id'] });
```

## License

The MIT License (MIT)<br/>
Copyright (c) 2015-2016 Alexey Bystrov

geo-nearby
==========


**Note:** *This module stores all data in memory - remember that.*


Search for nearby locations without DB usage.<br>*Inspired by [geo-proximity](https://github.com/arjunmehta/node-geo-proximity).*


## Usage

```bash
npm install geo-nearby
```

Usage of this module is fairly simple. Just include and add some data - that's it.

```javascript
var Geo = require('geo-nearby');

var dataSet = [
  { i: 'Perth', g: 3149853951719405 },
  { i: 'Adelaide', g: 3243323516150966 },
  { i: 'Melbourne', g: 3244523307653507 },
  { i: 'Canberra', g: 3251896081369449 },
  { i: 'Sydney', g: 3252342838034651 },
  { i: 'Brisbane', g: 3270013708086451 }
  { i: 'Sydney', g: 3252342838034651 }
];

console.log(Geo(dataSet).nearBy(-33.87, 151.2, 5000)); // 5000 - 5km
```
In `g` stored geohash with 52-bit precision.

If you want to change property name, you can do that with options:

```javascript
var Geo = require('geo-nearby');

var dataSet = [
  { id: 1, name: 'Perth', geoHash: 3149853951719405 },
  { id: 2, name: 'Adelaide', geoHash: 3243323516150966 },
  { id: 3, name: 'Melbourne', geoHash: 3244523307653507 },
  { id: 4, name: 'Canberra', geoHash: 3251896081369449 },
  { id: 5, name: 'Sydney', geoHash: 3252342838034651 },
  { id: 6, name: 'Brisbane', geoHash: 3270013708086451 }
  { id: 7, name: 'Sydney', geoHash: 3252342838034651 }
];

console.log(Geo(dataSet, {geo: 'geoHash'}).nearBy(-33.87, 151.2, 5000));
```

### Data set

For best performance is recommended to use the default data set syntax:

```javascript
var dataSet = [
  ...
  { i: <id>, g: <geo hash> },
  { i: <id>, g: <geo hash> },
  ...
];
```

You can use a `createCompactSet` method for creating a data set with recommended syntax of your data.

```javascript
var data = [
  [-35.30278, 149.14167, 'Canberra'],
  [-33.86944, 151.20833, 'Sydney'],
  [-37.82056, 144.96139, 'Melbourne'],
  [-34.93333, 138.58333, 'Adelaide'],
  [-27.46778, 153.02778, 'Brisbane'],
  [-31.95306, 115.85889, 'Perth']
];

var dataSet = Geo(data).createCompactSet();
console.log(Geo(dataSet).nearBy(-33.87, 151.2, 5000));
```

You also can change default values for a `createCompactSet` method if your data looks different.

```javascript
var data = [
  {"_id":1000, "name":"Arkhangel’skaya Oblast’", "country":"RU", "coord":{"lon":44, "lat":64}, "admin1":"Arkhangelskaya"},
  {"_id":1001, "name":"Arkhangelsk", "country":"RU", "coord":{"lon":40.5433, "lat":64.5401}, "admin1":"Arkhangelskaya"},
  {"_id":1002, "name":"Severodvinsk", "country":"RU", "coord":{"lon":39.8302, "lat":64.5635}, "admin1":"Arkhangelskaya"},
  {"_id":1003, "name":"Novodvinsk", "country":"RU", "coord":{"lon":40.8122, "lat":64.4165}, "admin1":"Arkhangelskaya"},
  {"_id":1004, "name":"Kotlas", "country":"RU", "coord":{"lon":46.64963, "lat":61.25745}, "admin1":"Arkhangelskaya"}
];

var dataSet = Geo(data).createCompactSet({id: '_id', lat: ['coord', 'lat'], lon: ['coord', 'lon']});
console.log(Geo(dataSet).nearBy(64.54, 40.54, 5000));
```

If you have a huge data it may be more wisely save them to file:

```javascript
var data = JSON.parse(fs.readFileSync('./huge.data.set.file.json', 'utf8'));

Geo(data).createCompactSet({id: '_id', lat: 'lat', lon: 'lon', file: './compact.set.json'});
```

And then load in variable:

```javascript
var dataSet = JSON.parse(fs.readFileSync('./compact.set.json', 'utf8'));

console.log(Geo(dataSet).nearBy(64.54, 40.54, 5000));
```

## Advanced usage

### Limiting results

For limiting results, you have two ways:

**1.** Define limit in the options. That allows you to define a permanent limit for results.

```javascript
console.log(Geo(dataSet, {geo: 'geo', limit: 1}).nearBy(64.54, 40.54, 5000));

var foo = Geo(dataSet, {geo: 'geo', limit: 1});

console.log(foo.nearBy(64.54, 40.54, 3000));
console.log(foo.nearBy(-33.87, 151.2, 5000));
```
In all these cases, the results will be limited to 1.

**2.** Define limit by `limit()` method. That allows you to define a temporary limit for results.<br>

```javascript
console.log(Geo(dataSet, {geo: 'geo'}).limit(2).nearBy(64.54, 40.54, 5000)); //up to 2

var foo = Geo(dataSet).limit(1);
console.log(foo.nearBy(64.54, 40.54, 5000)); //up to 1
console.log(foo.nearBy(64.54, 40.54, 5000)); //no limits

var bar = Geo(dataSet, {limit: 1}).limit(10);
console.log(bar.nearBy(64.54, 40.54, 5000)); //up to 10
console.log(bar.nearBy(64.54, 40.54, 5000)); //up to 1. Options limit - permanent limit.
console.log(bar.limit(2).nearBy(64.54, 40.54, 5000)); //up to 2
```

### A range of distances

For a more precise definition, you can use a range of distances.
It's a bit slower but more accurate.

```javascript
console.log(Geo(dataSet).limit(2).nearBy(64.54, 40.54, [250, 30000]));
```

**Note:** *Don't use too small distance for start value. For values, less than 250 script execution may take too much time. 250 - 500 is usually sufficient.*

[More examples](https://github.com/)

## Methods
* `Geo(dataSet, options)` - Constructor.
  * `dataSet` - *(array)* - data.
  * `options` - *(object)* - options:
    + `geo` - *(string)* - key path **(by default = 'g')**.
    + `limit` - *(integer)* - limit results **(by default = 0, i.e., no limits)**.

```javascript
Geo(dataSet, {geo: 'geo', limit: 1});
```
* `Geo(dataSet).createCompactSet(options)` - Method creates data set.
  * `dataSet` - *(array)* - data.
  * `options` - *(object)* - options:
    + `id` - *(string|array)* - key (name|path) **(by default = 2)**.
    + `lat` - *(string|array)* - key (name|path) **(by default = 0)**.
    + `lon` - *(string|array)* - key (name|path) **(by default = 1)**.
    + `sort` - *(string)* - sort by geohash **(by default = 'asc')**.
    + `file` - *(string)* - file path **(by default = false)**.

```javascript
var dataSet = Geo(data).createCompactSet({id: ['names', 'name', 'id'], sort: 'desc'});

Geo(data).createCompactSet({id: 2, lat: 0, lon: 1, file: './compact.set.json'});
```
* `Geo(dataSet).limit(0).nearBy(lat, lon, distance)` - Method found nearby locations.
  + `lat` - *(float)* - latitude.
  + `lon` - *(float)* - longitude.
  + `distance` - *(integer|array)* - distance in meters.
  + `limit()` - *(integer)* - limit results **(by default = 0, i.e., no limits)**.

```javascript
Geo(dataSet).limit(1).nearBy(64.54, 40.54, [500, 300000]);
```

## License

The MIT License (MIT)<br/>
Copyright (c) 2015 Alexey Bystrov

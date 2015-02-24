# tri-zilla
[![Build Status](https://travis-ci.org/mapbox/trizilla.svg)](https://travis-ci.org/mapbox/trizilla)
Consumes data values from a latticegrid, then aggregates and inflates triangular geometries.

## inputs
1. A stream of line-delimited JSON of `key: {value1: val, value2: val, ... }`
2. A minimum aggregation level

## outputs
1. A stream of line-delimited GeoJSON of a triangular latticegrid + zoom at which to render.

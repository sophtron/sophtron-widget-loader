#!/bin/sh

mkdir -p dist
uglifyjs --compress --mangle -- src/sophtron-widget-loader.js > dist/sophtron-widget-loader-0.0.0.4.min.js
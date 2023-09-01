#!/usr/bin/env node
console.log('Loaded')
require = require('esm')(module /*, options */)
require('../dist/run-cli')

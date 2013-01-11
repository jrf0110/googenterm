#!/usr/bin/env node

var
  goog = require('./')
, input = process.argv.length > 2 ? process.argv.slice(2).join(' ') : 'npm googenterm'
;

goog.query(input, function(error){
  if (error) throw error;
  process.exit(0);
});


// Generated by CoffeeScript 1.9.3
(function() {
  module.exports = function(opts) {
    var fs;
    fs = require('fs-extra');
    console.log('Cleaning...');
    fs.removeSync('lib');
    return console.log('Done.');
  };

}).call(this);
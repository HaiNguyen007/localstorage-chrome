'use strict';
/* global chrome */
/* eslint-disable no-underscore-dangle */
//
// Class that should contain everything necessary to interact
// with localStorage as a generic key-value store.
// The idea is that authors who want to create an AbstractKeyValueDOWN
// module (e.g. on lawnchair, S3, whatever) will only have to
// reimplement this file.
//

// see http://stackoverflow.com/a/15349865/680742
var nextTick = global.setImmediate || process.nextTick;

function nt(callback, args) {
  nextTick(function () {
    callback.apply(this, args);
  });
}

function createPrefix(dbname) {
  return dbname.replace(/!/g, '!!') + '!'; // escape bangs in dbname;
}

function LocalStorageCore(dbname) {
  this._prefix = createPrefix(dbname);
}

LocalStorageCore.prototype.getKeys = function (callback) {
  var self = this;
  chrome.storage.local.get(null, function (obj) {
    var err = chrome.runtime.lastError;
    if (err) {
      return nt(callback, [err]);
    }

    var keys = [];
    var prefixLen = self._prefix.length;

    Object.keys(obj).forEach(function (key) {
      if (key.substring(0, prefixLen) === self._prefix) {
        keys.push(key.substring(prefixLen));
      }
    });

    return nt(callback, [null, keys.sort()]);

  });
};

LocalStorageCore.prototype.put = function (key, value, callback) {
  var self = this;
  var obj = {};
  obj[self._prefix + key] = value.toString();
  chrome.storage.local.set(obj, function () {
    var err = chrome.runtime.lastError;
    nt(callback, [err]);
  });
};

LocalStorageCore.prototype.get = function (key, callback) {
  var self = this;
  chrome.storage.local.get(self._prefix + key, function (obj) {
    var err = chrome.runtime.lastError, value = obj[self._prefix + key];
    nt(callback, [err, value]);
  });
};

LocalStorageCore.prototype.remove = function (key, callback) {
  var self = this;
  key = self._prefix + key;

  chrome.storage.local.get(key, function (obj) { // check exist
    if (chrome.runtime.lastError) {
      return nt(callback, [chrome.runtime.lastError]);
    }
    if (Object.keys(obj).indexOf(key) === -1) {
      return nt(callback, [new Error(key + 'not found.')]);
    }

    chrome.storage.local.remove(key, function () {
      var err = chrome.runtime.lastError;
      nt(callback, [err]);
    });
  });
};

LocalStorageCore.destroy = function (dbname, callback) {
  var prefix = createPrefix(dbname);
  chrome.storage.local.get(null, function (obj) {
    var err = chrome.runtime.lastError;
    if (err) {
      return nt(callback, [err]);
    }

    var needRemove = [];
    Object.keys(obj).forEach(function (key) {
      if (key.substring(0, prefix.length) === prefix) {
        needRemove.push(key);
      }
    });

    chrome.storage.local.remove(needRemove, function () {
      var e = chrome.runtime.lastError;
      nt(callback, [e]);
    });
  });
};

module.exports = LocalStorageCore;

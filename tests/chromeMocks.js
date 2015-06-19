var storage = {};

function callbackify(callback, fun) {
  var val = fun();
  setTimeout(function () {
    callback(val);
  }, 0);
}


window.chrome = {
  storage:{
    local:{
      get: function (keys, callback) {
        callbackify(callback, function () {
          if (keys === null) {
            return storage;
          }
          var ret = {};
          if (!Array.isArray(keys)) {
            keys = [keys];
          }

          keys.forEach(function (key) {
            ret[key] = storage[key];
          });

          return ret;
        });
      },
      set: function (obj, callback) {
        callbackify(callback, function () {
          Object.keys(obj).forEach(function (key) {
            storage[key] = obj[key];
          });
        });
      },
      remove: function (keys, callback) {
        callbackify(callback, function () {
          if (!Array.isArray(keys)) {
            keys = [keys];
          }

          keys.forEach(function (key) {
            delete storage[key];
          });
        });

      }
    }
  },
  runtime: {
    lastError: null
  }
};

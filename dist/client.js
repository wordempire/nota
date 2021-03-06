(function() {
  define('nota-client', ['backbone', 'json'], function() {
    var NotaClient;
    require.config({});
    NotaClient = (function() {
      NotaClient.prototype.phantomRuntime = window._phantom != null;

      NotaClient.prototype.documentMeta = {
        data: {},
        fn: function() {},
        context: {}
      };

      function NotaClient() {
        _.extend(this, Backbone.Events);
        this.on("all", this.logEvent, this);
        this.trigger('init');
        this.trigger('loaded');
        this;
      }

      NotaClient.prototype.logEvent = function(message) {
        if (this.phantomRuntime) {
          return window.callPhantom(message);
        } else {
          return console.log(message);
        }
      };

      NotaClient.prototype.setDocumentMeta = function(documentMeta, context) {
        if (documentMeta == null) {
          throw new Error("Document meta not defined");
        }
        if (typeof documentMeta === 'function') {
          this.documentMeta.fn = documentMeta;
          if (context != null) {
            return this.documentMeta.context = context;
          }
        } else {
          return this.documentMeta.data = documentMeta;
        }
      };

      NotaClient.prototype.getDocumentMeta = function() {
        var ctx;
        if (this.documentMeta.fn != null) {
          ctx = this.documentMeta.context;
          if (ctx != null) {
            return this.documentMeta.fn.call(ctx);
          } else {
            return this.documentMeta.fn();
          }
        } else {
          return this.documentMeta.data;
        }
      };

      NotaClient.prototype.getData = function(callback, force) {
        if (force == null) {
          force = true;
        }
        if (!force && (this.data != null)) {
          return typeof callback === "function" ? callback(this.data) : void 0;
        }
        this.trigger('data:fetching');
        return require(['json!/data'], (function(_this) {
          return function(data) {
            _this.data = data;
            _this.trigger('data:loaded');
            return typeof callback === "function" ? callback(_this.data) : void 0;
          };
        })(this));
      };

      NotaClient.prototype.injectData = function(data) {
        this.data = data;
        return this.trigger('data:injected', this.data);
      };

      return NotaClient;

    })();
    return this.Nota = new NotaClient();
  });

}).call(this);

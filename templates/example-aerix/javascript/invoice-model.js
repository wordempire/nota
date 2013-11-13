// Generated by CoffeeScript 1.6.3
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Nota.Templates.AerixInvoiceModel = (function(_super) {
    __extends(AerixInvoiceModel, _super);

    function AerixInvoiceModel() {
      _ref = AerixInvoiceModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AerixInvoiceModel.prototype.validate = function() {
      var allItemsValid, date, id, postalCode;
      if (!(_.keys(this.attributes).length > 0)) {
        throw "Provided model has no attributes. " + "Check the arguments of this model's initialization call.";
      }
      if (this.get("meta") == null) {
        throw "No invoice meta-data provided";
      }
      id = this.get("meta").id;
      if (id == null) {
        throw "No invoice ID provided";
      }
      if (isNaN(parseInt(id, 10))) {
        throw "Invoice ID could not be parsed";
      }
      if (parseInt(id, 10) <= 0 || (parseInt(id, 10) !== parseFloat(id, 10))) {
        throw "Invoice ID must be a positive integer";
      }
      date = new Date(this.get("meta").date);
      if (!((Object.prototype.toString.call(date) === "[object Date]") && !isNaN(date.getTime()))) {
        throw "Invoice date is not a valid/parsable value";
      }
      if (this.get("client") == null) {
        throw "No data provided about the client/target of the invoice";
      }
      if (!(this.get("client").organization || this.get("client").contactPerson)) {
        throw "At least the organization name or contact person name must be provided";
      }
      postalCode = this.get("client").postalCode;
      if ((postalCode.length != null) && postalCode.length < 6) {
        throw "Postal code must be at least 6 characters long";
      }
      if (!((this.get("invoiceItems") != null) && (_.keys(this.get("invoiceItems")).length != null) > 0)) {
        throw "No things/items to show in invoice provided. Must be an dictionary object with at least one entry";
      }
      return allItemsValid = _.every(this.get("invoiceItems"), function(item, idx) {
        var price, _ref1;
        if (!((((_ref1 = item.description) != null ? _ref1.length : void 0) != null) > 0)) {
          throw "Description not provided or of no length";
        }
        price = parseFloat(item.price, 10);
        if (isNaN(price)) {
          throw "Price is not a valid floating point number";
        }
        if (!(price > 0)) {
          throw "Price must be greater than zero";
        }
        if ((item.discount != null) && (item.discount < 0 || item.discount > 1)) {
          throw "Discount specified out of range (must be between 0 and 1)";
        }
        if ((item.quantity != null) && item.quantity < 1) {
          throw "When specified, quantity must be greater than one";
        }
      });
    };

    return AerixInvoiceModel;

  })(Backbone.Model);

}).call(this);

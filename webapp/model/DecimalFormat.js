sap.ui.define([
    "sap/ui/model/SimpleType",
  ], Type => Type.extend('ui.tm.vps.ztmvpsintutive.model.type.DecimalFormat', {
    constructor: function(SimpleType) {
      Type.apply(this, arguments);
    },
    formatValue: iValue => {
        var aUOMValue = parseFloat(iValue).toFixed(2);
        if (aUOMValue === "NaN" || aUOMValue === "0.00") {
            aUOMValue = "";
            return aUOMValue;
        } else {
            return aUOMValue;
        }
    },
    parseValue: bValue => bValue,
    validateValue:vValue => vValue
  }));
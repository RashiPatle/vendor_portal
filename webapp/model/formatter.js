/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
    function (Controller) {
        "use strict";
        return {
            getEditableStatus: function (iStatus) {
                if (iStatus === "X") {
                    return false;
                } else {
                    return true;
                }
            }
        };
    });
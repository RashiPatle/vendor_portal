/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ui/tm/vps/ztmvpsintutive/dialogController/assignSupplier",
	"ui/tm/vps/ztmvpsintutive/dialogController/splitQuantity",
	"ui/tm/vps/ztmvpsintutive/dialogController/attachmentBOL"

], function(Controller, assignSupplier, splitQuantity, attachmentBOL) {
	"use strict";

	return Controller.extend("ui.tm.vps.ztmvpsintutive.util.BaseController", {
		_AppStart: false,

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavigationBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("tasklist", {}, false);
			}
		},
		openSupplierDialog: function(oThis, sParent, sPath, sTitle) {
			assignSupplier.openSupplierDialog(oThis, sParent, sPath, sTitle);
		},
		openSplitQtyDialog: function(oThis, sParent, sPath, sTitle) {
			splitQuantity.openSplitQtyDialog(oThis, sParent, sPath, sTitle);
		},
		openBOLAttachmentDialog: function(oThis, sParent, sPath, sTitle) {
			attachmentBOL.openBOLAttachmentDialog(oThis, sParent, sPath, sTitle);
		},
		getI18nText: function(cValue) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sText = oBundle.getText(cValue);

			return sText;
		}

	});

});
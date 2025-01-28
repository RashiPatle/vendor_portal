/*global QUnit*/

sap.ui.define([
	"uitmvps/ztm_vps_intutive/controller/POTable.controller"
], function (Controller) {
	"use strict";

	QUnit.module("POTable Controller");

	QUnit.test("I should test the POTable controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

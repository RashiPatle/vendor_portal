/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"uitmvps/ztm_vps_intutive/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.ActionToolbarTesting.Component", {
		metadata : {
			manifest: "json"
		},
        init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
        }
	});
});

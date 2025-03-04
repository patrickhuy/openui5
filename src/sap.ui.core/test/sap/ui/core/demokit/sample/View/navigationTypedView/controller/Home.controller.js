sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
	"use strict";

	return Controller.extend("sap.ui.core.sample.View.navigationTypedView.controller.Home", {
		navToNext() {
			const router = UIComponent.getRouterFor(this);
			router.navTo("next");
		}

	});
});
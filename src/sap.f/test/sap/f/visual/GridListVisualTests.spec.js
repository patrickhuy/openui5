/* eslint-env node */
/* global describe, it, element, by, takeScreenshot, browser, expect */
var utils = require("../../../../../sap.ui.integration/test/sap/ui/integration/visual/cardVisualTestUtils");

describe("sap.f.GridListVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.f.GridList";

	var bDesktop = null;

	function goToIconTabFilter (sKey) {
		return browser.executeScript(function (sId) {
			var Element = sap.ui.require("sap/ui/core/Element");
			Element.getElementById('__component0---app--itb').setSelectedKey(sId); // directly set the key to avoid issues with overflow behavior
		}, sKey);
	}

	function takePictureOfContent (sPictureTitle) {
		var oContent = element(by.css(".sapMITBContainerContent"));
		expect(takeScreenshot(oContent)).toLookAs(sPictureTitle);
	}

	it("should visualize GridList with basic layout", function () {
		browser.executeScript("return sap.ui.Device.system.desktop;")
			.then(function (response) {
				bDesktop = response;
			});

		takePictureOfContent("0_general");
	});

	it("should visualize GridList with no items", function () {
		utils.takePictureOfElement({
			control: {
				viewNamespace: "sap.f.gridlist.view.examples.",
				viewName: "General",
				interaction: "root",
				id: "noItems"
			}
		}, "0_general_noItems");
	});

	it("should visualize GridList with breakpoints", function () {
		goToIconTabFilter("GridList2").then(function () {
			takePictureOfContent("1_breakpoints");
		});
	});

	it("should visualize GridList with BoxContainer layout", function () {
		goToIconTabFilter("GridList3").then(function () {
			takePictureOfContent("2_boxcontainer");
		});
	});

	it("should visualize growing GridList", function () {
		goToIconTabFilter("GridList4").then(function () {
			takePictureOfContent("3_growing");
		});

		element(by.css(".sapMGrowingListTrigger")).click();
		takePictureOfContent("4_growing_more");

		element(by.css(".sapMGrowingListTrigger")).click();
		takePictureOfContent("4_growing_second_grow");
	});

	it("should visualize growing GridList with GridBoxLayout and Grouping", function () {
		browser.executeScript("sap.ui.getCore().byId('__component0---app--page').scrollTo(0)").then(function () {
			goToIconTabFilter("GridList4a");
		}).then(function () {
			takePictureOfContent("4A_growing");
		});

		element(by.css(".sapMSlider + .sapFGridList .sapMGrowingListTrigger")).click();
		takePictureOfContent("4A_growing_more");

		element(by.css(".sapMSlider + .sapFGridList .sapMGrowingListTrigger")).click();
		takePictureOfContent("4A_growing_second_grow");
	});

	it("should visualize growing GridList with GridBoxLayout after Resizing", function () {
		if (bDesktop) {
			browser.executeScript('document.getElementsByClassName("sapMITBContent")[0].style.width = "40%"');
		} else {
			browser.executeScript('document.getElementsByClassName("sapMITBContent")[0].style.width = "90%"');
		}
		takePictureOfContent("4B_resizing");
		browser.executeScript('document.getElementsByClassName("sapMITBContent")[0].style.width = ""');
	});

	it("should visualize GridList grouping with auto row height", function () {
		browser.executeScript("sap.ui.getCore().byId('__component0---app--page').scrollTo(0)").then(function () {
			goToIconTabFilter("GridList5");
		}).then(function () {
			takePictureOfContent("5_grouping1");
		});
	});

	it("should visualize GridList grouping with auto row height and align-items start", function () {
		goToIconTabFilter("GridList6").then(function () {
			takePictureOfContent("6_grouping2");
		});
	});

	it("should visualize GridList grouping with equal rows", function () {
		goToIconTabFilter("GridList7").then(function () {
			takePictureOfContent("7_grouping3");
		});
	});

	it("should visualize GridList grouping with equal rows and gridTemplateRows 3rem", function () {
		goToIconTabFilter("GridList8").then(function () {
			takePictureOfContent("8_grouping4");
		});
	});

	it("should visualize GridList grouping with default layout", function () {
		goToIconTabFilter("GridList9").then(function () {
			takePictureOfContent("9_grouping5");
		});
	});

	it("should visualize GridList with some properties changed", function () {
		goToIconTabFilter("GridList10").then(function () {
			takePictureOfContent("10_properties_counters");
		});

		browser.executeScript('document.getElementById("__xmlview10--GridListSingleSelectLeft").scrollIntoView()').then(function () {
			takePictureOfContent("10_properties_SingleSelectLeft");
		});

		browser.executeScript('document.getElementById("__xmlview10--GridListMultiSelect").scrollIntoView()').then(function () {
			takePictureOfContent("10_properties_MultiSelect");
		});
	});

	it("should show correct focus border of Table as content", function () {
		goToIconTabFilter("GridList13");

		var oTableItem = element(by.control({
			id: "tableItem1",
			viewName: "sap.f.gridlist.view.Main",
			controlType: "sap.m.ColumnListItem"
		}));

		var oGLI = element(by.control({
			id: "item1",
			viewName: "sap.f.gridlist.view.Main",
			controlType: "sap.m.StandardListItem"
		}));

		oTableItem.click();
		expect(takeScreenshot(oGLI)).toLookAs("11_table_focus");
	});

	it("should show correct focus border of List as content", function () {
		var oListItem = element(by.control({
			id: "listItem1",
			viewName: "sap.f.gridlist.view.Main",
			controlType: "sap.m.StandardListItem"
		}));

		var oGLI = element(by.control({
			id: "item2",
			viewName: "sap.f.gridlist.view.Main",
			controlType: "sap.m.StandardListItem"
		}));

		oListItem.click();
		expect(takeScreenshot(oGLI)).toLookAs("12_list_focus");
	});
});
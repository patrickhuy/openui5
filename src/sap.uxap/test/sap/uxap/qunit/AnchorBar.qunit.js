/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	'./ObjectPageLayoutUtils',
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/uxap/AnchorBar",
	"sap/m/Button",
	"sap/m/Text",
	"sap/base/i18n/Localization",
	// jQuery Plugin "scrollLeftRTL"
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(Library, nextUIUpdate, jQuery, QUnitUtils, KeyCodes, utils, Device, Core, InvisibleText, XMLView, JSONModel, AnchorBar, Button, Text, Localization) {
	"use strict";

	var iRenderingDelay = 2000,
		ANCHORBAR_CLASS_SELECTOR = ".sapUxAPAnchorBar",
		HIERARCHICAL_CLASS_SELECTOR = ".sapUxAPHierarchicalSelect",
		BREAK_POINTS = {
			Phone: 600,
			Tablet: 1024,
			Desktop: 2000
		};

	/**
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

	function checkButtonAriaAttribute(assert, oButton, sAttribute, sExpected, sMessage) {
		if (oButton.isA("sap.m.MenuButton")) {
			oButton = oButton._getButtonControl();
		}

		assert.strictEqual(oButton.$().attr(sAttribute), sExpected, sMessage);
	}

	QUnit.module("properties", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			return XMLView.create({
				id: "UxAP-69_anchorBar",
				viewName: "view.UxAP-69_AnchorBar"
			}).then(async function(oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.placeAt('qunit-fixture');
				await nextUIUpdate(this.clock);
				this.clock.tick(iRenderingDelay);
			}.bind(this));
		},
		afterEach: async function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
		}
	});

	QUnit.test("Show/Hide Bar", async function(assert) {
		assert.expect(3); //number of assertions

		// test whether it is visible by default
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar visible by default");

		// hide the anchor bar
		this.oObjectPage.setShowAnchorBar(false);

		// allow for re-render
		await nextUIUpdate(this.clock);

		// test whether it is hidden
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length, 0, "anchorBar hidden");

		// show the anchor bar back
		this.oObjectPage.setShowAnchorBar(true);

		// allow for re-render
		await nextUIUpdate(this.clock);
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar displayed");

	});

	QUnit.test("Show/Hide popover", async function(assert) {
		var oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		// initial assert
		assert.ok(oAnchorBarButton.isA("sap.m.MenuButton"), "MenuButton is correctly used when showAnchorBarPopover=true");

		//no longer show the popover
		this.oObjectPage.setShowAnchorBarPopover(false);

		// allow for re-render
		await nextUIUpdate(this.clock);
		oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		// assert
		assert.ok(oAnchorBarButton.isA("sap.m.Button"), "Button is correctly used when showAnchorBarPopover=false");
	});

	QUnit.test("Selected button", function (assert) {
		//select button programmatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			oLastSectionButton = aAnchorBarContent[aAnchorBarContent.length - 1],
			oMenuButton = aAnchorBarContent[1];

		oAnchorBar.setSelectedButton(oLastSectionButton);

		// allow for scrolling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oLastSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "select button programmatically");
		checkButtonAriaAttribute(assert, oLastSectionButton, "aria-selected", "true", "ARIA selected state should be true for the selected button");
		checkButtonAriaAttribute(assert, oFirstSectionButton, "aria-selected", "false", "ARIA selected state should be false for the unselected button");
		checkButtonAriaAttribute(assert, oMenuButton, "aria-selected", "false", "ARIA selected state should be false for the unselected split button");

		oAnchorBar.setSelectedButton(oMenuButton);

		// allow for scrolling
		this.clock.tick(iRenderingDelay);

		checkButtonAriaAttribute(assert, oMenuButton, "aria-selected", "true", "ARIA selected state should be true for the selected split button");
	});

	QUnit.test("aria-selected is set correctly in _computeNextSectionInfo", function (assert) {
		//select button programmatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			oLastSectionButton = aAnchorBarContent[aAnchorBarContent.length - 1];

		// act
		oAnchorBar.setSelectedButton(oLastSectionButton);
		oAnchorBar._computeBarSectionsInfo();

		checkButtonAriaAttribute(assert, oFirstSectionButton, "aria-selected", "false", "ARIA selected state should be false for the unselected button");
		checkButtonAriaAttribute(assert, oLastSectionButton, "aria-selected", "true", "ARIA selected state should be true for the selected button");
	});

	QUnit.test("Selected button always set correctly", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButtonId = aAnchorBarContent[0].getId(),
			sInvalidButtonId = "InvalidId";

		oAnchorBar.setSelectedButton(oFirstSectionButtonId);

		assert.strictEqual(oAnchorBar.getSelectedButton(), oFirstSectionButtonId, "Selected button id is correct");

		oAnchorBar.setSelectedButton(sInvalidButtonId);

		assert.strictEqual(oAnchorBar.getSelectedButton(), oFirstSectionButtonId, "Selected button id is still the valid one");
	});

	QUnit.test("Custom button", function (assert) {
		//select button programmatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oCustomButton = this.oObjectPage.getSections()[0].getCustomAnchorBarButton(),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			pressSpy = this.spy(oAnchorBar, "fireEvent");

		oFirstSectionButton.firePress();

		assert.ok(pressSpy.calledOnce, "firePress of custom AnchorBar button calls the scroll to section function");
		assert.ok(pressSpy.calledWithMatch("_anchorPress"), "firePress of custom AnchorBar button fires the correct event");

		oCustomButton.setEnabled(false);

		// allow for scrolling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oFirstSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "selection is preserved");
		assert.strictEqual(oFirstSectionButton.getEnabled(), false, "property change is propagated");
	});

	QUnit.test("Custom button for sub-section", function (assert) {
		//select button programmatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oCustomButton = this.oObjectPage.getSections()[1].getSubSections()[0].getCustomAnchorBarButton(),
			oSecondSectionButton = oAnchorBar.getContent()[1],
			oSubSectionButton = oSecondSectionButton.getMenu().getItems()[0];

		//assert
		assert.strictEqual(oSubSectionButton.getText(), oCustomButton.getText(), "custom button text is propagated to the menu item");
		assert.strictEqual(oSubSectionButton.getIcon(), oCustomButton.getIcon(), "custom button icon is propagated to the menu item");
	});

	QUnit.test("Menu Button with long text should be able to have width, bigger than 12rem", function (assert) {
		var $menuButton = jQuery("#UxAP-69_anchorBar--ObjectPageLayout-anchBar-UxAP-69_anchorBar--section16-anchor");

		assert.ok(parseInt($menuButton.css("width")) > (12 * parseInt(jQuery("body").css("font-size"))),
			"Max width style of MenuButton is overridden so that it is bigger than 12rem");
	});

	QUnit.test("Phone view", function (assert) {
		//display hierarchical select
		this.oObjectPage.toggleStyleClass("sapUxAPObjectPageLayout-Std-Phone", true);
		this.oObjectPage.invalidate();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.ok(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0 && jQuery(HIERARCHICAL_CLASS_SELECTOR).is(":visible") == true, "display hierarchical select");
	});

	QUnit.test("AnchorBar is correctly resized after resize of its parent ObjectPageLayout", function (assert) {
		// Arrange
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oMediaRange,
			sRangeSet = Device.media.RANGESETS.SAP_STANDARD;

		// Act
		// Resizing ObjectPage to Phone breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Phone + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[0],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[0]);

		// Act
		// Resizing ObjectPage to Tablet breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Tablet + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[1],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[1]);

		// Act
		// Resizing ObjectPage to Desktop breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Desktop + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[2],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[2]);
	});

	QUnit.test("Anchors for sections with multiple subsection must have arrow-down icon", function (assert) {
		var $arrowDownIcons;

		$arrowDownIcons = this.oObjectPage.$().find(".sapUxAPAnchorBar .sapUxAPAnchorBarButton .sapMBtnIcon");
		assert.ok($arrowDownIcons.length === 2, "Anchorbar has 2 buttons with arrow-down icon");
	});

	QUnit.test("Arrow left nad arrow right buttons should have correct tooltips", async function(assert) {
		var oArrowLeft = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollLeft"),
			oArrowRight = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollRight"),
			oRB = Library.getResourceBundleFor("sap.uxap"),
			sArrowLeftTooltip = oRB.getText("TOOLTIP_OP_SCROLL_LEFT_ARROW"),
			sArrowRightTooltip = oRB.getText("TOOLTIP_OP_SCROLL_RIGHT_ARROW");

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "'");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "'");

		//act
		Localization.setRTL(true);
		await nextUIUpdate(this.clock);

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "' in RTL mode");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "' in RTL mode");

		//cleanup
		Localization.setRTL(false);
	});

	QUnit.test("When using the objectPageNavigation the 'navigate' event is fired with the appropriate arguments", async function(assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oExpectedSection,
			oExpectedSubSection,
			navigateSpy = this.spy(this.oObjectPage, "fireNavigate");

		this.oObjectPage.setShowAnchorBarPopover(false);
		await nextUIUpdate(this.clock);

		oExpectedSection = this.oObjectPage.getSections()[1];
		oExpectedSubSection = oExpectedSection.getSubSections()[0];
		oAnchorBar.getContent()[1].firePress();

		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("section", oExpectedSection)), "Event fired has the correct section parameter attached");
		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("subSection", oExpectedSubSection)), "Event fired has the correct subSection parameter attached");
	});

	QUnit.test("The 'navigate' event is fired after the navigation is done, so a new Section can be selected in the handler", async function(assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			fnDone = assert.async();

		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.setShowAnchorBarPopover(false);
		this.oObjectPage.attachNavigate(function () {
			// On navigation to a Section, we want to programatically select another Section
			this.oObjectPage.setSelectedSection(this.oObjectPage.getSections()[1]);
		}.bind(this));
		await nextUIUpdate(this.clock);

		oAnchorBar.getContent()[0].firePress();

		this.clock.tick(1000);
		assert.strictEqual(oAnchorBar.getSelectedButton(), oAnchorBar.getContent()[1].getId(), "Selected Section is correct");
		fnDone();
	});


	var oModel = new JSONModel({
		sections: [
			{title: "my first section"},
			{title: "my second section"},
			{title: "my third section"},
			{title: "my fourth section"}
		],
		compositeTitle: "Title({0})",
		objectCount: 1
	});

	QUnit.module("custom setters", {
		beforeEach: async function() {
			this.oAnchorBar = new AnchorBar();
			this.oAnchorBar.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oAnchorBar = null;
		}
	});

	QUnit.test("AnchorBar - backgroundDesign", async function(assert) {
		var $oDomRef = this.oAnchorBar.$();

		// assert
		assert.equal(this.oAnchorBar.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		this.oAnchorBar.setBackgroundDesign("Solid");
		await nextUIUpdate();

		// assert
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarSolid"), "Should have sapUxAPAnchorBarSolid class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oAnchorBar.setBackgroundDesign("Transparent");
		await nextUIUpdate();

		// assert
		assert.notOk($oDomRef.hasClass("sapUxAPAnchorBarSolid"), "Should not have sapUxAPAnchorBarSolid class");
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarTransparent"), "Should have sapUxAPAnchorBarTransparent class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oAnchorBar.setBackgroundDesign("Translucent");
		await nextUIUpdate();

		// assert
		assert.notOk($oDomRef.hasClass("sapUxAPAnchorBarTransparent"), "Should not have sapUxAPAnchorBarTransparent class");
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarTranslucent"), "Should have sapUxAPAnchorBarTranslucent class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
		await clearPendingUIUpdates();
	});

	QUnit.module("simple binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			return XMLView.create({
				id: "UxAP-69_anchorBarBinding",
				viewName: "view.UxAP-69_AnchorBarBinding"
			}).then(async function(oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.setModel(oModel);
				this.anchorBarView.placeAt('qunit-fixture');
				await nextUIUpdate(this.clock);
				this.clock.tick(iRenderingDelay);
			}.bind(this));
		},
		afterEach: async function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
		}
	});

	QUnit.test("Simple binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my first section", "binding in view correctly initialized");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/sections/0/title", "my updated title");
		oModel.refresh(true);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title", "section title binding updates anchor bar button");
	});

	QUnit.test("Update by setTitle", function (assert) {

		var oSection = this.oObjectPage.getSections()[0];

		oSection.setTitle("my updated title again");
		this.clock.tick(iRenderingDelay);

		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title again", "section title set updates anchor bar button");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", "/sections/3/title");

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");
	});

	QUnit.test("Dynamic bind property OneTime", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title",
			mode: "OneTime"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "New model value must not be reflected");
		oModel.setProperty("/sections/3/title", "my fourth section");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "newvalue", "New model value must not be reflected");
	});

	QUnit.test("selectItems with bound text", function (assert) {

		var sButtonText = "my text",
			oAnchorBar = new AnchorBar(),
			oModel = new JSONModel({
				buttonText: sButtonText
			}),
			oButton = new Button({text: "{/buttonText}"});

		// Check select-item is created before the data-binding of the text is resolved
		oAnchorBar.addContent(oButton);
		assert.equal(oAnchorBar._oSelect.getItems().length, 1, "select item for the button is created");

		// Check the data-binding of the text is successfully resolved
		oAnchorBar.setModel(oModel);
		assert.equal(oAnchorBar._oSelect.getItems()[0].getText(), sButtonText, "select item for the button has correct text");
	});

	QUnit.test("selectItems with bound text and contextBinding", function (assert) {

		var sButtonText = "my text",
			oAnchorBar = new AnchorBar(),
			oModel = new JSONModel({
				buttons: {
					buttonText: sButtonText
				}
			}),
			oButton = new Button({text: "{buttonText}"});

		// Check select-item is created before the data-binding of the text is resolved
		oAnchorBar.addContent(oButton);
		assert.equal(oAnchorBar._oSelect.getItems().length, 1, "select item for the button is created");

		// Check the data-binding of the text is successfully resolved
		oAnchorBar.setBindingContext(oModel.createBindingContext("/buttons"));
		oAnchorBar.setModel(oModel);
		assert.equal(oAnchorBar._oSelect.getItems()[0].getText(), sButtonText, "select item for the button has correct text");
	});

	QUnit.module("complex binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			return XMLView.create({
				id: "UxAP-69_anchorBarBinding",
				viewName: "view.UxAP-69_AnchorBarBinding"
			}).then(async function(oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.setModel(oModel);
				this.anchorBarView.placeAt('qunit-fixture');
				await nextUIUpdate(this.clock);
				this.clock.tick(iRenderingDelay);
			}.bind(this));
		},
		afterEach: async function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
		}
	});

	QUnit.test("Complex binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(1)", "complex title binding correct");
	});

	QUnit.test("Update by model change", async function(assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/objectCount", 2);
		oModel.refresh(true);
		await nextUIUpdate(this.clock);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(2)", "section title binding updates anchor bar button");
	});

	QUnit.module("Private members", {
		beforeEach: function () {
			this.anchorBar = new AnchorBar();
		},
		afterEach: function () {
			this.anchorBar.destroy();
		}
	});

	QUnit.test("Assignment of _iREMSize, _iTolerance and _iOffset in onBeforeRendering method", function (assert) {
		var iFontSize = 16;

		this.stub(jQuery, "css").returns(iFontSize);

		// assert
		assert.equal(this.anchorBar._iREMSize, 0, "Initial value of _iREMSize is 0");
		assert.equal(this.anchorBar._iTolerance, 0, "Initial value of _iTolerance is 0");
		assert.equal(this.anchorBar._iOffset, 0, "Initial value of _iOffset is 0");

		// act
		this.anchorBar.onBeforeRendering();

		// assert
		assert.equal(this.anchorBar._iREMSize, iFontSize, "After onBeforeRendering call the value of _iREMSize is changed to 16");
		assert.equal(this.anchorBar._iTolerance, iFontSize, "After onBeforeRendering call the value of _iTolerance is changed to 16");
		assert.equal(this.anchorBar._iOffset, iFontSize * 3, "After onBeforeRendering call the value of _iOffset is changed to 58");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			return XMLView.create({
				id: "UxAP-69_anchorBarBinding",
				viewName: "view.UxAP-69_AnchorBarBinding"
			}).then(async function(oView) {
				this.anchorBarView = oView;
				this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
				this.anchorBarView.setModel(oModel);
				this.anchorBarView.placeAt('qunit-fixture');
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("AnchorBar container has the correct role", function (assert) {
		var $oMenu = jQuery("#UxAP-69_anchorBarBinding--ObjectPageLayout-anchBar-scroll");

		assert.strictEqual($oMenu.attr("role"), "listbox", "AnchorBar container has the listbox role.");
	});

	QUnit.test("Tooltip set on HierarchicalSelect", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oSelect = oAnchorBar._getHierarchicalSelect(),
			oRB = Library.getResourceBundleFor("sap.uxap"),
			sExpectedTooltip = oRB.getText("ANCHOR_BAR_OVERFLOW");

		assert.strictEqual(oSelect.getTooltip(), sExpectedTooltip, "Tooltip correctly set.");
	});

	QUnit.test("Hierarchy in HierarchicalSelect is preserved on arrow navigation", function (assert) {
		// Arrange
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oSelect = oAnchorBar._getHierarchicalSelect(),
			oDialog = oSelect.getAggregation("picker"),
			clock = sinon.useFakeTimers(),
			oSelectList = oSelect.getList(),
			oOnAfterRenderingDelegate = {
				onAfterRendering: function () {
					// Assert
					oSelectList.removeEventDelegate(oOnAfterRenderingDelegate);
					assert.strictEqual(oApplyClassesSpy.callCount, 1,
						"Hierarchy classes applied once onAfterRendering of the SelectList via _applyHierarchyLevelClasses.");

					// Clean Up
					oApplyClassesSpy.resetHistory();
					clock.restore();
					done();
				}
			},
			done = assert.async(),
			oApplyClassesSpy;

			oDialog.attachAfterOpen(function () {
				clock.tick(100); // allow finish rendering

				oApplyClassesSpy = this.spy(oSelect, "_applyHierarchyLevelClasses");

				// Act - simulate arrow down key down
				QUnitUtils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, false, false);
				oSelectList.addEventDelegate(oOnAfterRenderingDelegate);
			}.bind(this));

		// Act - Open the picker
		oSelect.focus();
		QUnitUtils.triggerKeydown(oSelect.getFocusDomRef(), KeyCodes.F4);
		clock.tick(500);
	});

	QUnit.test("Selecting Section from HierarchicalSelect focuses the selected Section", function (assert) {
		// Arrange
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oSelect = oAnchorBar._getHierarchicalSelect(),
			oSelectedSubSection = this.oObjectPage.getSections()[0].getSubSections()[0],
			oStub = this.stub(oSelectedSubSection, "getDomRef").callsFake(function () {
				return {
					focus: function () {
						assert.ok(true, "Selected Section is focused");

							// Clean up
							oStub.restore();
							clock.restore();
							done();
					}
				};
			}),
			clock = sinon.useFakeTimers(),
			done = assert.async();

			assert.expect(1);
			oAnchorBar._onSelectChange({
				getParameter: function () {
					return oSelect.getItems()[1];
				}
			});

			clock.tick(100);
	});

	QUnit.test("Count information", function (assert) {
		var aAnchorBarContent = this.oObjectPage.getAggregation("_anchorBar").getContent(),
			iAnchorBarContentLength = aAnchorBarContent.length,
			oCurrentButton,
			iIndex;

		for (iIndex = 0; iIndex < iAnchorBarContentLength; iIndex++) {
			oCurrentButton = aAnchorBarContent[iIndex];
			// Convert the numbers to strings, since .attr would return a string
			// We need to add '+ 1' to the index for posinset, since posinset starts from 1, rather than 0
			checkButtonAriaAttribute(assert, oCurrentButton, "aria-setsize", iAnchorBarContentLength.toString(),
				"aria-setsize of the button indicates anchorBar's length correctly");
			checkButtonAriaAttribute(assert, oCurrentButton, "aria-posinset", (iIndex + 1).toString(),
				"aria-posinset indicates the correct position of the button");
		}
	});

	QUnit.test("ARIA role and role description of buttons", function (assert) {
		var aAnchorBarContent = this.oObjectPage.getAggregation("_anchorBar").getContent(),
			iAnchorBarContentLength = aAnchorBarContent.length,
			sInvTextId = InvisibleText.getStaticId("sap.m", "SPLIT_BUTTON_DESCRIPTION"),
			oCurrentButton,
			iIndex;

		for (iIndex = 0; iIndex < iAnchorBarContentLength; iIndex++) {
			oCurrentButton = aAnchorBarContent[iIndex];

			if (oCurrentButton.isA("sap.m.MenuButton")) {
				oCurrentButton = oCurrentButton._getButtonControl();
				assert.ok(oCurrentButton.$().attr("aria-labelledby").indexOf(sInvTextId) === -1,
					"aria-labelledby of button excludes the id of the 'Split Button' text");

				assert.strictEqual(oCurrentButton.$().find(".sapMBtn").attr("role"), "none",
				"inner buttons are hidden from accessibility API");
			}

			checkButtonAriaAttribute(assert, oCurrentButton, "role", "option",
				"aria role of the button is set correctly");
		}
	});

	QUnit.test("Enhance accessibility for submenu buttons is called", function (assert) {
		var	oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0],
			oSplitButton = oAnchorBarButton._getButtonControl(),
			oMenu = oAnchorBarButton.getMenu(),
			accEnhanceSpy = this.spy(oMenu, "_fnEnhanceUnifiedMenuAccState");

		// act
		oSplitButton.fireArrowPress();

		// assert
		assert.ok(accEnhanceSpy.calledTwice, "Enhance accessibility function of the menu is called for 2 buttons");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oAnchorBarButton1 = new Button({text: "Section 1"});
			this.oAnchorBarButton2 = new Button({text: "Section 2"});
			this.oAnchorBar = new AnchorBar({
				content: [
					this.oAnchorBarButton1,
					this.oAnchorBarButton2
				]
			});
		},
		afterEach: function () {
			this.oAnchorBar.destroy();
			this.oAnchorBar = null;
			this.oAnchorBarButton = null;
		}
	});

	QUnit.test("content tabindex values", async function(assert) {
		assert.expect(4);

		// act
		this.oAnchorBar.placeAt('qunit-fixture');
		await nextUIUpdate();

		// assert
		this.oAnchorBar.getContent().forEach(function(oButton) {
			assert.strictEqual(oButton.$().attr('tabindex'), '-1', "All button has tabindex of -1 by default");
		});

		// act
		this.oAnchorBar.setSelectedButton(this.oAnchorBarButton2);

		assert.strictEqual(this.oAnchorBarButton2.$().attr('tabindex'), '0', "Selected button has tabindex of 0");
		assert.strictEqual(this.oAnchorBarButton1.$().attr('tabindex'), '-1', "Rest of the button remains with tabindex of -1");
	});

	QUnit.test("focus change before rerendering", async function(assert) {
		var oSelect = this.oAnchorBar._getHierarchicalSelect();

		this.oAnchorBar.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Act:
		// (1) focus the select
		oSelect.onfocusin({target: oSelect.getFocusDomRef()});
		// (2) mock a call from ObjectPage to rebuild content (e.g. when change in the content has to be reflected in the anchorBar)
		this.oAnchorBar._resetControl();
		try {
			// (3) remove focus
			oSelect.onfocusout();
			assert.ok(true, "no error");
		} catch (e) {
			assert.notOk(e, "error upon focusout");
		}
	});

	QUnit.module("Scrolling", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 15;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("AnchorBar scrolled to section on width change", function (assert) {
		var oPage = this.oObjectPage,
			done = assert.async(),
			oSection = oPage.getSections()[14],
			oAnchorBar,
			sectionId = oSection.getId(),
			anchorBarStub,
			fnScrollToStub = function(sectionId) {
				// Assert
				assert.equal(anchorBarStub.callCount, 1, "AnchorBar is scrolled");
				assert.equal(anchorBarStub.args[0][0], sectionId, "AnchorBar scrolled to correct section");
			},
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				anchorBarStub = this.stub(oAnchorBar, "scrollToSection").callsFake(fnScrollToStub);

				//act
				oPage.scrollToSection(sectionId, 0, null, true);
				oPage.getDomRef().style.width = 772	 + "px";
				anchorBarStub.reset();
				// synchronously call the resize listener to spped up the test
				oAnchorBar._adjustSize({size: {width: 772}, oldSize: {width: 1000}});

				// Clean up
				done();
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady.bind(this));
		this.oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("AnchorBar scrolled to tab on sapright, when tab is not visible", function (assert) {
		// arrange
		var oPage = this.oObjectPage,
			done = assert.async(),
			oAnchorBar,
			aAnchors,
			oSpyForceScroll,
			oSpyScrollerScroll,
			oEvent,
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				aAnchors = oAnchorBar.getContent();
				oSpyForceScroll = this.spy(oAnchorBar, "_forceScrollIfNeeded");
				oSpyScrollerScroll = this.spy(oAnchorBar._oScroller, "scrollTo");
				oEvent = {
					target: {
						id: aAnchors[10].getId()
					},
					preventDefault: function () {}
				};

				//act
				oAnchorBar.onsapright(oEvent);

				// assert
				assert.ok(oSpyForceScroll.calledWith(aAnchors[11]), "_forceScrollIfNeeded is called with next AnchorBar tab");
				assert.ok(oSpyScrollerScroll.calledOnce, "Scroller scrollTo is called");

				// clean up
				done();
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady.bind(this));
		this.oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("AnchorBar not scrolled to tab on sapright, when tab is fully visible", function (assert) {
		// arrange
		var oPage = this.oObjectPage,
			done = assert.async(),
			oAnchorBar,
			aAnchors,
			oSpyScrollerScroll,
			oEvent,
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				aAnchors = oAnchorBar.getContent();
				oSpyScrollerScroll = this.spy(oAnchorBar._oScroller, "scrollTo");
				oEvent = {
					target: {
						id: aAnchors[2].getId()
					},
					preventDefault: function () {}
				};

				//act
				oAnchorBar.onsapright(oEvent);

				// assert
				assert.notOk(oSpyScrollerScroll.calledOnce, "Scroller scrollTo is not called");

				// clean up
				done();
			};

		assert.expect(1);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady.bind(this));
		this.oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("AnchorBar scrolled to tab on sapleft, when tab is not visible", function (assert) {
		// arrange
		var oPage = this.oObjectPage,
			oSection = oPage.getSections()[10],
			done = assert.async(),
			oAnchorBar,
			aAnchors,
			oSpyForceScroll,
			oSpyScrollerScroll,
			oEvent,
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				aAnchors = oAnchorBar.getContent();
				oSpyForceScroll = this.spy(oAnchorBar, "_forceScrollIfNeeded");
				oEvent = {
					target: {
						id: aAnchors[1].getId()
					},
					preventDefault: function () {}
				};

				//act
				oPage.scrollToSection(oSection.getId(), 0, null, true);
				oSpyScrollerScroll = this.spy(oAnchorBar._oScroller, "scrollTo");

				setTimeout(function () {
					// act

					oAnchorBar.onsapleft(oEvent);
					// assert
					assert.ok(oSpyForceScroll.calledWith(aAnchors[0]), "_forceScrollIfNeeded is called with previous AnchorBar tab");
					assert.ok(oSpyScrollerScroll.calledOnce, "Scroller scrollTo is called");

					// clean up
					done();
				}, 300);
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady.bind(this));
		this.oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.module("Content", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 2;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("AnchorBar has correct number of items", function (assert) {
		var oPage = this.oObjectPage,
			iExpectedTotalSections = this.NUMBER_OF_SECTIONS,
			iExpectedTotalSubSections = this.NUMBER_OF_SECTIONS * this.NUMBER_OF_SUB_SECTIONS,
			done = assert.async(),
			oAnchorBar,
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				assert.equal(oAnchorBar.getContent().length, iExpectedTotalSections);
				assert.equal(oAnchorBar._oSelect.getItems().length, iExpectedTotalSections + iExpectedTotalSubSections);
				done();
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		this.oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("AnchorBar content is correctly updated", function (assert) {
		var oPage = this.oObjectPage,
			oSubSection1,
			oSubSection2,
			iTotalSections = this.NUMBER_OF_SECTIONS,
			iTotalSubSections = this.NUMBER_OF_SECTIONS * this.NUMBER_OF_SUB_SECTIONS,
			done = assert.async(),
			oAnchorBar,
			fnOnInitRendering = function() {
				oSubSection1 = utils.oFactory.getSubSection(1, [new Text()]);
				oSubSection2 = utils.oFactory.getSubSection(2, [new Text()]);
				oPage.addSection(utils.oFactory.getSection(2, "H2", [oSubSection1, oSubSection2]));
				iTotalSections += 1;
				iTotalSubSections += 2;
				oPage._requestAdjustLayoutAndUxRules(true);
				oAnchorBar = oPage.getAggregation("_anchorBar");
				assert.equal(oAnchorBar.getContent().length, iTotalSections);
				assert.equal(oAnchorBar._oSelect.getItems().length, iTotalSections + iTotalSubSections);
				done();
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnInitRendering);
		this.oObjectPage.placeAt("qunit-fixture");
	});


	QUnit.module("RTL", {
		beforeEach: async function(assert) {
			Localization.setRTL(true);
			var done = assert.async(),
			oAnchorBar = new AnchorBar();
			this.anchorBar = oAnchorBar;
			this.anchorBar.addEventDelegate({
				onAfterRendering: function() {
					done();
					oAnchorBar.removeEventDelegate(this);
				}
			});
			for (var i = 0; i < 100; i++) {
				this.anchorBar.addContent(new Button({text: "button " + i}));
			}
			this.anchorBar.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			Localization.setRTL(false);
			this.anchorBar.destroy();
			this.anchorBar = null;
		}
	});

	QUnit.test("Scroll direction is correct", function (assert) {
		var done = assert.async();
		setTimeout(function() {

			// Setup: Ensure there is content in the left overflow
			this.anchorBar.$().find(".sapUxAPAnchorBarScrollContainer").scrollLeftRTL(1000);

			// Act: trigger layout calculations
			this.anchorBar._adjustSize({size: { width: 1000 }, oldSize: {}});

			// Check scroll direction
			assert.ok(this.anchorBar.$().hasClass("sapUxAPAnchorBarScrollRight"), "sapUxAPAnchorBarScrollRight is correct");

			// Act: no more content in the left overflow
			this.anchorBar.$().find(".sapUxAPAnchorBarScrollContainer").scrollLeftRTL(0);

			// Act: re-trigger layout calculations
			this.anchorBar._adjustSize({size: { width: 1000 }, oldSize: {}});

			// Check that scroll direction reversed
			assert.ok(this.anchorBar.$().hasClass("sapUxAPAnchorBarScrollLeft"), "sapUxAPAnchorBarScrollLeft is correct");

			done();
		}.bind(this), 2000);
	});
});

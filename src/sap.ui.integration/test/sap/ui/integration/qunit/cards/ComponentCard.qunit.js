/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"qunit/testResources/nextCardReadyEvent"
], function (
	library,
	Card,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CardPreviewMode = library.CardPreviewMode;

	QUnit.module("Component Card", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "800px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("ComponentContainer shouldn't be created when preview mode is 'Abstract'", async function (assert) {
		this.oCard.setPreviewMode(CardPreviewMode.Abstract);
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.component.card1",
				"type": "card"
			},
			"sap.card": {
				"type": "Component"
			}
		});

		await nextCardReadyEvent(this.oCard);

		assert.notOk(this.oCard.getCardContent().getAggregation("_content"), "ComponentContainer shouldn't have been created");
	});

	QUnit.test("resourceRoots described in the manifest are applied", async function (assert) {
		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/componentCard/manifest.json");

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(this.oCard.getCardContent(), "The card content should be created");
		assert.notOk(this.oCard.getBlockingMessage(), "There shouldn't be any error during the creation");
	});

	QUnit.test("resourceRoots described in the manifest are applied when the manifest is provided as object", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.componentCard",
				"type": "card"
			},
			"sap.ui5": {
				"rootView": {
					"viewName": "test.componentCard.V",
					"type": "XML",
					"async": true,
					"id": "app"
				},
				"resourceRoots": {
					"component.card.inner.resources": "./componentCardInnerResources"
				},
				"dependencies": {
					"minUI5Version": "1.38",
					"libs": {
						"component.card.inner.resources.lib1": {}
					}
				}
			},
			"sap.card": {
				"type": "Component",
				"header": {
					"title": "Visit our workshop"
				}
			}
		});
		this.oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/testResources/componentCard/");

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(this.oCard.getCardContent(), "The card content should be created");
		assert.notOk(this.oCard.getBlockingMessage(), "There shouldn't be any error during the creation");
	});


});

/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_debounce",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Stretch",
	"sap/ui/thirdparty/sinon-4"
], function(
	_debounce,
	Button,
	HBox,
	VBox,
	ManagedObject,
	DesignTime,
	OverlayRegistry,
	FormContainer,
	FormElement,
	FormLayout,
	Form,
	VerticalLayout,
	nextUIUpdate,
	Plugin,
	Stretch,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var sStretchStyleClass = Stretch.STRETCHSTYLECLASS;

	function isStretched(oOverlay) {
		var oElement = oOverlay.getElement();
		if (oElement.hasStyleClass) {
			return oElement.hasStyleClass(sStretchStyleClass);
		}
		return oOverlay.getAssociatedDomRef().hasClass(sStretchStyleClass);
	}

	QUnit.module("Given a stretch plugin", {
		beforeEach() {
			this.oStretchPlugin = new Stretch();
		},
		afterEach() {
			this.oStretchPlugin.destroy();
		}
	}, function() {
		QUnit.test("add / remove StretchCandidate", function(assert) {
			var oOverlay1 = {
				getElement() {
					return new ManagedObject("element1");
				},
				getAssociatedDomRef() {}
			};
			var oOverlay2 = {
				getElement() {
					return new ManagedObject("element2");
				},
				getAssociatedDomRef() {}
			};

			assert.equal(this.oStretchPlugin.getStretchCandidates().length, 0, "there is no element");

			this.oStretchPlugin.addStretchCandidate(oOverlay1);
			assert.equal(this.oStretchPlugin.getStretchCandidates().length, 1, "there is one element");
			assert.ok(this.oStretchPlugin.getStretchCandidates().includes("element1"), "the element of the first overlay was added");

			this.oStretchPlugin.addStretchCandidate(oOverlay2);
			assert.equal(this.oStretchPlugin.getStretchCandidates().length, 2, "there are two elements");
			assert.ok(this.oStretchPlugin.getStretchCandidates().includes("element2"), "the element of the second overlay was added");

			this.oStretchPlugin.removeStretchCandidate(oOverlay2);
			assert.equal(this.oStretchPlugin.getStretchCandidates().length, 1, "there is one element");
			assert.notOk(this.oStretchPlugin.getStretchCandidates().includes("element2"), "the element of the second overlay was removed");

			this.oStretchPlugin.removeStretchCandidate(oOverlay1);
			assert.equal(this.oStretchPlugin.getStretchCandidates().length, 0, "there is no element");
			assert.notOk(this.oStretchPlugin.getStretchCandidates().includes("element1"), "the element of the first overlay was removed");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							new VBox("vbox11", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox12", {
								width: "300px",
								items: new Button()
							})
						]
					}),
					this.oVBox2 = new VBox("vbox2", {
						width: "300px",
						items: [
							new VBox("vbox21", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox22", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				this.oVBoxOverlay2 = OverlayRegistry.getOverlay(this.oVBox2);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(isStretched(this.oLayoutOverlay), "the style class was set");
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class was set");
			assert.ok(isStretched(this.oVBoxOverlay2), "the style class was set");
		});

		QUnit.test("when the controls get rerendered", async function(assert) {
			this.oLayout.getParent().invalidate();
			await nextUIUpdate();

			assert.ok(isStretched(this.oLayoutOverlay), "the style class is still set");
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class is still set");
			assert.ok(isStretched(this.oVBoxOverlay2), "the style class is still set");
		});

		QUnit.test("when the controls get rerendered while a plugin is busy", async function(assert) {
			sandbox.stub(this.oStretchPlugin.getDesignTime(), "getBusyPlugins").returns([1]);
			this.oLayout.getParent().invalidate();
			await nextUIUpdate();

			assert.ok(isStretched(this.oLayoutOverlay), "the style class is still set");
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class is still set");
			assert.ok(isStretched(this.oVBoxOverlay2), "the style class is still set");
		});

		QUnit.test("when the plugin gets deregistered", function(assert) {
			var oSuperDeregisterSpy = sandbox.spy(Plugin.prototype, "deregisterElementOverlay");

			this.oStretchPlugin.deregisterElementOverlay(this.oLayoutOverlay);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay1);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay2);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was removed");
			assert.notOk(isStretched(this.oVBoxOverlay1), "the style class was removed");
			assert.notOk(isStretched(this.oVBoxOverlay2), "the style class was removed");
			assert.strictEqual(oSuperDeregisterSpy.callCount, 3, "the super class was called");
		});

		QUnit.test("when a vbox changes editable to false", function(assert) {
			var oSetStyleClassSpy = sandbox.spy(this.oStretchPlugin, "_setStyleClassForAllStretchCandidates");
			this.oVBoxOverlay1.setEditable(false);
			assert.deepEqual(oSetStyleClassSpy.lastCall.args[0], [this.oVBox1.getId()], "only one overlay is reevaluated");
			assert.ok(isStretched(this.oLayoutOverlay), "the style class was set");
			assert.notOk(isStretched(this.oVBoxOverlay1), "the style class was set");
			assert.ok(isStretched(this.oVBoxOverlay2), "the style class was set");
		});

		QUnit.test("when the root element changes editable to false", function(assert) {
			var oSetStyleClassSpy = sandbox.spy(this.oStretchPlugin, "_setStyleClassForAllStretchCandidates");
			this.oLayoutOverlay.setEditable(false);
			assert.deepEqual(oSetStyleClassSpy.lastCall.args[0], [this.oLayout.getId()], "only one overlay is reevaluated");
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was set");
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class was set");
			assert.ok(isStretched(this.oVBoxOverlay2), "the style class was set");
		});

		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				setTimeout(function() {
					this.oStretchPlugin._onElementOverlayChanged(oEvent);
					assert.notOk(isStretched(this.oLayoutOverlay), "the style class was removed");
					done();
				}.bind(this), 60);
			}, this);
			this.oLayout.setWidth("400px");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers of different sizes", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "600px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							this.oVBox2 = new VBox("vbox11", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				this.oVBoxOverlay2 = OverlayRegistry.getOverlay(this.oVBox2);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class was set");
		});

		QUnit.test("When a vbox inside becomes not editable", function(assert) {
			this.oVBoxOverlay1.setEditable(false);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
			assert.notOk(isStretched(this.oVBoxOverlay1), "the style class was removed");
		});

		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oObserver = new MutationObserver(function(aMutations) {
				aMutations.forEach(function(oMutation) {
					if (oMutation.target === this.oLayout.getDomRef() && oMutation.attributeName === "class") {
						assert.ok(isStretched(this.oLayoutOverlay), "the style class was set");
						oObserver.disconnect();
						done();
					}
				}.bind(this));
			}.bind(this));
			var oConfig = { attributes: true, childList: false, characterData: false, subtree: true};
			oObserver.observe(document.getElementById("qunit-fixture"), oConfig);

			this.oLayout.setWidth("300px");
		});

		QUnit.test("when the size of the layout changes with a busy plugin", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};
			sandbox.stub(this.oStretchPlugin, "isBusy").returns(true);
			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
				done();
			}, this);
			this.oLayout.setWidth("300px");
		});

		QUnit.test("When the inner vbox gets destroyed", function(assert) {
			var done = assert.async();
			sandbox.stub(this.oVBox1, "removeStyleClass").callsFake(function(sStyleClassName) {
				if (sStyleClassName === sStretchStyleClass) {
					assert.ok(true, "the style class was removed");
					this.oVBox1.removeStyleClass.restore();
					done();
				}
			}.bind(this));
			this.oVBox2.destroy();
		});

		QUnit.test("When the inner vbox gets destroyed while a plugin is busy", function(assert) {
			sandbox.stub(this.oStretchPlugin, "isBusy").returns(true);

			this.oVBox2.destroy();
			assert.ok(isStretched(this.oVBoxOverlay1), "the style class was not removed");
		});

		QUnit.test("When element gets modified while a plugin is busy", function(assert) {
			var done = assert.async();
			sandbox.stub(this.oStretchPlugin, "isBusy").returns(true);
			this.oStretchPlugin.removeStretchCandidate(this.oVBoxOverlay1);
			assert.notOk(isStretched(this.oVBoxOverlay1), "the style class removed before element gets modified");
			this.oVBoxOverlay1.fireEvent("elementModified", {type: "afterRendering"});
			setTimeout(function() {
				assert.notOk(isStretched(this.oVBoxOverlay1), "the style class is not placed again");
				done();
			}.bind(this), 50);
		});

		QUnit.test("When _onElementOverlayChanged is called for a destroyed overlay", function(assert) {
			fnTestDestroyedOverlays.call(this, "elementOverlayAdded", assert);
		});

		QUnit.test("When _onElementPropertyChanged is called for a destroyed overlay", function(assert) {
			fnTestDestroyedOverlays.call(this, "elementPropertyChanged", assert);
		});

		QUnit.test("When _onElementOverlayEditableChanged is called for a destroyed overlay", function(assert) {
			fnTestDestroyedOverlays.call(this, "elementOverlayEditableChanged", assert);
		});

		function fnTestDestroyedOverlays(sEventName, assert) {
			var done = assert.async();
			sandbox.stub(this.oStretchPlugin, "_setStyleClassForAllStretchCandidates");

			this.oStretchPlugin.getDesignTime().attachEventOnce(sEventName, function() {
				assert.ok(this.oStretchPlugin._setStyleClassForAllStretchCandidates.notCalled, "then no style class was set for the destroyed overlay");
				done();
			}, this);

			this.oStretchPlugin.getDesignTime().fireEvent(sEventName, {id: "destroyedOverlayId"});
		}
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers (one invisible) of different sizes", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "600px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							this.oVBox2 = new VBox("vbox11", {
								width: "300px",
								items: new Button()
							})
						],
						visible: false
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};
			this.oLayout.setWidth("300px");

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
				done();
			}, this);
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (not all editable)", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button()
							}),
							this.oVBox2 = new VBox("vbox2", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElement().getId() === "hbox" || oOverlay.getElement().getId() === "vbox2") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(isStretched(this.oLayoutOverlay), "the style class was set");
			assert.notOk(isStretched(this.oHBoxOverlay), "the style class was not set");
		});

		QUnit.test("When the editable child changes editable", function(assert) {
			var done = assert.async();
			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				assert.notOk(isStretched(this.oLayoutOverlay), "the style class was removed");
				assert.notOk(isStretched(this.oHBoxOverlay), "the style class is not there");
				assert.notOk(isStretched(this.oVBoxOverlay), "the style class is not there");

				this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
					assert.ok(isStretched(this.oLayoutOverlay), "the style class was added again");
					assert.notOk(isStretched(this.oHBoxOverlay), "the style class is not there");
					assert.notOk(isStretched(this.oVBoxOverlay), "the style class is not there");
					done();
				}, this);
				this.oVBoxOverlay.setEditable(true);
			}, this);
			this.oVBoxOverlay.setEditable(false);
		});

		QUnit.test("When the layout becomes not editable", function(assert) {
			this.oLayoutOverlay.setEditable(false);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was removed");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.ok(isStretched(this.oHBoxOverlay), "the style class was added");
		});

		QUnit.test("When the editable child becomes invisible", function(assert) {
			var done = assert.async();

			this.oVBox.setVisible(false);
			// wait for the dom to update
			var fnDebounced = _debounce(function() {
				assert.notOk(isStretched(this.oHBoxOverlay), "the style class is not there");
				assert.notOk(isStretched(this.oLayoutOverlay), "the style class is not there");
				this.oHBoxOverlay.detachEvent("geometryChanged", fnDebounced);
				done();
			}.bind(this));

			this.oHBoxOverlay.attachEvent("geometryChanged", fnDebounced);
		});

		QUnit.test("When the layout becomes invisible", function(assert) {
			var done = assert.async();
			assert.ok(this.oStretchPlugin.getStretchCandidates().includes("layout"), "the layout is part of the candidates");
			assert.ok(this.oStretchPlugin.getStretchCandidates().includes("hbox"), "the hbox is part of the candidates");

			this.oHBox.setVisible(false);
			// wait for the dom to update
			var fnDebounced = _debounce(function() {
				assert.notOk(this.oStretchPlugin.getStretchCandidates().includes("layout"), "the layout is not part of the candidates anymore");
				this.oLayoutOverlay.detachEvent("geometryChanged", fnDebounced);
				done();
			}.bind(this));

			this.oLayoutOverlay.attachEvent("geometryChanged", fnDebounced);
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with two hboxes (one invisible, one not editable) in a layout", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: new Button()
					}),
					this.oHBox2 = new HBox("hbox2", {
						visible: false,
						items: new Button()
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElement().getId() === "hbox") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
			assert.notOk(isStretched(this.oHBoxOverlay), "the style class was not set");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.ok(isStretched(this.oLayoutOverlay), "the style class was set");
		});

		QUnit.test("When the hbox becomes editable but a plugin is busy", function(assert) {
			sandbox.stub(this.oStretchPlugin, "isBusy").returns(true);

			this.oHBoxOverlay.setEditable(true);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
		});

		QUnit.test("When the invisible hbox becomes visible", async function(assert) {
			var done = assert.async();
			// wait for the dom to update
			var oObserver = new MutationObserver(function(aMutations) {
				aMutations.forEach(function(oMutation) {
					if (oMutation.target === this.oLayout.getDomRef() && oMutation.attributeName === "class") {
						assert.ok(isStretched(this.oLayoutOverlay), "the style class was added");
						oObserver.disconnect();
						done();
					}
				}.bind(this));
			}.bind(this));
			var oConfig = { attributes: true, childList: false, characterData: false, subtree: true};
			oObserver.observe(document.getElementById("qunit-fixture"), oConfig);

			this.oHBox2.setVisible(true);
			await nextUIUpdate();
		});

		QUnit.test("When the invisible hbox becomes visible while the plugin is busy", function(assert) {
			sandbox.stub(this.oStretchPlugin, "isBusy").returns(true);
			this.oHBox2.setVisible(true);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not added");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (editable not stubbed)", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button("button")
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			var oStretchPlugin = new Stretch();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(this.oLayoutOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oHBoxOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oVBoxOverlay.getEditable(), "no overlay is editable");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.notOk(isStretched(this.oLayoutOverlay), "the style class was not set");
			assert.notOk(isStretched(this.oHBoxOverlay), "the style class was not set");
			assert.notOk(isStretched(this.oVBoxOverlay), "the style class was not set");
		});
	});

	QUnit.module("Given a stretch plugin is instantiated without designtime available", {
		beforeEach() {
			this.oStretchPlugin = new Stretch();
		},
		afterEach() {
			this.oStretchPlugin.destroy();
		}
	}, function() {
		QUnit.test("When the plugin is destroyed", function(assert) {
			this.oStretchPlugin.destroy();
			assert.ok(true, "there is no error thrown");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oLayout1 = new VerticalLayout("layout1", {
				width: "300px",
				content: [
					this.oLayout2 = new VerticalLayout("layout2", {
						width: "300px",
						visible: false,
						content: [
							this.oButton = new Button("button1")
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout1.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.clock = sinon.useFakeTimers();
				this.oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout1);
				this.oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout2);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.clock.restore();
			this.oDesignTime.destroy();
			this.oLayout1.destroy();
		}
	}, function() {
		QUnit.test("When during '_onElementPropertyChanged' is called plugin gets destroyed", function(assert) {
			var fnDone = assert.async();
			var iTimeToWait = 1000;

			this.oButton.setText("MyNewText");
			this.oLayout2.setVisible(true);
			sandbox.stub(this.oOuterLayoutOverlay, "getEditable").returns(true);
			sandbox.stub(this.oInnerLayoutOverlay, "getEditable").returns(true);
			this.oStretchPlugin.destroy();
			setTimeout(function() {
				assert.ok(true, "there is no error thrown");
				assert.notOk(isStretched(this.oOuterLayoutOverlay), "then stretch-styleclass should not be set");
				fnDone();
			}.bind(this), iTimeToWait);
			this.clock.tick(iTimeToWait);
		});

		QUnit.test("When during '_onElementPropertyChanged' is called element gets destroyed", function(assert) {
			var fnDone = assert.async();
			var iTimeToWait = 1000;
			sandbox.stub(this.oOuterLayoutOverlay, "getEditable").returns(true);
			sandbox.stub(this.oInnerLayoutOverlay, "getEditable").returns(true);

			this.oButton.setText("MyNewText");
			this.oLayout2.setVisible(true);
			this.oLayout1.destroy();
			setTimeout(function() {
				assert.ok(true, "there is no error thrown");
				fnDone();
			}, iTimeToWait);
			this.clock.tick(iTimeToWait);
		});
	});

	QUnit.module("Given a Form containing Elements and Stretch Plugin", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oFormElement = new FormElement("groupElement1", {
				fields: [new Button({text: "fooooo"})],
				label: "element1"
			});
			this.oFormContainer = new FormContainer("group1", {
				formElements: [this.oFormElement]
			});
			this.oForm = new Form("smartForm", {
				formContainers: [this.oFormContainer],
				layout: new FormLayout()
			});

			this.oForm.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oStretchPlugin = new Stretch();

			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oForm],
				plugins: [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				this.oFormElementOverlay = OverlayRegistry.getOverlay(this.oFormElement);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oForm.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(isStretched(this.oFormContainerOverlay), "the style class was set");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

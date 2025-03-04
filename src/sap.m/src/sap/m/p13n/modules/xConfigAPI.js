/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], (merge, JsControlTreeModifier) => {
	"use strict";

	/**
	 * @namespace
	 * @private
	 * @alias sap.m.p13n.modules.xConfigAPI
	 */
	const xConfigAPI = {};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected metadata property key
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oModificationPayload.propertyBag] Optional propertybag for different modification handler derivations
	 * @param {boolean} [oModificationPayload.markAsModified] Optional flag that triggers a state change event for the engine registration process
	 *
	 * @returns {Promise<object>} Promise resolving to the adapted xConfig object
	 */
	xConfigAPI.enhanceConfig = (oControl, oModificationPayload) => {
		const mPropertyBag = oModificationPayload.propertyBag;
		const oModifier = mPropertyBag ? mPropertyBag.modifier : JsControlTreeModifier;
		let oControlMetadata;
		let oXConfig;

		return oModifier.getControlMetadata(oControl)
			.then((oRetrievedControlMetadata) => {
				oControlMetadata = oRetrievedControlMetadata;
				oModificationPayload.controlMetadata = oControlMetadata;
				return oModifier.getAggregation(oControl, "customData");
			})
			.then((aCustomData) => {

				return Promise.all(aCustomData.map((oCustomData) => {
					return oModifier.getProperty(oCustomData, "key");
				})).then((aCustomDataKeys) => {
					return aCustomData.reduce((oResult, mCustomData, iIndex) => {
						return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
					}, undefined);
				});
			})
			.then((oRetrievedXConfig) => {
				oXConfig = oRetrievedXConfig;
				if (oXConfig) {
					return oModifier.getProperty(oXConfig, "value")
						.then((sConfig) => {
							return merge({}, JSON.parse(sConfig.replace(/\\/g, '')));
						});
				}
				return {};
			})
			.then((oExistingConfig) => {

				let oConfig;
				if (oModificationPayload.controlMeta && oModificationPayload.controlMeta.aggregation) {
					oConfig = xConfigAPI.createAggregationConfig(oControl, oModificationPayload, oExistingConfig);
				} else {
					oConfig = xConfigAPI.createPropertyConfig(oControl, oModificationPayload, oExistingConfig);
				}

				if (oModificationPayload.markAsModified) {
					oConfig.modified = true;
				}

				const oAppComponent = mPropertyBag ? mPropertyBag.appComponent : undefined;

				let pDelete = Promise.resolve();
				if (oXConfig && oControl.isA) {
					pDelete = oModifier.removeAggregation(oControl, "customData", oXConfig)
						.then(() => {
							return oModifier.destroy(oXConfig);
						});
				}

				return pDelete.then(() => {
					return oModifier.createAndAddCustomData(oControl, "xConfig", JSON.stringify(oConfig), oAppComponent)
						.then(() => {
							return merge({}, oConfig);
						});
				});
			});
	};

	/**
	 * Returns a copy of the xConfig object
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} [oModificationPayload] An object providing a modification handler specific payload
	 * @param {object} [oModificationPayload.propertyBag] Optional propertybag for different modification handler derivations
	 *
	 * @returns {Promise<object>|object} A promise resolving to the adapted xConfig object or the object directly
	 */
	xConfigAPI.readConfig = (oControl, oModificationPayload) => {

		if (oModificationPayload) {
			const oModifier = oModificationPayload.propertyBag ? oModificationPayload.propertyBag.modifier : JsControlTreeModifier;
			return oModifier.getAggregation(oControl, "customData")
				.then((aCustomData) => {
					return Promise.all(aCustomData.map((oCustomData) => {
						return oModifier.getProperty(oCustomData, "key");
					})).then((aCustomDataKeys) => {
						return aCustomData.reduce((oResult, mCustomData, iIndex) => {
							return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
						}, undefined);
					});
				})
				.then((oAggregationConfig) => {
					if (oAggregationConfig) {
						return oModifier.getProperty(oAggregationConfig, "value")
							.then((sValue) => {
								return merge({}, JSON.parse(sValue.replace(/\\/g, '')));
							});
					}
					return null;
				});
		}

		// These functions are used instead of the modifier to avoid that the
		// entire call stack is changed to async when it's not needed
		const fnGetAggregationSync = (oParent, sAggregationName) => {
			const fnFindAggregation = (oControl, sAggregationName) => {
				if (oControl) {
					if (oControl.getMetadata) {
						const oMetadata = oControl.getMetadata();
						const oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							return oAggregations[sAggregationName];
						}
					}
				}
				return undefined;
			};

			const oAggregation = fnFindAggregation(oParent, sAggregationName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
			return undefined;
		};

		const fnGetPropertySync = (oControl, sPropertyName) => {
			const oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				const sPropertyGetter = oMetadata._sGetter;
				return oControl[sPropertyGetter]();
			}
			return undefined;
		};

		const oAggregationConfig = fnGetAggregationSync(oControl, "customData").find((oCustomData) => {
			return fnGetPropertySync(oCustomData, "key") == "xConfig";
		});
		const oConfig = oAggregationConfig ? merge({}, JSON.parse(fnGetPropertySync(oAggregationConfig, "value").replace(/\\/g, ''))) : null;
		return oConfig;
	};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected property name
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oExistingConfig] Already existing config to be enhanced by the payload
	 *
	 * @returns {object} The adapted xConfig object
	 */
	xConfigAPI.createAggregationConfig = (oControl, oModificationPayload, oExistingConfig) => {

		const sPropertyInfoKey = oModificationPayload.key || oModificationPayload.name;
		const mControlMeta = oModificationPayload.controlMeta;

		const sAffectedProperty = oModificationPayload.property;

		const vValue = oModificationPayload.value;
		const oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedAggregation = mControlMeta.aggregation;
		const sAggregationName = sAffectedAggregation ? sAffectedAggregation : oControlMetadata.getDefaultAggregation().name;
		const oConfig = oExistingConfig || {};

		if (!oConfig.hasOwnProperty("aggregations")) {
			oConfig.aggregations = {};
		}

		if (!oConfig.aggregations.hasOwnProperty(sAggregationName)) {
			if (oControlMetadata.hasAggregation(sAggregationName)) {
				oConfig.aggregations[sAggregationName] = {};
			} else {
				throw new Error("The aggregation " + sAggregationName + " does not exist for" + oControl);
			}
		}

		if (!oConfig.aggregations[sAggregationName].hasOwnProperty(sPropertyInfoKey)) {
			oConfig.aggregations[sAggregationName][sPropertyInfoKey] = {};
		}

		if (vValue !== null || (vValue && vValue.hasOwnProperty("value") && vValue.value !== null)) {

			const currentState = oModificationPayload.currentState;

			switch (oModificationPayload.operation) {
				case "move":
					Object.entries(oConfig.aggregations[sAggregationName]).forEach((aEntry) => {
						if (
							aEntry[0] !== sPropertyInfoKey &&
							aEntry[1].position !== undefined
						) {
							const newIndex = vValue.index;
							const currentState = oModificationPayload.currentState;
							const currentItemState = currentState?.find((item) => item.key == sPropertyInfoKey);
							const currentItemIndex = currentState?.indexOf(currentItemState);

							//In case of move changes, we also need to ensure that existing xConfig position changes
							//are adapted accordingly to avoid index mismatches

							if (newIndex < aEntry[1].position) {
								aEntry[1].position++;
							}

							if (newIndex > aEntry[1].position && currentItemIndex < aEntry[1].position) {
								aEntry[1].position--;
							}

							if (aEntry[1].position == newIndex) {
								currentItemIndex > aEntry[1].position ? aEntry[1].position++ : aEntry[1].position--;
							}
						}
					});
					oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue.index;
					if (vValue.persistenceIdentifier) {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey]["persistenceIdentifier"] = vValue.persistenceIdentifier;
					}
					break;
				case "remove":
				case "add":
				default:

					//Adjust index after a remove happened for instance
					if (currentState && currentState instanceof Array) {
						currentState.forEach((state, index) => {
							if (oConfig.aggregations[sAggregationName].hasOwnProperty(state.key)) {
								oConfig.aggregations[sAggregationName][state.key]["position"] = index;
							}
						});
					}

					//Note: consider aligning xConfig value handling between sap.m and sap.ui.mdc
					if (vValue.hasOwnProperty("value")) {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue.value;
						oConfig.aggregations[sAggregationName][sPropertyInfoKey]["position"] = vValue.index;
						if (vValue.persistenceIdentifier) {
							oConfig.aggregations[sAggregationName][sPropertyInfoKey]["persistenceIdentifier"] = vValue.persistenceIdentifier;
						}
					} else {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue;
					}
					break;
			}

		} else {
			delete oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty];

			//Delete empty property name object
			if (Object.keys(oConfig.aggregations[sAggregationName][sPropertyInfoKey]).length === 0) {
				delete oConfig.aggregations[sAggregationName][sPropertyInfoKey];

				//Delete empty aggregation name object
				if (Object.keys(oConfig.aggregations[sAggregationName]).length === 0) {
					delete oConfig.aggregations[sAggregationName];
				}
			}
		}

		return oConfig;
	};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected property name
	 * @param {object} oModificationPayload.property Object describing which config is affected
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oExistingConfig] Already existing config to be enhanced by the payload
	 *
	 * @returns {object} The adapted xConfig object
	 */
	xConfigAPI.createPropertyConfig = (oControl, oModificationPayload, oExistingConfig) => {

		//var sDataKey = oModificationPayload.key;

		const vValue = oModificationPayload.value;
		//var oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedProperty = oModificationPayload.property;
		const oConfig = oExistingConfig || {};

		if (!oConfig.properties) {
			oConfig.properties = {};
		}

		if (!oConfig.properties.hasOwnProperty(sAffectedProperty)) {
			oConfig.properties[sAffectedProperty] = [];
		}

		const sOperation = oModificationPayload.operation;

		const oItem = oConfig.properties[sAffectedProperty].find((oEntry) => {
			return oEntry.key === oModificationPayload.key;
		});

		if (oItem && sOperation !== "add") {
			oConfig.properties[sAffectedProperty].splice(oConfig.properties[sAffectedProperty].indexOf(oItem), 1);
		}

		if (sOperation !== "remove") {
			oConfig.properties[sAffectedProperty].splice(oModificationPayload.value.index, 0, vValue);
		}

		return oConfig;
	};

	return xConfigAPI;

});
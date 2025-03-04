/*!
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"sap/base/i18n/Localization",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Element",
	"sap/base/Log"
], function (PluginBase, Localization, KeyCodes, Element, Log) {
	"use strict";

	var DIRECTION = {
		ROW: "row",
		COL: "col"
	};

	/**
	 * Constructor for a new CellSelector plugin.
	 *
	 * @param {string} [sId] ID for the new <code>CellSelector</code>, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new <code>CellSelector</code>
	 *
	 * @class
	 * The <code>CellSelector</code> plugin enables cell selection inside the table when it is added as a dependent to the control.
	 * It allows the user to individually select a cell block.
	 *
	 * The <code>CellSelector</code> plugin currently does not offer touch support.
	 *
	 * The <code>CellSelector</code> plugin cannot be used if the following applies:
	 * <ul>
	 * 	<li>Drag for rows is active</li>
	 * 	<li>The target control is not a {@link sap.ui.table.Table}</li>
	 *	<li>If used in combination with {@link sap.ui.table.Table#cellClick}</li>
	 *	<li>If used in combination with the following selection behavior: <code>sap.ui.table.SelectionBehavior.RowOnly</code> and <code>sap.ui.table.SelectionBehavior.Row</code>
	 * </ul>
	 *
	 * When the <code>CellSelector</code> is used in combination with the {@link sap.ui.mdc.Table}, modifying the following settings on the {@link sap.ui.mdc.Table} may lead to problems:
	 * <ul>
	 * 	<li>attaching a {@link sap.ui.mdc.Table#rowPress rowPress} event to the table after initialization of table and plugin</li>
	 * 	<li>changing {@link sap.ui.mdc.Table#getSelectionMode selectionMode} to something else than <code>Multi</code></li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @author SAP SE
	 *
	 * @public
	 * @experimental Since 1.119. This class is experimental. The API might be changed in the future.
	 * @since 1.119
	 * @alias sap.m.plugins.CellSelector
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	var CellSelector = PluginBase.extend("sap.m.plugins.CellSelector", /** @lends sap.m.plugins.CellSelector.prototype */  {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * For the {@link sap.ui.table.Table} control, defines the number of row contexts that needs to be retrived from the binding
				 * when the range selection (e.g. enhancing the cell selection block to cover all rows of a column) is triggered by the user.
				 * This helps to make the contexts already available for the user actions after the cell selection (e.g. copy to clipboard).
				 * This property accepts positive integer values.
				 * <b>Note:</b> To avoid performance problems, the <code>rangeLimit</code> should only be set higher than the default value of 200 in the following cases:
				 * <ul>
				 *     <li>With client-side models</li>
				 *     <li>With server-side models if they are used in client mode</li>
				 *     <li>If the entity set is small</li>
				 * </ul>
				 * In other cases, it is recommended to set the <code>rangeLimit</code> to at least double the value of the {@link sap.ui.table.Table#getThreshold threshold} property.
				 */
				rangeLimit: {type: "int", group: "Behavior", defaultValue: 200},
				/**
				 * Indicates whether this plugin is active or not.
				 */
				enabled: {type: "boolean", defaultValue: true}
			},
			events: {}
		}
	});

	CellSelector.findOn = PluginBase.findOn;

	/**
	 * A selection object representing the selected cells.
	 *
	 * The selection object contains the selected cells separated into rows and columns.
	 * Rows are represented by their context, while columns are the column instance, which may vary depending on the table type.
	 * @public
	 * @typedef {object} sap.m.plugins.CellSelector.Selection
	 * @property {sap.ui.model.Context[]} rows The row contexts of the selected cells.
	 * @property {sap.ui.core.Element[]} columns The column instances of the selected cells; the content is based on the owner control.
	 */

	/**
	 * Event Delegate that containts events, that need to be executed after control events.
	 */
	const EventDelegate = {
		onkeydown: function(oEvent) {
			if (!this._bSelecting) {
				return;
			}

			if (isKeyCombination(oEvent, KeyCodes.A, true, true)
				|| (isKeyCombination(oEvent, KeyCodes.A, false, true) && oEvent.isMarked(this.getConfig("eventClearedAll")))) {
				if (isCell(oEvent.target, this.getConfig("tableCell"))) {
					this.removeSelection();
					oEvent.preventDefault();
				}
			}
		}
	};

	/**
	 * Delegate containing events, that need to be processed before control events.
	 */
	const PriorityDelegate = {
		onBeforeRendering: function() {
			this._iRtl = Localization.getRTL() ? -1 : 1;
			if (this._oResizer) {
				// remove resizer, as due to rerendering table element may be gone
				this._oResizer.remove();
				this._oResizer = null;
			}
			if (this._bSelecting) {
				this.removeSelection();
			}
		},
		onAfterRendering: function() {
			this._deregisterEvents();
			this._registerEvents();
		},
		onsapspace: function (oEvent) {
			if (!this._isSelectableCell(oEvent.target)) {
				return;
			}
			this._startSelection(oEvent, false);
		},
		onsapupmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.ROW, -1, 0);
		},
		onsapdownmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.ROW, 1, 0);
		},
		onsapleftmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.COL, 0, -1);
		},
		onsaprightmodifiers: function(oEvent) {
			this._onsaparrowmodifiers(oEvent, DIRECTION.COL, 0, 1);
		},
		onsapescape: function(oEvent) {
			if (oEvent.isMarked()) {
				return;
			}

			if (this._bSelecting && isCell(oEvent.target, this.getConfig("tableCell"))) {
				this.removeSelection();
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		},
		onkeyup: function(oEvent) {
			if (oEvent.isMarked()) {
				return;
			}

			var mBounds = this._bSelecting ? this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget) : undefined;
			if (isKeyCombination(oEvent, KeyCodes.SPACE, true, false)) {
				if (this._inSelection(oEvent.target)) {
					var oInfo = this.getConfig("getCellInfo", this.getControl(), oEvent.target);
					this.getConfig("selectRows", this.getControl(), mBounds.from.rowIndex, mBounds.to.rowIndex, oInfo.rowIndex);
					oEvent.setMarked();
				}

				oEvent.preventDefault();
			} else if (this._bSelecting && isKeyCombination(oEvent, KeyCodes.SPACE, false, true)) {
				if (!this._inSelection(oEvent.target)) {
					// If focus is on cell outside of selection, select focused column
					var oInfo = this.getConfig("getCellInfo", this.getControl(), oEvent.target);
					mBounds.from.colIndex = mBounds.to.colIndex = oInfo.colIndex;
				}
				mBounds.from.rowIndex = 0;
				mBounds.to.rowIndex = Infinity;
				this._selectCells(mBounds.from, mBounds.to);

				oEvent.preventDefault();
			}
		},
		onmousedown: function(oEvent) {
			if (oEvent.isMarked?.() || oEvent.button != 0) {
				return;
			}

			if (oEvent.ctrlKey || oEvent.metaKey) {
				this._startSelection(oEvent);
			}

			var oSelectableCell = this._getSelectableCell(oEvent.target);
			if (oSelectableCell) {
				this._bMouseDown = true;
				this._mClickedCell = this._oPreviousCell = this.getConfig("getCellInfo", this.getControl(), oSelectableCell);
			}
		},
		onmouseup: function(oEvent) {
			this._bMouseDown = false;
			this._bBorderDown = false;
			this._mClickedCell = undefined;
			this._bScrolling = false;
			this._oPreviousCell = undefined;
			this._clearScroller();
		}
	};

	CellSelector.prototype.onActivate = function (oControl) {
		oControl.addDelegate(PriorityDelegate, true, this);
		oControl.addDelegate(EventDelegate, false, this);

		this._oSession = { cellRefs: [] };
		this._mTimeouts = {};
		this._fnControlUpdate = function(oEvent) {
			if (this._bScrolling) {
				this._scrollSelect(this._oSession.scrollForward, this._oSession.isVertical, oEvent);
			} else {
				if (!this._oSession.mSource || !this._oSession.mTarget) {
					return;
				}
				const mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
				this._drawSelection(mBounds);
			}
		}.bind(this);
		this._fnOnMouseEnter = this._onmouseenter.bind(this);
		this._fnOnMouseOut = this._onmouseout.bind(this);
		this._fnOnMouseMove = this._onmousemove.bind(this);
		this._fnOnMouseUp = PriorityDelegate.onmouseup.bind(this);
		this._fnRemoveSelection = this.removeSelection.bind(this);

		// Register Events, as adding dependent does not trigger rerendering
		this._registerEvents();
		this._onSelectableChange();
	};

	CellSelector.prototype.onDeactivate = function (oControl) {
		oControl.removeDelegate(PriorityDelegate, this);
		oControl.removeDelegate(EventDelegate, this);

		if (this._oSession) {
			this.removeSelection();
			this._oSession = null;
			this._mTimeouts = null;
		}

		this._deregisterEvents();
		this._onSelectableChange();
	};

	CellSelector.prototype.exit = function() {
		if (this.getControl()  && !this.getControl().isDestroyed() && this._oSession) {
			this.removeSelection();
		}
		this._deregisterEvents();
		this._oSession = null;
		this._mTimeouts = null;

		PluginBase.prototype.exit.call(this);
	};

	/**
	 * Determines whether cells are selectable or not.
	 *
	 * @private
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	CellSelector.prototype.isSelectable = function() {
		return this.isActive() ? this.getConfig("isSupported", this.getControl()) : false;
	};

	CellSelector.prototype._onSelectableChange = function() {
		const oCopyProvider = this.getPlugin("sap.m.plugins.CopyProvider");
		oCopyProvider?.onCellSelectorSelectableChange(this.isSelectable());
	};

	CellSelector.prototype._registerEvents = function() {
		var oControl = this.getControl();
		if (oControl) {
			oControl.attachEvent(this.getConfig("scrollEvent"), this._fnControlUpdate);
			this.getConfig("attachSelectionChange", oControl, this._fnRemoveSelection);
			var oScrollArea = oControl.getDomRef(this.getConfig("scrollArea"));
			if (oScrollArea) {
				oScrollArea.addEventListener("mouseleave", this._fnOnMouseOut);
				oScrollArea.addEventListener("mouseenter", this._fnOnMouseEnter);
			}
		}
		document.addEventListener("mousemove", this._fnOnMouseMove);
		document.addEventListener("mouseup", this._fnOnMouseUp);
	};

	CellSelector.prototype._deregisterEvents = function() {
		var oControl = this.getControl();
		if (oControl) {
			oControl.detachEvent(this.getConfig("scrollEvent"), this._fnControlUpdate);
			this.getConfig("detachSelectionChange", oControl, this._fnRemoveSelection);
			var oScrollArea = oControl.getDomRef(this.getConfig("scrollArea"));
			if (oScrollArea) {
				oScrollArea.removeEventListener("mouseleave", this._fnOnMouseOut);
				oScrollArea.removeEventListener("mouseenter", this._fnOnMouseEnter);
			}
		}
		document.removeEventListener("mousemove", this._fnOnMouseMove);
		document.removeEventListener("mouseup", this._fnOnMouseUp);
	};

	/**
	 * Returns the cell selection range.
	 * The value <code>Infinity</code> in <code>rowIndex</code> indicates that the limit is reached.
	 *
	 * <b>Note</b>: This method is subject to change.
	 * @param {boolean} bIgnore Ignore group header rows within selection range
	 * @returns {{from: {rowIndex: int, colIndex: int}, to: {rowIndex: int, colIndex: int}}  The range of the selection
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 * @private
	 */
	CellSelector.prototype.getSelectionRange = function (bIgnore) {
		if (!this._bSelecting) {
			return null;
		}

		var mSelectionRange = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget, true);
		if (isNaN(mSelectionRange.from.rowIndex) || isNaN(mSelectionRange.to.rowIndex)) {
			return null;
		}

		var iMaxColumnIndex = this.getConfig("getVisibleColumns", this.getControl()).length - 1;
		mSelectionRange.from.colIndex = Math.max(mSelectionRange.from.colIndex, 0);
		mSelectionRange.to.colIndex = Math.min(mSelectionRange.to.colIndex, iMaxColumnIndex);
		mSelectionRange.from.rowIndex = Math.max(mSelectionRange.from.rowIndex, 0);

		if (bIgnore) {
			mSelectionRange.ignoredRows = [];
			const aContexts = this.getSelectedRowContexts();
			aContexts.forEach((oContext, iIndex) => {
				const iRowIndex = mSelectionRange.from.rowIndex + iIndex;
				if (isGroupRow(this._getBinding(), oContext, iRowIndex)) {
					mSelectionRange.ignoredRows.push(iRowIndex);
				}
			});
		}

		return mSelectionRange;
	};

	/**
	 * Returns the row binding context of the current selection.
	 *
	 * Note: This method is subject to change.
	 * @returns {sap.ui.model.Context[]} The binding context of selected rows
	 * @private
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	CellSelector.prototype.getSelectedRowContexts = function () {
		var mSelectionRange = this.getSelectionRange();
		if (!mSelectionRange) {
			return [];
		}

		return this.getConfig("getSelectedRowContexts", this.getControl(), mSelectionRange.from.rowIndex, mSelectionRange.to.rowIndex, this.getRangeLimit());
	};

	/**
	 * Returns the selected cells separated into the selected rows and columns.
	 *
	 * Example:
	 * If the cells from (0, 0) to (2, 4) are selected, this method will return the following object:
	 * <pre>
	 * 	{
	 * 		rows: [Row0_Context, Row1_Context, Row2_Context],
	 * 		columns: [Column0, Column1, Column2, Column3, Column4]
	 * 	}
	 * </pre>
	 *
	 * <b>Note:</b> The content of the <code>rows</code> and <code>columns</code> depends on the owner control.
	 * The type of the column that is returned depends on the table type for which the plugin is used (for example, <code>sap.ui.table.Column</code> for <code>sap.ui.table.Table</code>).
	 *
	 * @param {boolean} bIgnore Ignores group headers from selection
	 * @returns {sap.m.plugins.CellSelector.Selection} An object containing the selected cells separated into rows and columns
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template
	 */
	CellSelector.prototype.getSelection = function(bIgnore) {
		var mSelectionRange = this.getSelectionRange();
		if (!mSelectionRange) {
			return {rows: [], columns: []};
		}

		var aSelection = this.getConfig("getSelectedRowContexts", this.getControl(), mSelectionRange.from.rowIndex, mSelectionRange.to.rowIndex, this.getRangeLimit());
		if (bIgnore) {
			aSelection = aSelection.filter((oContext, iIndex) => !isGroupRow(this._getBinding(), oContext, iIndex + mSelectionRange.from.rowIndex));
		}

		var aSelectedColumns = this.getConfig("getVisibleColumns", this.getControl()).slice(mSelectionRange.from.colIndex, mSelectionRange.to.colIndex + 1);
		if (this.getControl().getParent().isA("sap.ui.mdc.Table")) {
			aSelectedColumns = aSelectedColumns.map(function(oSelectedColumn) {
				return Element.getElementById(oSelectedColumn.getId().replace(/\-innerColumn$/, ""));
			});
		}

		return {
			rows: aSelection,
			columns: aSelectedColumns
		};
	};

	CellSelector.prototype._onsaparrowmodifiers = function(oEvent, sDirectionType, iRowDiff, iColDiff) {
		if (!this._shouldBeHandled(oEvent) || !oEvent.shiftKey || !this._isSelectableCell(oEvent.target)) {
			return;
		}

		var oSelectableCell = this._getSelectableCell(oEvent.target);
		if (!oSelectableCell) {
			return;
		}

		var oInfo = this.getConfig("getCellInfo", this.getControl(), oSelectableCell);
		if (!this._inSelection(oEvent.target) || !this._oSession.mSource || !this._oSession.mTarget) {
			if (this.getConfig("isRowSelected", this.getControl(), oInfo.rowIndex)) {
				return;
			}
			// If not in selection block, start new selection block
			this._oSession.mSource = this._oSession.mTarget = oInfo;
		}

		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		const { from, to, focus } = this._getUpdatedBounds(iRowDiff, iColDiff * this._iRtl, oInfo);

		if (focus[sDirectionType + "Index"] < 0 || focus.colIndex >= this.getConfig("getVisibleColumns", this.getControl()).length) {
			return;
		}

		this.getConfig("focusCell", this.getControl(), focus, iRowDiff > 0);
		if (sDirectionType == DIRECTION.ROW && (oInfo.rowIndex == mBounds.from.rowIndex || oInfo.rowIndex == mBounds.to.rowIndex)
			|| sDirectionType == DIRECTION.COL && (oInfo.colIndex == mBounds.from.colIndex || oInfo.colIndex == mBounds.to.colIndex)) {
			this._bSelecting = true;
			this._selectCells(from, to);
		}

		oEvent.setMarked();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Event handler for mouse movement. Handles mouse movement during cell selection. Takes on tasks like:
	 * - updating resizer positions
	 * - mouse selection via cell click and move
	 * - selection enhancement via border and edge
	 * @param {sap.ui.base.Event} oEvent event
	 */
	CellSelector.prototype._onmousemove = function(oEvent) {
		// Only update the resizer, if we are selecting and the border is not pressed. During border/edge pressing, don't update it
		if (this._bSelecting && !this._bMouseDown) {
			var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
			this._updateResizers(mBounds, oEvent.clientX, oEvent.clientY);
		}

		var oSelectableCell = this._getSelectableCell(oEvent.target);
		if (!oSelectableCell || !this._bMouseDown) {
			return;
		}

		// If clicked cell (=starting cell) is equal to currently hovered cell, don't do anything
		var oInfo = this.getConfig("getCellInfo", this.getControl(), oSelectableCell);
		if (oInfo.rowIndex == this._oPreviousCell?.rowIndex && oInfo.colIndex == this._oPreviousCell?.colIndex) {
			// If currently hovered cell is the same as previous cell, nothing needs to be done.
			return;
		}
		this._oPreviousCell = oInfo;

		// Remove text selection during mouse cell selection
		window.getSelection().removeAllRanges();

		if (this._bBorderDown && !this._bScrolling) {
			var oBorder = this._oSession.border;
			var mDiff = {
				colIndex: isNaN(oBorder.colIndex) ? 0 : oInfo.colIndex - oBorder.colIndex,
				rowIndex: isNaN(oBorder.rowIndex) ? 0 : oInfo.rowIndex - oBorder.rowIndex
			};

			if (mDiff.rowIndex != 0 || mDiff.colIndex != 0) {
				const { from, to } = this._getUpdatedBounds(mDiff.rowIndex, mDiff.colIndex, oBorder);
				this._selectCells(from, to);
			}
		} else {
			this._startSelection(oEvent, true);
		}
	};

	/** Event Handler for Mouse Selection (leaving table, etc.) */
	CellSelector.prototype._onmouseout = function(oEvent) {
		var oScrollAreaRef = this.getControl().getDomRef(this.getConfig("scrollArea"));

		if (!oScrollAreaRef || !this._bMouseDown) { return; }

		var oScrollAreaRect = oScrollAreaRef.getBoundingClientRect();

		var bForward, bVertical;
		this._bScrolling = false;
		if (oEvent.clientY > oScrollAreaRect.bottom || oEvent.clientY < oScrollAreaRect.top) {
			this._oSession.scrollForward = bForward = oEvent.clientY > oScrollAreaRect.bottom;
			this._oSession.isVertical = bVertical = true;
			this._bScrolling = true;
		}

		if (oEvent.clientX > oScrollAreaRect.right || oEvent.clientX < oScrollAreaRect.left) {
			this._oSession.scrollForward = bForward = oEvent.clientX > oScrollAreaRect.right;
			this._oSession.isVertical = bVertical = false;
			this._bScrolling = true;
		}

		if (this._bScrolling) {
			this._doScroll(bForward, bVertical, oEvent);
		}
	};

	CellSelector.prototype._onmouseenter = function(oEvent) {
		this._bScrolling = false;
		this._clearScroller();
	};

	CellSelector.prototype._doScroll = function(bForward, bVertical, oEvent) {
		this._clearScroller();
		if (this._bScrolling) {
			this.getConfig("scroll", this.getControl(), bForward, bVertical);
			this._mTimeouts.scrollTimerId = setTimeout(this._doScroll.bind(this, bForward, bVertical), 500);

			// If vertical scrolling, wait for the event, then select the next cells, not possible currently with horizontal scrolling
			if (!bVertical) {
				this._scrollSelect(bForward, bVertical, oEvent);
			}
		}
	};

	CellSelector.prototype._scrollSelect = function(bForward, bVertical, oEvent) {
		if (!this._bSelecting) {
			return;
		}
		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		if (this._bScrolling) {
			var sDirectionType = bVertical ? DIRECTION.ROW : DIRECTION.COL;
			var mDiff = { "row": 0, "col": 0 };
			var sType = bForward ? "to" : "from";

			mDiff[sDirectionType] = bForward ? 1 : -1;
			let mOldFocus = mBounds[sType];
			if (this._bBorderDown) {
				mOldFocus = this._oSession.border;
			}
			const { from, to } = this._getUpdatedBounds(mDiff[DIRECTION.ROW], mDiff[DIRECTION.COL], mOldFocus);
			this._selectCells(from, to);
		}
	};

	CellSelector.prototype._clearScroller = function() {
		if (this._mTimeouts.scrollTimerId) {
			window.clearTimeout(this._mTimeouts.scrollTimerId);
			this._mTimeouts.scrollTimerId = null;
		}
	};

	CellSelector.prototype._onborderdown = function(oEvent) {
		this._oSession.border = Object.assign({}, this._oCurrentBorder);
		this._bBorderDown = true;
		this._bMouseDown = true;
		// TODO: when borderdown, make "border" active
	};

	/**
	 * Checks if the given DOM reference is a selectable cell.
	 * @param {HTMLELement} oDomRef
	 * @returns {HTMLELement|null}
	 */
	 CellSelector.prototype._getSelectableCell = function (oDomRef) {
		return oDomRef?.closest(`.${this.getConfig("selectableCells")}`);
	};

	CellSelector.prototype._isSelectableCell = function(oDomRef) {
		return oDomRef?.classList.contains(this.getConfig("selectableCells"));
	};

	CellSelector.prototype._inSelection = function(oTarget) {
		var oInfo = this.getConfig("getCellInfo", this.getControl(), oTarget);
		if (!oInfo || !this._oSession.mSource || !this._oSession.mTarget) {
			return false;
		}

		var oBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);

		return !(oInfo.rowIndex < oBounds.from.rowIndex || oInfo.rowIndex > oBounds.to.rowIndex
			|| oInfo.colIndex < oBounds.from.colIndex || oInfo.colIndex > oBounds.to.colIndex);
	};

	CellSelector.prototype._startSelection = function(oEvent, bMove) {
		if (!this._shouldBeHandled(oEvent)) {
			return;
		}

		var oTarget = this._getSelectableCell(oEvent.target);
		if (!oTarget) {
			return;
		}

		if (this._inSelection(oTarget) && !bMove) {
			this.removeSelection();
		} else {
			var oCellInfo = this.getConfig("getCellInfo", this.getControl(), oTarget);
			var mStart = this._mClickedCell ? this._mClickedCell : oCellInfo;

			this._bSelecting = true;
			this._oSession.mSource = oCellInfo;
			this._selectCells(mStart, oCellInfo);
			this.getConfig("focusCell", this.getControl(), oCellInfo);
		}

		oEvent.preventDefault();
		oEvent.setMarked && oEvent.setMarked();
	};

	/**
	 * Selects the next cells in a specific direction (ROW, COL).
	 * @private
	 */
	CellSelector.prototype._getUpdatedBounds = function(iRowDiff, iColDiff, mOldFocus) {
		var mBounds = this._getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
		var mFocus = Object.assign({}, mOldFocus);

		// Determine which "side" to adjust according to current position
		var sAdjustRowType = mFocus.rowIndex == mBounds.from.rowIndex ? "from" : "to";
		var sAdjustColType = mFocus.colIndex == mBounds.from.colIndex ? "from" : "to";

		mBounds[sAdjustRowType].rowIndex += iRowDiff;
		mBounds[sAdjustColType].colIndex += iColDiff;

		if (!this._bBorderDown) {
			mFocus.rowIndex = Math.max(0, mFocus.rowIndex + iRowDiff);
			mFocus.colIndex = Math.max(0, mFocus.colIndex + iColDiff);
		} else {
			this._oSession.border.rowIndex += iRowDiff;
			this._oSession.border.colIndex += iColDiff;
		}

		return {
			from: mBounds.from,
			to: mBounds.to,
			focus: mFocus
		};
	};

	/**
	 * Selects the cell from the source cell to the provided target cell's coordinates.
	 *
	 * The algorithm builds up a bounding box, goes through all the cells inside it and determines their selection state.
	 * The bounding box can either be ranging from
	 * a) source cell to target cell or
	 * b) source cell to current lower right cell.
	 * The bigger bounding box of the two will be inspected.
	 * @param {Object} mFrom source cell coordinates
	 * @param {int} mFrom.rowIndex row index
	 * @param {int} mFrom.colIndex column index
	 * @param {Object} mTo target cell coordinates
	 * @param {int} mTo.rowIndex row index
	 * @param {int} mTo.colIndex column index
	 * @private
	 */
	CellSelector.prototype._selectCells = function (mFrom, mTo) {
		if (!this._bSelecting) {
			return;
		}

		mFrom = mFrom ? mFrom : this._oSession.mSource;
		mTo = mTo ? mTo : this._oSession.mTarget;
		var mBounds = this._getNormalizedBounds(mFrom, mTo);

		if (mTo.rowIndex == Infinity || mFrom.rowIndex == Infinity) {
			this.getConfig("loadContexts", this.getControl(), mBounds.from.rowIndex, this.getRangeLimit());
		}

		this._drawSelection(mBounds);

		this._oSession.mSource = mFrom;
		this._oSession.mTarget = mTo;
	};

	/**
	 * Draws the selection for the given bounds.
	 * @param {Object} mBounds object containing the bounds information (from, to)
	 * @param {Object} mBounds.from from position
	 * @param {Object} mBounds.to to position
	 * @private
	 */
	CellSelector.prototype._drawSelection = function (mBounds) {
		if (!mBounds.from || !mBounds.to) {
			return;
		}

		this._clearSelection();

		this._oSession.cellRefs = [];
		for (var iRow = mBounds.from.rowIndex; iRow <= mBounds.to.rowIndex; iRow++) {
			for (var iCol = mBounds.from.colIndex; iCol <= mBounds.to.colIndex; iCol++) {
				var oCellRef = this.getConfig("getCellRef", this.getControl(), {rowIndex: iRow, colIndex: iCol});
				if (oCellRef) {
					oCellRef.classList.toggle("sapMPluginsCellSelectorTop", iRow == mBounds.from.rowIndex);
					oCellRef.classList.toggle("sapMPluginsCellSelectorBottom", iRow == mBounds.to.rowIndex);
					oCellRef.classList.toggle("sapMPluginsCellSelectorRight", iCol == mBounds.to.colIndex);
					oCellRef.classList.toggle("sapMPluginsCellSelectorSelected", true);
					oCellRef.setAttribute("aria-selected", "true");
					this._oSession.cellRefs.push(oCellRef);

					// Grid Table has only border-right, so adding border-left would change the size of the column. Instead, for the left border, take the previous cell and set border-right.
					if (iCol == mBounds.from.colIndex) {
						const oPrevCellRef = this.getConfig("getCellRef", this.getControl(), {rowIndex: iRow, colIndex: iCol - 1});
						let sClass = "sapMPluginsCellSelectorLeft";
						if (oPrevCellRef) {
							oCellRef = oPrevCellRef;
							sClass = "sapMPluginsCellSelectorRight";
							this._oSession.cellRefs.push(oCellRef);
						}
						oCellRef.classList.toggle(sClass, iCol == mBounds.from.colIndex);
					}
				}
			}
		}
	};

	CellSelector.prototype._updateResizers = function(mBounds, iPositionX, iPositionY) {
		var oResizer = this._getResizer();

		if (this._iRtl == -1) {
			const iFromColIndex = mBounds.from.colIndex;
			mBounds.from.colIndex = mBounds.to.colIndex;
			mBounds.to.colIndex = iFromColIndex;
		}

		var oFromRef = this.getConfig("getCellRef", this.getControl(), mBounds.from, false),
			oToRef = this.getConfig("getCellRef", this.getControl(), mBounds.to, false);
		var mOutOfBounds = { 0: false, 1: false }; // 0: top, 1: bottom

		if (!oFromRef) {
			mOutOfBounds[0] = true;
			oFromRef = this.getConfig("getCellRef", this.getControl(), mBounds.from, true);
		}

		if (!oToRef) {
			mOutOfBounds[1] = true;
			oToRef = this.getConfig("getCellRef", this.getControl(), mBounds.to, true);
		}

		if (!oFromRef || !oToRef) {
			return;
		}

		var oFromRect = oFromRef.getBoundingClientRect(),
			oToRect = oToRef.getBoundingClientRect(),
			oTableRect = this.getControl().getDomRef().getBoundingClientRect();

		var mStyleMap = {
			x: { 0: oFromRect.left - oTableRect.left, 1: oToRect.left + oToRect.width - oTableRect.left },
			y: { 0: oFromRect.top - oTableRect.top, 1: oToRect.top + oToRect.height - oTableRect.top }
		};
		var mDiffMap = {
			x: { 0: iPositionX - oFromRect.left, 1: iPositionX - oToRect.right },
			y: { 0: iPositionY - oFromRect.top, 1: iPositionY - oToRect.bottom }
		};

		// 2 Bit Flags:
		// Y Direction | X Direction
		// 0           | 0
		var mFlags = 0;
		mFlags |= Math.abs(mDiffMap.x[0]) < Math.abs(mDiffMap.x[1]) ? 0 : 1;
		mFlags |= Math.abs(mDiffMap.y[0]) < Math.abs(mDiffMap.y[1]) ? 0 : 2;

		var iDiffX = Math.abs(mDiffMap.x[mFlags & 1]), iDiffY = Math.abs(mDiffMap.y[(mFlags >> 1) & 1]);
		if (iDiffX > 10 && iDiffY > 10 || iDiffX > 10 && mOutOfBounds[(mFlags >> 1) & 1]) {
			return;
		}

		oResizer.style.left = iDiffX <= 10 ? mStyleMap.x[mFlags & 1] + "px" : mStyleMap.x[0] + "px";
		oResizer.style.top = iDiffY <= 10 ? mStyleMap.y[(mFlags >> 1) & 1] + "px" : mStyleMap.y[0] + "px";
		oResizer.style.width = iDiffX <= 10 ? "" : oToRect.right - oFromRect.left + "px";
		oResizer.style.height = iDiffX <= 10 ? oToRect.bottom - oFromRect.top + "px" : "";

		const bXinRange = iDiffX <= 10, bYinRange = iDiffY <= 10;
		oResizer.classList.toggle("sapMPluginsVerticalBorder", bXinRange);
		oResizer.classList.toggle("sapMPluginsHorizontalBorder", bYinRange);
		oResizer.classList.toggle("sapMPluginsEdge", bXinRange && bYinRange);
		oResizer.classList.toggle("sapMPluginsNESW", bXinRange && bYinRange && (mFlags == 2 || mFlags == 1));
		oResizer.classList.toggle("sapMPluginsNWSE", bXinRange && bYinRange && (mFlags == 3 || mFlags == 0));

		this._oCurrentBorder = {};
		if (bXinRange) {
			this._oCurrentBorder.colIndex = mFlags & 1 ? mBounds.to.colIndex : mBounds.from.colIndex;
			this._oCurrentBorder.type = DIRECTION.COL;
		}

		if (bYinRange) {
			this._oCurrentBorder.rowIndex = (mFlags >> 1) & 1 ? mBounds.to.rowIndex : mBounds.from.rowIndex;
			this._oCurrentBorder.type = DIRECTION.ROW;
		}
	};

	CellSelector.prototype._getResizer = function() {
		if (!this._oResizer) {
			this._oResizer = document.createElement("div");
			this._oResizer.setAttribute("id", "cs-rsz");
			this._oResizer.classList.add("sapMPluginsCellSelectorRsz");

			this._oResizer.addEventListener("mousedown", this._onborderdown.bind(this));

			if (this.getControl().getDomRef()) {
				this.getControl().getDomRef().appendChild(this._oResizer);
			}
		}
		return this._oResizer;
	};

	CellSelector.prototype._clearSelection = function() {
		this._oSession?.cellRefs?.forEach(function(oCellRef) {
			oCellRef.classList.remove("sapMPluginsCellSelectorSelected", "sapMPluginsCellSelectorTop", "sapMPluginsCellSelectorBottom", "sapMPluginsCellSelectorLeft", "sapMPluginsCellSelectorRight");
			oCellRef.removeAttribute("aria-selected");
		});
		var oResizer = this._getResizer();
		oResizer.style.left = "-10000px";
		oResizer.style.top = "-10000px";
	};

	/**
	 * Remove the current selection block.
	 */
	CellSelector.prototype.removeSelection = function () {
		this._clearSelection();

		this._bSelecting = false;
		this._oSession = { cellRefs: [] };
	};

	/**
	 * Returns an object containing normalized coordinates for the given bounding area.
	 * <code>from</code> will contain the coordinates for the upper left corner of the bounding area,
	 * while <code>to</code> contains the coordinates of the lower right corner of the bounding area.
	 * @param {Object} mFrom
	 * @param {int} mFrom.rowIndex row index
	 * @param {int} mFrom.colIndex column index
	 * @param {Object} mTo
	 * @param {int} mTo.rowIndex row index
	 * @param {int} mTo.colIndex column index
	 * @returns object containing coordinates for from and to
	 */
	CellSelector.prototype._getNormalizedBounds = function(mFrom, mTo, bKeepBounds) {
		const iMaxColumns = this.getConfig("getVisibleColumns", this.getControl()).length;
		const iMaxRows = this.getRangeLimit() == 0 ? this.getConfig("getRowCount", this.getControl()) : this.getRangeLimit();

		let toRowIndex = Math.max(mFrom.rowIndex, mTo.rowIndex), toColIndex = Math.max(mFrom.colIndex, mTo.colIndex);
		if (!bKeepBounds) {
			toRowIndex = Math.min(iMaxRows - 1, toRowIndex);
			toColIndex = Math.min(iMaxColumns, toColIndex);
		}

		return {
			from: {rowIndex: Math.max(0, Math.min(mFrom.rowIndex, mTo.rowIndex)), colIndex: Math.max(0, Math.min(mFrom.colIndex, mTo.colIndex))},
			to: {rowIndex: toRowIndex, colIndex: toColIndex}
		};
	};

	CellSelector.prototype._shouldBeHandled = function(oEvent) {
		// Handle if event is not marked and control is applicable
		return !oEvent.isMarked?.() && this.getConfig("isSupported", this.getControl());
	};

	CellSelector.prototype._getBinding = function() {
		return this.getConfig("getBinding", this.getControl());
	};

	function isCell(oTarget, sCell) {
		return oTarget.classList.contains(sCell);
	}

	function isGroupRow(oBinding, oContext, iIndex) {
		const oRowContext = oBinding?.getNodeByIndex?.(iIndex) ?? oContext;
		if (oBinding?.nodeHasChildren) {
			return oBinding.nodeHasChildren(oRowContext);
		}
		return !(oRowContext.getProperty("@ui5.node.isExpanded") === undefined);
	}

	/**
	 * Check if the given key combination applies to the event.
	 * @param {sap.ui.base.Event} oEvent event instance
	 * @param {string} sKeyCode key code
	 * @param {boolean} bShift shift key pressed
	 * @param {boolean} bCtrl control key pressed
	 * @returns is combination or not
	 */
	function isKeyCombination(oEvent, sKeyCode, bShift, bCtrl) {
		return oEvent.keyCode == sKeyCode && oEvent.shiftKey == bShift && (oEvent.ctrlKey == bCtrl || oEvent.metaKey == bCtrl);
	}

	PluginBase.setConfigs({
		"sap.ui.table.Table": {
			tableCell: "sapUiTableCell",
			selectableCells: "sapUiTableDataCell",
			scrollArea: "sapUiTableCtrlScr",
			scrollEvent: "_rowsUpdated",
			eventClearedAll: "sapUiTableClearAll",
			onActivate: function(oTable, oPlugin) {
				oTable.attachEvent("_change", oPlugin, this._onPropertyChange);
				oTable.attachEvent("EventHandlerChange", oPlugin, this._onEventHandlerChange);
			},
			onDeactivate: function(oTable, oPlugin) {
				oTable.detachEvent("_change", this._onPropertyChange);
				oTable.detachEvent("EventHandlerChange", this._onEventHandlerChange);
			},
			_onPropertyChange: function(oEvent, oPlugin) {
				oEvent.getParameter("name") == "selectionBehavior" && oPlugin._onSelectableChange();
			},
			_onEventHandlerChange: function(oEvent, oPlugin) {
				oEvent.getParameter("EventId") == "cellClick" && oPlugin._onSelectableChange();
			},
			/**
			 * Checks if the table is compatible with cell selection.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @returns {boolean} compatibility with cell selection
			 */
			isSupported: function(oTable) {
				return !oTable.hasListeners("cellClick") && oTable.getSelectionBehavior() == "RowSelector"
					&& !oTable.getDragDropConfig().some((oConfig) => oConfig.getSourceAggregation?.() == "rows" && oConfig.getEnabled());
			},
			/**
			 * Get visible columns of the table.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @returns {sap.ui.table.Column[]} array of visible columns
			 */
			getVisibleColumns: function (oTable) {
				return oTable.getColumns().filter(function (oColumn) {
					return oColumn.getDomRef();
				});
			},
			getRowCount: function(oTable) {
				return oTable._getTotalRowCount();
			},
			/**
			 * Retrieve the cell reference for a given position
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {Object} mPosition position
			 * @param {int} mPosition.rowIndex row index
			 * @param {int} mPosition.colIndex column index
			 * @returns {HTMLElement} cell's DOM element
			 */
			getCellRef: function (oTable, mPosition, bRange) {
				var aRows = oTable.getRows();
				var oRow = aRows.find(function(oRow) {
					return oRow.getIndex() == mPosition.rowIndex;
				});
				if (oRow) {
					var oColumn = this.getVisibleColumns(oTable)[mPosition.colIndex];
					var oCell = oColumn && oRow.getCells()[oColumn.getIndex()];
					if (oCell) {
						return oCell.$().closest(`.${this.selectableCells}`)[0];
					}
				} else if (bRange) {
					if (aRows[0].getIndex() > mPosition.rowIndex) {
						oRow = aRows[0];
						var oColumn = this.getVisibleColumns(oTable)[mPosition.colIndex];
						var oCell = oColumn && oRow.getCells()[mPosition.colIndex];
						if (oCell) {
							return oCell.$().closest(`.${this.selectableCells}`)[0];
						}
					} else if (aRows[aRows.length - 1].getIndex() < mPosition.rowIndex) {
						oRow = aRows[aRows.length - 1];
						var oColumn = this.getVisibleColumns(oTable)[mPosition.colIndex];
						var oCell = oColumn && oRow.getCells()[mPosition.colIndex];
						if (oCell) {
							return oCell.$().closest(`.${this.selectableCells}`)[0];
						}
					}
				}
			},
			/**
			 * Retrieve cell information for a given DOM element.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {HTMLElement} oTarget DOM element of cell
			 * @returns {Object} cell information containing rowIndex and colIndex
			 */
			getCellInfo: function (oTable, oTarget) {
				return {
					rowIndex: Element.closestTo(oTarget, true).getIndex(),
					colIndex: this.getVisibleColumns(oTable).indexOf(Element.getElementById(oTarget.getAttribute("data-sap-ui-colid")))
				};
			},
			/**
			 * Loads contexts according to the provided parameters without changing the binding's state.
			 *
			 * @param {sap.ui.table.Table} oTable The Table instance
			 * @param {int} iStartIndex The index where to start the retrieval of contexts
			 * @param {int} iLength The number of contexts to retrieve beginning from the start index.
			 */
			loadContexts: function(oTable, iStartIndex, iLength) {
				var oBinding = oTable.getBinding("rows");
				if (!oBinding || oBinding.isA("sap.ui.model.ClientListBinding")) {
					return;
				}

				oBinding.getContexts(Math.max(0, iStartIndex), Math.max(1, iLength), 0, true);
			},
			/**
			 * Retrieves the row contexts of the table according to the specified parameters.
			 * @param {sap.ui.table.Table} oTable The table instance
			 * @param {int} iFromIndex The start index
			 * @param {int} iToIndex The end index
			 * @param {int} iLimit The range limit
			 * @returns {sap.ui.model.Context[]} A portion of the row binding contexts
			 */
			getSelectedRowContexts: function(oTable, iFromIndex, iToIndex, iLimit) {
				if (iToIndex == Infinity) {
					var iMaxIndex = oTable.getBinding("rows").getAllCurrentContexts().length - 1;
					iToIndex = Math.min(iToIndex, iFromIndex + iLimit - 1, iMaxIndex);
				}

				var aContexts = [];
				for (var i = iFromIndex; i <= iToIndex; i++) {
					aContexts.push(oTable.getContextByIndex(i));
				}
				return aContexts;
			},
			/**
			 * Select rows beginning at iFrom to iTo.
			 * @param {sap.ui.table.Table} oTable The table instance
			 * @param {int} iFrom starting row index
			 * @param {int} iTo ending row index
			 * @param {int} mFocus focused row index
			 */
			selectRows: function(oTable, iFrom, iTo, iFocus) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				var sSelectionMode = oTable.getSelectionMode();

				if (sSelectionMode == "None") {
					return false;
				} else if (sSelectionMode == "Single") {
					iFrom = iTo = iFocus;
				}

				if (oSelectionOwner.addSelectionInterval) {
					oSelectionOwner.addSelectionInterval(iFrom, iTo);
					return true;
				}

				// TODO: Handle V4 correctly. Currrently only selects visible rows
				var aRows = oTable.getRows().filter(function(oRow) {
					return oRow.getIndex() >= iFrom && oRow.getIndex() <= iTo;
				});
				aRows.forEach(function(oRow) {
					oSelectionOwner.setSelected(oRow, true);
				});
				return true;
			},
			isRowSelected: function(oTable, iRow) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				var oRow = oTable.getRows().find(function(oRow) {
					return oRow.getIndex() == iRow;
				});

				if (oRow) {
					return oSelectionOwner.isSelected ? oSelectionOwner.isSelected(oRow) : oSelectionOwner.isIndexSelected(iRow);
				}
				return false;
			},
			focusCell: function(oTable, mFocus, bForward) {
				var oCellRef = this.getCellRef(oTable, mFocus);
				if (!oCellRef) {
					this.scroll(oTable, bForward, true);
					return;
				}
				oCellRef.focus();
			},
			scroll: function(oTable, bForward, bVertical) {
				if (bVertical) {
					var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();
					var iIndex = bForward ? iFirstVisibleRowIndex + 1 : iFirstVisibleRowIndex - 1;
					if (iIndex >= 0 && iIndex != iFirstVisibleRowIndex) {
						oTable.setFirstVisibleRow(iIndex);
						return Promise.resolve();
					}
				} else {
					var oScrollBar = oTable._getScrollExtension().getHorizontalScrollbar();
					var iScrollDiff = Math.pow(-1, +!bForward) * 10;

					oScrollBar.scrollLeft = Math.max(0, oScrollBar.scrollLeft + iScrollDiff);
					return Promise.resolve();
				}
				return false;
			},
			attachSelectionChange: function(oTable, fnCallback) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				if (oSelectionOwner.attachSelectionChange) {
					oSelectionOwner.attachSelectionChange(fnCallback);
					return;
				}
				oSelectionOwner.attachRowSelectionChange(fnCallback);
			},
			detachSelectionChange: function(oTable, fnCallback) {
				var oSelectionOwner = this._getSelectionOwner(oTable);
				if (oSelectionOwner.detachSelectionChange) {
					oSelectionOwner.detachSelectionChange(fnCallback);
					return;
				}
				oSelectionOwner.detachRowSelectionChange(fnCallback);
			},
			_getSelectionOwner: function(oTable) {
				return PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable;
			},
			getBinding: function(oTable) {
				return oTable.getBinding("rows");
			}
		}
	}, CellSelector);

	return CellSelector;
});
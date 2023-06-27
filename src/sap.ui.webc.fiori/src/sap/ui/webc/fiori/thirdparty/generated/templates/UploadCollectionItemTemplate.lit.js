sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<li part="native-li" data-sap-focus-ref tabindex="${(0, _LitRenderer.ifDefined)(this._effectiveTabIndex)}" class="${(0, _LitRenderer.classMap)(this.classes.main)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" @mouseup="${this._onmouseup}" @mousedown="${this._onmousedown}" @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" @click="${this._onclick}" role="${(0, _LitRenderer.ifDefined)(this._accInfo.role)}" aria-expanded="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaExpanded)}" title="${(0, _LitRenderer.ifDefined)(this.title)}" aria-level="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaLevel)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaHaspopup)}" aria-posinset="${(0, _LitRenderer.ifDefined)(this._accInfo.posinset)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}" aria-setsize="${(0, _LitRenderer.ifDefined)(this._accInfo.setsize)}" aria-describedby="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._accessibleNameRef)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this._ariaDisabled)}" aria-selected="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelected)}" aria-checked="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaChecked)}" aria-owns="${(0, _LitRenderer.ifDefined)(this._accInfo.ariaOwns)}">${this.placeSelectionElementBefore ? block1.call(this, context, tags, suffix) : undefined}<div id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-li-content"><div class="ui5-uci-thumbnail"><slot name="thumbnail"></slot></div><div class="ui5-uci-content-and-edit-container"><div class="ui5-uci-content-and-progress"><div class="ui5-uci-content">${this._editing ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}<div class="ui5-uci-description"><slot></slot></div></div>${this._showProgressIndicator ? block6.call(this, context, tags, suffix) : undefined}</div><div class="ui5-uci-edit-buttons">${this._editing ? block7.call(this, context, tags, suffix) : block8.call(this, context, tags, suffix)}</div></div></div>${this.typeDetail ? block13.call(this, context, tags, suffix) : undefined}${this.typeNavigation ? block14.call(this, context, tags, suffix) : undefined}${this.navigated ? block15.call(this, context, tags, suffix) : undefined}${this.placeSelectionElementAfter ? block16.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.listItemAriaLabel)}${(0, _LitRenderer.ifDefined)(this.accessibleName)}</span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText-describedby" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._accInfo.ariaSelectedText)}</span></li>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)``;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-uci-edit-container"><${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)} id="ui5-uci-edit-input" data-sap-focus-ref @focusin="${this._onInputFocusin}" @keydown="${this._onInputKeyDown}"></${(0, _LitRenderer.scopeTag)("ui5-input", tags, suffix)}><span class="ui5-uci-file-extension">${(0, _LitRenderer.ifDefined)(this._fileExtension)}</span></div>` : (0, _LitRenderer.html)`<div class="ui5-uci-edit-container"><ui5-input id="ui5-uci-edit-input" data-sap-focus-ref @focusin="${this._onInputFocusin}" @keydown="${this._onInputKeyDown}"></ui5-input><span class="ui5-uci-file-extension">${(0, _LitRenderer.ifDefined)(this._fileExtension)}</span></div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.fileNameClickable ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)} class="ui5-uci-file-name" @ui5-click="${(0, _LitRenderer.ifDefined)(this._onFileNameClick)}">${(0, _LitRenderer.ifDefined)(this.fileName)}</${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-link class="ui5-uci-file-name" @ui5-click="${(0, _LitRenderer.ifDefined)(this._onFileNameClick)}">${(0, _LitRenderer.ifDefined)(this.fileName)}</ui5-link>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-uci-file-name ui5-uci-file-name-text">${(0, _LitRenderer.ifDefined)(this.fileName)}</span>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-uci-progress-box"><${(0, _LitRenderer.scopeTag)("ui5-progress-indicator", tags, suffix)} class="ui5-uci-progress-indicator" hide-value value="${(0, _LitRenderer.ifDefined)(this.progress)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueStateName)}"></${(0, _LitRenderer.scopeTag)("ui5-progress-indicator", tags, suffix)}><div class="ui5-uci-progress-labels"><${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} show-colon>${(0, _LitRenderer.ifDefined)(this._progressText)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}><${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>${(0, _LitRenderer.ifDefined)(this.progress)}%</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}></div></div>` : (0, _LitRenderer.html)`<div class="ui5-uci-progress-box"><ui5-progress-indicator class="ui5-uci-progress-indicator" hide-value value="${(0, _LitRenderer.ifDefined)(this.progress)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueStateName)}"></ui5-progress-indicator><div class="ui5-uci-progress-labels"><ui5-label show-colon>${(0, _LitRenderer.ifDefined)(this._progressText)}</ui5-label><ui5-label>${(0, _LitRenderer.ifDefined)(this.progress)}%</ui5-label></div></div>`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" class="ui5-uci-edit-rename-btn" @click="${this._onRename}" @keyup="${this._onRenameKeyup}">${(0, _LitRenderer.ifDefined)(this._renameBtnText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" id="ui5-uci-edit-cancel" @click="${this._onRenameCancel}" @keyup="${this._onRenameCancelKeyup}">${(0, _LitRenderer.ifDefined)(this._cancelRenameBtnText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button design="Transparent" class="ui5-uci-edit-rename-btn" @click="${this._onRename}" @keyup="${this._onRenameKeyup}">${(0, _LitRenderer.ifDefined)(this._renameBtnText)}</ui5-button><ui5-button design="Transparent" id="ui5-uci-edit-cancel" @click="${this._onRenameCancel}" @keyup="${this._onRenameCancelKeyup}">${(0, _LitRenderer.ifDefined)(this._cancelRenameBtnText)}</ui5-button>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this._showRetry ? block9.call(this, context, tags, suffix) : undefined}${this._showTerminate ? block10.call(this, context, tags, suffix) : undefined}${this.showEditButton ? block11.call(this, context, tags, suffix) : undefined}${this.renderDeleteButton ? block12.call(this, context, tags, suffix) : undefined}`;
  }
  function block9(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="refresh" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._retryButtonTooltip)}" @click="${this._onRetry}" @keyup="${this._onRetryKeyup}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="refresh" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._retryButtonTooltip)}" @click="${this._onRetry}" @keyup="${this._onRetryKeyup}"></ui5-button>`;
  }
  function block10(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="stop" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._terminateButtonTooltip)}" @click="${this._onTerminate}" @keyup="${this._onTerminateKeyup}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="stop" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._terminateButtonTooltip)}" @click="${this._onTerminate}" @keyup="${this._onTerminateKeyup}"></ui5-button>`;
  }
  function block11(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-editing-button" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._editButtonTooltip)}" icon="edit" @click="${this.onDetailClick}" @keyup="${this._onDetailKeyup}" class="ui5-li-detailbtn ui5-uci-edit"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button id="${(0, _LitRenderer.ifDefined)(this._id)}-editing-button" design="Transparent" tooltip="${(0, _LitRenderer.ifDefined)(this._editButtonTooltip)}" icon="edit" @click="${this.onDetailClick}" @keyup="${this._onDetailKeyup}" class="ui5-li-detailbtn ui5-uci-edit"></ui5-button>`;
  }
  function block12(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-li-deletebtn" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button class="ui5-li-deletebtn" tabindex="-1" data-sap-no-tab-ref id="${(0, _LitRenderer.ifDefined)(this._id)}-deleteSelectionElement" design="Transparent" icon="decline" ?disabled="${this.disableDeleteButton}" @click="${this.onDelete}" tooltip="${(0, _LitRenderer.ifDefined)(this.deleteText)}"></ui5-button>`;
  }
  function block13(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" icon="edit" @click="${this.onDetailClick}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-li-detailbtn"><ui5-button design="Transparent" icon="edit" @click="${this.onDetailClick}"></ui5-button></div>`;
  }
  function block14(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name ="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name ="slim-arrow-right"></ui5-icon>`;
  }
  function block15(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-li-navigated"></div>`;
  }
  function block16(context, tags, suffix) {
    return (0, _LitRenderer.html)``;
  }
  var _default = block0;
  _exports.default = _default;
});
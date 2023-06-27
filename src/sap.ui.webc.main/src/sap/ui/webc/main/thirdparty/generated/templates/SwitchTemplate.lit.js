sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-switch-root ${(0, _LitRenderer.classMap)(this.classes.main)}" role="switch" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-checked="${(0, _LitRenderer.ifDefined)(this.checked)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveAriaDisabled)}" @click="${this._onclick}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" dir="${(0, _LitRenderer.ifDefined)(this.effectiveDir)}" title="${(0, _LitRenderer.ifDefined)(this.tooltip)}"><div class="ui5-switch-inner"><div class="ui5-switch-track" part="slider"><div class="ui5-switch-slider">${this.graphical ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}<span class="ui5-switch-handle" part="handle"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-handle-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span></div></div></div><input type='checkbox' ?checked="${this.checked}" class="ui5-switch-input" data-sap-no-tab-ref/></div>` : (0, _LitRenderer.html)`<div class="ui5-switch-root ${(0, _LitRenderer.classMap)(this.classes.main)}" role="switch" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-checked="${(0, _LitRenderer.ifDefined)(this.checked)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this.effectiveAriaDisabled)}" @click="${this._onclick}" @keyup="${this._onkeyup}" @keydown="${this._onkeydown}" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" dir="${(0, _LitRenderer.ifDefined)(this.effectiveDir)}" title="${(0, _LitRenderer.ifDefined)(this.tooltip)}"><div class="ui5-switch-inner"><div class="ui5-switch-track" part="slider"><div class="ui5-switch-slider">${this.graphical ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}<span class="ui5-switch-handle" part="handle"><ui5-icon name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-handle-icon"></ui5-icon></span></div></div></div><input type='checkbox' ?checked="${this.checked}" class="ui5-switch-input" data-sap-no-tab-ref/></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<span class="ui5-switch-text ui5-switch-text--on"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="accept" class="ui5-switch-icon-on"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span><span class="ui5-switch-text ui5-switch-text--off"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="decline" class="ui5-switch-icon-off"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span>` : (0, _LitRenderer.html)`<span class="ui5-switch-text ui5-switch-text--on"><ui5-icon name="accept" class="ui5-switch-icon-on"></ui5-icon></span><span class="ui5-switch-text ui5-switch-text--off"><ui5-icon name="decline" class="ui5-switch-icon-off"></ui5-icon></span>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.hasNoLabel ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<span class="ui5-switch-text ui5-switch-text--on ui5-switch-no-label-icon" part="text-on"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-no-label-icon-on"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span><span class="ui5-switch-text ui5-switch-text--off switch-no-label-icon" part="text-off"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-no-label-icon-off"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></span>` : (0, _LitRenderer.html)`<span class="ui5-switch-text ui5-switch-text--on ui5-switch-no-label-icon" part="text-on"><ui5-icon name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-no-label-icon-on"></ui5-icon></span><span class="ui5-switch-text ui5-switch-text--off switch-no-label-icon" part="text-off"><ui5-icon name="${(0, _LitRenderer.ifDefined)(this.sapNextIcon)}" class="ui5-switch-no-label-icon-off"></ui5-icon></span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-switch-text ui5-switch-text--on" part="text-on">${(0, _LitRenderer.ifDefined)(this._textOn)}</span><span class="ui5-switch-text ui5-switch-text--off" part="text-off">${(0, _LitRenderer.ifDefined)(this._textOff)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});
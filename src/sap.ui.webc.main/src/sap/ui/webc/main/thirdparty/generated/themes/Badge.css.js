sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", async () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/Badge.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: inline-block;\n\tvertical-align: top;\n\theight: 1rem;\n\tmin-width: 1.125em;\n\tmax-width: 100%;\n\tpadding: 0 0.3125em;\n\tcolor: var(--sapAccentColor1);\n\tbackground: var(--sapLegendBackgroundColor1);\n\tborder: 0.0625em solid;\n\tborder-radius: 0.5rem;\n\tbox-sizing: border-box;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-weight: bold;\n\ttext-align: center;\n\tletter-spacing: 0.0125em;\n}\n\n:host([color-scheme]:hover),\n:host(:not([color-scheme]):hover) {\n\tcursor: var(--_ui5-badge-cursor);\n}\n\n.ui5-badge-root {\n\tdisplay: flex;\n\talign-items: center;\n\twidth: 100%;\n\theight: 100%;\n\tbox-sizing: border-box;\n\tpointer-events: none;\n}\n\n.ui5-badge-text {\n\twidth: 100%;\n\toverflow: hidden;\n\twhite-space: nowrap;\n\tfont-weight: inherit;\n\ttext-overflow: ellipsis;\n\tline-height: 1;\n\ttext-transform: uppercase;\n\tletter-spacing: inherit;\n\tfont-size: 0.75em; /* origin from --sapFontSmallSize (0.75rem) */\n}\n\n:host(:hover) .ui5-badge-text {\n\tcursor: var(--_ui5-badge-cursor);\n}\n\n:host([_icon-only]) {\n\tpadding: 0 0.1875em;\n}\n\n::slotted([ui5-icon]) {\n\twidth: 0.75em;\n\theight: 0.75em;\n\tmin-width: 0.75em;\n\tmin-height: 0.75em;\n\tcolor: inherit;\n}\n\n:host([_has-icon]) .ui5-badge-text {\n\tpadding-inline-start: 0.125rem;\n}\n\n/* Scheme 1 */\n\n:host([color-scheme=\"1\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-1-background);\n\tborder-color: var(--ui5-badge-color-scheme-1-border);\n\tcolor: var(--ui5-badge-color-scheme-1-color);\n}\n\n/* Scheme 2 */\n\n:host([color-scheme=\"2\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-2-background);\n\tborder-color: var(--ui5-badge-color-scheme-2-border);\n\tcolor: var(--ui5-badge-color-scheme-2-color);\n}\n\n/* Scheme 3 */\n\n:host([color-scheme=\"3\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-3-background);\n\tborder-color: var(--ui5-badge-color-scheme-3-border);\n\tcolor: var(--ui5-badge-color-scheme-3-color);\n}\n\n/* Scheme 4 */\n\n:host([color-scheme=\"4\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-4-background);\n\tborder-color: var(--ui5-badge-color-scheme-4-border);\n\tcolor: var(--ui5-badge-color-scheme-4-color);\n}\n\n/* Scheme 5 */\n\n:host([color-scheme=\"5\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-5-background);\n\tborder-color: var(--ui5-badge-color-scheme-5-border);\n\tcolor: var(--ui5-badge-color-scheme-5-color);\n}\n\n/* Scheme 6 */\n\n:host([color-scheme=\"6\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-6-background);\n\tborder-color: var(--ui5-badge-color-scheme-6-border);\n\tcolor: var(--ui5-badge-color-scheme-6-color);\n}\n\n/* Scheme 7 */\n\n:host([color-scheme=\"7\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-7-background);\n\tborder-color: var(--ui5-badge-color-scheme-7-border);\n\tcolor: var(--ui5-badge-color-scheme-7-color);\n}\n\n/* Scheme 8 */\n\n:host([color-scheme=\"8\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-8-background);\n\tborder-color: var(--ui5-badge-color-scheme-8-border);\n\tcolor: var(--ui5-badge-color-scheme-8-color);\n}\n\n/* Scheme 9 */\n\n:host([color-scheme=\"9\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-9-background);\n\tborder-color: var(--ui5-badge-color-scheme-9-border);\n\tcolor: var(--ui5-badge-color-scheme-9-color);\n}\n\n/* Scheme 10 */\n\n:host([color-scheme=\"10\"]) {\n\tbackground-color: var(--ui5-badge-color-scheme-10-background);\n\tborder-color: var(--ui5-badge-color-scheme-10-border);\n\tcolor: var(--ui5-badge-color-scheme-10-color);\n}\n\n/* ---Slotted Badges--- */\n\n/* [ui5-avatar] - Badge icon styles */\n\n/* Make icon take full width minus padding.\n [ui5-avatar] is the only component using an icon for badge,\n therefore no additional scoping is needed. */\n\n:host([slot=\"badge\"]) ::slotted([ui5-icon][slot=\"icon\"]) {\n\twidth: 100%;\n\theight: 100%;\n\tmin-width: 100%;\n\tmin-height: 100%;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});
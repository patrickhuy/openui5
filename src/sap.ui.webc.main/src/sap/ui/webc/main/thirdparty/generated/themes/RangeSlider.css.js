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
    fileName: "themes/RangeSlider.css",
    content: ":host([ui5-range-slider]) .ui5-slider-progress-container::before {\n\tbackground-color: var(--_ui5_slider_progress_container_dot_background);\n}\n\n/* Range Slider handles (Horizon implementatioon) */\n\n.ui5-slider-root:hover:active .ui5-slider-handle:not(:focus) {\n\tbackground: var(--sapSlider_RangeHandleBackground);\n}\n\n.ui5-slider-root:active .ui5-slider-handle:active:focus,\n.ui5-slider-root:active .ui5-slider-handle:focus {\n\tbackground: var(--_ui5_range_slider_handle_active_background);\n}\n\n.ui5-slider-root:active .ui5-slider-handle:active:focus [slider-icon],\n.ui5-slider-root:active .ui5-slider-handle:focus [slider-icon] {\n\tdisplay: var(--_ui5_range_slider_active_handle_icon_display);\n}\n\n:host([range-pressed]) .ui5-slider-root:active .ui5-slider-handle:not(:focus) {\n\tbackground: var(--_ui5_range_slider_handle_active_background);\n\tborder: var(--_ui5_slider_handle_focus_border);\n\tbox-shadow: none;\n}\n\n:host([range-pressed]) .ui5-slider-progress:focus::after {\n\tborder: none;\n}\n\n:host([range-pressed]) .ui5-slider-handle [slider-icon] {\n\tdisplay: var(--_ui5_range_slider_active_handle_icon_display);\n}\n\n.ui5-slider-root:not(.ui5-slider-root-phone):focus .ui5-slider-inner .ui5-slider-handle,\n.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-inner .ui5-slider-handle:focus {\n\tbackground: var(--_ui5_range_slider_handle_background_focus);\n}\n\n.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-inner .ui5-slider-handle:focus [slider-icon] {\n  display: none;\n}\n\n.ui5-slider-root:not(.ui5-slider-root-phone) .ui5-slider-progress:focus::before {\n\tdisplay: var(--_ui5_range_slider_legacy_progress_focus_display);\n\tcontent: '';\n\tposition: absolute;\n\twidth: var(--_ui5_range_slider_focus_outline_width);\n\tborder: var(--_ui5_slider_progress_outline);\n\tborder-radius: var(--_ui5_range_slider_focus_outline_radius);\n\ttop: var(--_ui5_slider_progress_outline_offset);\n\theight: var(--_ui5_slider_outer_height);\n\tbox-sizing: border-box;\n\tleft: var(--_ui5_slider_progress_outline_offset_left);\n}\n\n.ui5-slider-progress {\n  position: relative;\n}\n\n.ui5-slider-progress:focus::after {\n\tborder: 0.125rem solid var(--sapContent_FocusColor);\n\tborder-radius: 0.5rem;\n\tcontent: \"\";\n\tdisplay: var(--_ui5_range_slider_progress_focus_display);\n\tposition: absolute;\n\ttop: var(--_ui5_range_slider_progress_focus_top);\n\tleft: var(--_ui5_range_slider_progress_focus_left);\n\tpadding: var(--_ui5_range_slider_progress_focus_padding);\n\twidth: var(--_ui5_range_slider_progress_focus_width);\n\theight: var(--_ui5_range_slider_progress_focus_height);\n\tbox-sizing: border-box;\n}\n\n.ui5-slider-handle {\n\tbackground: var(--_ui5_range_slider_handle_background);\n}\n\n.ui5-slider-root:hover .ui5-slider-handle:not(:focus) {\n\tbackground: var(--_ui5_range_slider_root_hover_handle_bg);\n}\n\n.ui5-slider-root:hover .ui5-slider-handle:not(:focus) [slider-icon] {\n\tdisplay: var(--_ui5_range_slider_root_hover_handle_icon_display);\n}\n\n:host([range-pressed]) .ui5-slider-root:active .ui5-slider-handle:not(:focus) [slider-icon] {\n\tdisplay: var(--_ui5_range_slider_root_active_handle_icon_display);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});
sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/sap_fiori_3_hcb/parameters-bundle.css",
    content: "[data-ui5-compact-size] [_ui5host],\n.ui5-content-density-compact [_ui5host],\n.sapUiSizeCompact [_ui5host] {\n\t--_ui5_bar_base_height: 2.5rem;\n\t--_ui5_bar_subheader_height: 2.25rem;\n}\n:root [_ui5host] {\n\t--_ui5_bar_base_height: 2.75rem;\n\t--_ui5_bar_subheader_height: 3rem;\n}\n:root [_ui5host] {\n\t--_ui5_fcl_solid_bg: var(--sapBackgroundColor);\n\t--_ui5_fcl_column_border: solid 0.0625rem var(--sapGroup_ContentBorderColor);\n\t--_ui5_fcl_decoration_top: linear-gradient(to top, var(--sapObjectHeader_BorderColor), #000); \n\t--_ui5_fcl_decoration_bottom: linear-gradient(to bottom, var(--sapObjectHeader_BorderColor), #000); \n}\n:root [_ui5host] {\r\n    --sapIllus_BrandColorPrimary: var(--sapContent_Illustrative_Color1);\r\n    --sapIllus_BrandColorSecondary: var(--sapContent_Illustrative_Color2);\r\n    --sapIllus_StrokeDetailColor: var(--sapContent_Illustrative_Color4);\r\n    --sapIllus_Layering1: var(--sapContent_Illustrative_Color5);\r\n    --sapIllus_Layering2: var(--sapContent_Illustrative_Color6);\r\n    --sapIllus_BackgroundColor: var(--sapContent_Illustrative_Color7);\r\n    --sapIllus_ObjectFillColor: var(--sapContent_Illustrative_Color8);\r\n    --sapIllus_AccentColor: var(--sapContent_Illustrative_Color3);\r\n    --sapIllus_NoColor: none;\r\n    --sapIllus_PatternShadow: url(#sapIllus_PatternShadow);\r\n    --sapIllus_PatternHighlight: url(#sapIllus_PatternHighlight);\r\n  }\n:root [_ui5host] {\n\t--_ui5_media_gallery_overflow_btn_background:  var(--sapButton_Background);\n\t--_ui5_media_gallery_overflow_btn_color:  var(--sapButton_TextColor);\n\t--_ui5_media_gallery_overflow_btn_border:  1px solid var(--sapButton_BorderColor);\n}\n:root [_ui5host] {\n\t--_ui5_media_gallery_thumbnail_border: 1px solid var(--sapContent_ForegroundColor);\n\t--_ui5_media_gallery_thumbnail_selected_border: 2px solid var(--sapSelectedColor);\n\t--_ui5_media_gallery_thumbnail_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\t--_ui5_media_gallery_item_overlay_box_shadow: inset 0px 0px 80px rgba(0, 0, 0, 0.2);\n}\n:root [_ui5host] {\n\t--_ui5_page_list_bg: var(--sapGroup_ContentBackground);\n\t--_ui5_page_transparent_bg: var(--sapBackgroundColor);\n}\n:root [_ui5host] {\n\t--_ui5_product_switch_item_width: 11.25rem;\n\t--_ui5_product_switch_item_height: 7rem;\n\t--_ui5_product_switch_item_outline_width: .0625rem;\n\t--_ui5_product_switch_item_outline_color: var(--sapContent_FocusColor);\n\t--_ui5_product_switch_item_outline: var(--_ui5_product_switch_item_outline_width) var(--_ui5_product_switch_item_outline_color) dotted;\n\t--_ui5_product_switch_item_active_outline_color: var(--sapContent_ContrastFocusColor);\n\t--_ui5_product_switch_item_outline_offset: -.1875rem;\n\t--_ui5_product_switch_item_outline_offset_positive: .1875rem;\n}\n:root [_ui5host] {\n\t--_ui5_product_switch_item_outline_width: .125rem;\n\t--_ui5_product_switch_item_outline_color: var(--sapContent_ContrastFocusColor);\n\t--_ui5_product_switch_item_outline: var(--_ui5_product_switch_item_outline_width) var(--_ui5_product_switch_item_outline_color) dotted;\n\t--_ui5_product_switch_item_outline_offset: -.25rem;\n\t--_ui5_product_switch_item_border: 1px solid var(--sapField_BorderColor);\n}\n:root [_ui5host] {\r\n\t--_ui5_shellbar_root_height: 2.75rem;\r\n\t--_ui5_shellbar_logo_outline_color: var(--sapContent_ContrastFocusColor);\r\n\t--_ui5_shellbar_logo_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5_shellbar_logo_outline_color);\r\n\t--_ui5_shellbar_outline_offset: -0.0625rem;\r\n\t--_ui5_shellbar_logo_outline_offset: var(--_ui5_shellbar_outline_offset);\r\n\t--_ui5_shellbar_button_box_shadow: none;\r\n\t--_ui5_shellbar_button_border: none;\r\n\t--_ui5_shellbar_button_border_radius: 0.25rem;\r\n\t--_ui5_shellbar_button_active_color: var(--sapShell_Active_TextColor);\r\n\t--_ui5_shellbar_logo_outline_border_radius: 0;\r\n\t--_ui5_shellbar_copilot_stop_color1: #C0D9F2;\r\n\t--_ui5_shellbar_copilot_stop_color2: #FFFFFF;\r\n\t--_ui5_shellbar_copilot_focus_offset: 0;\r\n\t--_ui5_shellbar_search_button_size: 2.25rem;\r\n\t--_ui5_shellbar_search_field_height: 2.25rem;\r\n\t--_ui5_shellbar_search_button_border_radius: 0.25rem;\r\n\t--_ui5_shellbar_search_field_background: var(--sapShellColor);\r\n\t--_ui5_shellbar_search_field_border: 1px solid var(--sapShell_InteractiveBorderColor);\r\n\t--_ui5_shellbar_search_field_color: var(--sapShell_TextColor);\r\n\t--_ui5_shellbar_search_field_outline_focused: 1px dotted var(--sapContent_ContrastFocusColor);\r\n\t--_ui5_shellbar_overflow_container_middle_height: 2.5rem;\r\n\t--_ui5_shellbar_menu_button_title_font_size: 0.75rem;\r\n}\n:root [_ui5host] {\n\t--_ui5_side_navigation_separator_backgound: var(--sapList_GroupHeaderBorderColor);\n\t--_ui5_side_navigation_icon_color: var(--sapContent_IconColor);\n\t--_ui5_side_navigation_icon_size: 1rem;\n\t--_ui5_side_navigation_toggle_icon_size: 1rem;\n\t--_ui5_side_navigation_collapsed_state_width: 3.25rem;\n\t--_ui5_side_navigation_indent_step: 2.25rem;\n\t--_ui5_side_navigation_icon_padding: 1.125rem;\n}\n:root [_ui5host] {\n\t--_ui5_TimelineItem_arrow_size: 1.625rem;\n\t--_ui5_TimelineItem_bubble_border_width: 0.0625rem;\n\t--_ui5_TimelineItem_bubble_border_style: dotted;\n\t--_ui5_TimelineItem_bubble_border_radius: 0.25rem;\n\t--_ui5_TimelineItem_bubble_border_color: var(--sapList_BorderColor);\n\t--_ui5_TimelineItem_bubble_border_top: -0.125rem;\n\t--_ui5_TimelineItem_bubble_border_right: -0.125rem;\n\t--_ui5_TimelineItem_bubble_border_bottom: -0.125rem;\n\t--_ui5_TimelineItem_bubble_border_left: -0.625rem;\n\t--_ui5_TimelineItem_bubble_rtl_left_offset: -0.125rem;\n\t--_ui5_TimelineItem_bubble_rtl_right_offset: -0.625rem;\n\t--_ui5_TimelineItem_bubble_focus_border_radius: 0;\n\t--_ui5_TimelineItem_horizontal_bubble_focus_top_offset: -0.625rem;\n\t--_ui5_TimelineItem_horizontal_bubble_focus_left_offset: -0.125rem;\n\n\t--_ui5_TimelineItem_bubble_content_padding: var(--_ui5_tl_bubble_padding);\n\t--_ui5_TimelineItem_bubble_content_subtitle_padding_top: 0.375rem;\n\t--_ui5_TimelineItem_bubble_content_description_padding_top: 0.75rem;\n}\n:root [_ui5host] {\n\t--_ui5_TimelineItem_bubble_outline_width: 0.125rem;\n\t--_ui5_TimelineItem_bubble_outline_top: -0.1875rem;\n\t--_ui5_TimelineItem_bubble_outline_right: -0.1875rem;\n\t--_ui5_TimelineItem_bubble_outline_bottom: -0.1875rem;\n\t--_ui5_TimelineItem_bubble_outline_left: -0.6875rem;\n\t--_ui5_TimelineItem_bubble_rtl_left_offset: -0.1875rem;\n\t--_ui5_TimelineItem_bubble_rtl_right_offset: -0.6875rem;\n}\n:root [_ui5host] {\n\t--ui5_upload_collection_drag_overlay_border: 0.125rem dashed var(--sapContent_ForegroundBorderColor);\n\t--ui5_upload_collection_drop_overlay_border: 0.125rem solid var(--sapContent_DragAndDropActiveColor);\n\t--ui5_upload_collection_drop_overlay_background: transparent;\n\t--ui5_upload_collection_button_margin_block_end: 0;\n\t--ui5_upload_collection_last_button_inline_end: 0;\n\t--ui5_upload_collection_small_size_buttons_margin_block_start: 0.75rem;\n}\n:root [_ui5host] {\n\t--ui5_upload_collection_drag_overlay_border: 0.1875rem dashed var(--sapContent_ForegroundBorderColor);\n\t--ui5_upload_collection_drop_overlay_border: 0.1875rem solid var(--sapContent_HelpColor);\n\t--ui5_upload_collection_drop_overlay_background: transparent;\n}\n:root [_ui5host] {\n\t--_ui5_vsd_header_container: 2.75rem;\n\t--_ui5_vsd_sub_header_container_height: 2.75rem;\n\t--_ui5_vsd_content_li_padding: 0.375rem;\n\t--_ui5_vsd_content_height: 23.4375rem;\n\t--_ui5_vsd_expand_content_height: 26.1875rem;\n}\n:root [_ui5host] {\n    --_ui5_wiz_content_item_wrapper_padding: 0rem;\n    --_ui5_wiz_content_item_wrapper_bg: var(--sapBackgroundColor);\n}\n:root [_ui5host] {\n\t--_ui5_wiz_tab_focus_outline: 1px dotted var(--sapContent_FocusColor);\n\t--_ui5_wiz_tab_selected_bg: var(--sapSelectedColor);\n\t--_ui5_wiz_tab_border: 1px solid var(--sapSelectedColor);\n\t--_ui5_wiz_tab_selection_line: var(--sapSelectedColor);\n\t--_ui5_wiz_tab_icon_color: var(--sapSelectedColor);\n\t--_ui5_wiz_tab_active_separator_color: var(--sapSelectedColor);\n\t--_ui5_wiz_tab_title_color: var(--sapContent_LabelColor);\n\t--_ui5_wiz_tab_title_font_family: var(--sapFontFamily);\n\t--_ui5_wiz_tab_focus_border_radius: 0;\n}\n:root [_ui5host] {\n\t--_ui5_wiz_tab_focus_outline: 0.125rem dotted var(--sapContent_FocusColor);\n\t--_ui5_wiz_tab_selection_line: var(--sapTextColor);\n\t--_ui5_wiz_tab_border: 1px solid var(--sapTextColor);\n\t--_ui5_wiz_tab_icon_color: var(--sapTextColor);\n\t--_ui5_wiz_tab_active_separator_color: var(--sapTextColor);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});
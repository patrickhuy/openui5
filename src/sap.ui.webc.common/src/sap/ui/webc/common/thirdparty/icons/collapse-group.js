sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/collapse-group", "./v5/collapse-group"], function (_exports, _Theme, _collapseGroup, _collapseGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collapseGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collapseGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collapseGroup.pathData : _collapseGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "collapse-group";
  _exports.default = _default;
});
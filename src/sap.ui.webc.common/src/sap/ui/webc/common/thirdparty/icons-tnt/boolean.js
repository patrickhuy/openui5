sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/boolean", "./v3/boolean"], function (_exports, _Theme, _boolean, _boolean2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boolean.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boolean.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boolean.pathData : _boolean2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/boolean";
  _exports.default = _default;
});
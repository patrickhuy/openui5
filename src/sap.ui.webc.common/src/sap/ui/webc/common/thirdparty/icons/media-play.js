sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/media-play", "./v5/media-play"], function (_exports, _Theme, _mediaPlay, _mediaPlay2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mediaPlay.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mediaPlay.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mediaPlay.pathData : _mediaPlay2.pathData;
  _exports.pathData = pathData;
  var _default = "media-play";
  _exports.default = _default;
});
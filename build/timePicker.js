var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var timePicker = (function (window) {
    var materialPicker = (function () {
        function materialPicker(conf) {
            var _this = this;
            this.inputList = [];
            this.inputDataList = [];
            this.inputEleindex = 0;
            this.curInputData = null;
            this.wrapper = null;
            this.nowBtn = null;
            this.closeBtn = null;
            this.comfirmBtn = null;
            this.$dateInstance = null;
            this.$conf = {};
            this.$methods = {};
            this.$dateInstance = new Date();
            this.$conf = {
                themeColor: '#4CAF50',
                type: 'portrait',
                directive: 'date-picker'
            };
            this.curInputData = {
                inputEle: null,
                index: -1,
                selectedValue: '',
                themeColor: this.$conf['themeColor'],
                type: this.$conf['type'],
                onSelect: null,
                onShow: null,
                onClose: null
            };
            this.$conf = conf ? Object['assign'](this.$conf, conf) : this.$conf;
            this.inputList = Array.prototype.slice.call(document.querySelectorAll("input[type=\"" + this.$conf['directive'] + "\"]"));
            if (this.inputList.length) {
                this.inputList.map(function (item) { return _this.addInputData(item); });
            }
        }
        materialPicker.prototype.init = function () { };
        materialPicker.prototype.close = function () {
            this.setStyle(this.materialPickerContainer, ['transform', 'opacity'], ['translateY(-30%)', 0]);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['hidden', 0]);
            this.curInputData.onClose();
        };
        materialPicker.prototype.comfirm = function (value) {
            this.curInputData.inputEle['value'] = this.curInputData.selectedValue = value;
            this.curInputData.onSelect(this.curInputData.selectedValue);
        };
        materialPicker.prototype.setTheme = function (color, type) {
            this.type = type || this.$conf['type'];
            this.themeColor = color || this.$conf['themeColor'];
            this.setStyle(this.pickerInfoContainer, ['backgroundColor'], [this.themeColor]);
            this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
            this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
            this.setStyle(this.nowBtn, ['color'], [this.themeColor]);
            this.setStyle(this.materialPickerContainer, ['flexDirection', 'transform', 'opacity'], [this.type === 'portrait' ? 'column' : 'row', 'translateY(0)', '1']);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['visible', 1]);
        };
        materialPicker.prototype.getElement = function (tag, ele) {
            return document.querySelector(tag + "[data-ele=\"" + ele + "\"]");
        };
        materialPicker.prototype.setStyle = function (ele, styleList, valueList) {
            styleList.map(function (style, i) { return ele['style'][style] = valueList[i]; });
        };
        materialPicker.prototype.getMethod = function (ele, eventName) {
            var _this = this;
            return function (date) {
                _this.$methods[ele.getAttribute(eventName)] && _this.$methods[ele.getAttribute(eventName)](date);
            };
        };
        materialPicker.prototype.addInputData = function (inputEle) {
            inputEle.setAttribute('data-component-index', this.inputEleindex.toString());
            this.inputDataList.push({
                inputEle: inputEle,
                index: this.inputEleindex,
                selectedValue: inputEle['value'],
                themeColor: inputEle.getAttribute('data-color') || this.themeColor,
                type: inputEle.getAttribute('data-type') || this.type,
                onSelect: this.getMethod(inputEle, 'onSelect'),
                onShow: this.getMethod(inputEle, 'onShow'),
                onClose: this.getMethod(inputEle, 'onClose')
            });
            this.inputEleindex++;
        };
        materialPicker.prototype.methods = function (name, fn) {
            this.$methods[name] = fn;
        };
        return materialPicker;
    }());
    var timePicker = (function (_super) {
        __extends(timePicker, _super);
        function timePicker(conf) {
            return _super.call(this, conf) || this;
        }
        timePicker.prototype.createContainer = function () {
        };
        timePicker.prototype.init = function () {
        };
        timePicker.prototype.show = function () {
        };
        return timePicker;
    }(materialPicker));
    return timePicker;
})(window);

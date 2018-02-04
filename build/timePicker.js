var timePicker = (function (window) {
    var MaterialPicker = (function () {
        function MaterialPicker(conf) {
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
            console.log(materialPicker.prototype['constructor']);
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
        MaterialPicker.prototype.init = function () { };
        MaterialPicker.prototype.close = function () {
            this.setStyle(this.materialPickerContainer, ['transform', 'opacity'], ['translateY(-30%)', 0]);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['hidden', 0]);
            this.curInputData.onClose();
        };
        MaterialPicker.prototype.comfirm = function (value) {
            this.curInputData.inputEle['value'] = this.curInputData.selectedValue = value;
            this.curInputData.onSelect(this.curInputData.selectedValue);
        };
        MaterialPicker.prototype.setTheme = function (color, type) {
            this.type = type || this.$conf['type'];
            this.themeColor = color || this.$conf['themeColor'];
            this.setStyle(this.pickerInfoContainer, ['backgroundColor'], [this.themeColor]);
            this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
            this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
            this.setStyle(this.nowBtn, ['color'], [this.themeColor]);
            this.setStyle(this.materialPickerContainer, ['flexDirection', 'transform', 'opacity'], [this.type === 'portrait' ? 'column' : 'row', 'translateY(0)', '1']);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['visible', 1]);
        };
        MaterialPicker.prototype.getElement = function (tag, ele) {
            return document.querySelector(tag + "[data-ele=\"" + ele + "\"]");
        };
        MaterialPicker.prototype.setStyle = function (ele, styleList, valueList) {
            styleList.map(function (style, i) { return ele['style'][style] = valueList[i]; });
        };
        MaterialPicker.prototype.getMethod = function (ele, eventName) {
            var _this = this;
            return function (date) {
                _this.$methods[ele.getAttribute(eventName)] && _this.$methods[ele.getAttribute(eventName)](date);
            };
        };
        MaterialPicker.prototype.addInputData = function (inputEle) {
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
        MaterialPicker.prototype.methods = function (name, fn) {
            this.$methods[name] = fn;
        };
        return MaterialPicker;
    }());
    return timePicker;
})(window);

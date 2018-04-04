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
var _a = (function (window) {
    var MobileGesture = (function () {
        function MobileGesture() {
        }
        MobileGesture.prototype.addEvent = function (ele, event, fn) {
            if (event === 'tap') {
                this.tap(ele, fn);
            }
            if (event === 'swipeleft') {
                this.swipe(ele, 0, fn);
            }
            if (event === 'swiperight') {
                this.swipe(ele, 1, fn);
            }
        };
        MobileGesture.prototype.tap = function (ele, fn) {
            var startX = 0, startY = 0, x = 0, y = 0, touchstartFlag = false;
            ele.addEventListener('touchstart', function (e) {
                startX = e['touches'][0].pageX;
                startY = e['touches'][0].pageY;
                touchstartFlag = true;
            }, false);
            ele.addEventListener('touchmove', function (e) {
                if (touchstartFlag) {
                    x = e['touches'][0].pageX;
                    y = e['touches'][0].pageY;
                }
            }, false);
            ele.addEventListener('touchend', function (e) {
                e.stopPropagation();
                if (touchstartFlag && x === 0 && y === 0) {
                    fn(e.target, startX, startY);
                }
                touchstartFlag = false;
                x = 0;
                y = 0;
            }, false);
        };
        MobileGesture.prototype.swipe = function (ele, dir, fn) {
            var startX = 0, startY = 0, x = 0, y = 0, endX = 0, endY = 0, touchstartFlag = false, minValue = 20;
            ele.addEventListener('touchstart', function (e) {
                startX = e['touches'][0].pageX;
                startY = e['touches'][0].pageY;
                x = startX;
                y = startY;
                touchstartFlag = true;
            }, false);
            ele.addEventListener('touchmove', function (e) {
                if (touchstartFlag) {
                    x = e['touches'][0].pageX;
                    y = e['touches'][0].pageY;
                }
            }, false);
            ele.addEventListener('touchend', function (e) {
                e.stopPropagation();
                endX = Math.abs(startX - (startX - x));
                endY = Math.abs(startY - y);
                if (touchstartFlag && endX > endY) {
                    if (dir === 0 && startX - x > minValue) {
                        fn(e.target, startX, startY);
                    }
                    if (dir === 1 && x - startX > minValue) {
                        fn(e.target, startX, startY);
                    }
                }
                touchstartFlag = false;
                startX = 0;
                startY = 0;
                x = 0;
                y = 0;
            }, false);
        };
        return MobileGesture;
    }());
    var MaterialPicker = (function () {
        function MaterialPicker(directive, conf) {
            var _this = this;
            this.inputList = [];
            this.curInputData = null;
            this.wrapper = null;
            this.nowBtn = null;
            this.closeBtn = null;
            this.comfirmBtn = null;
            this.$dateInstance = null;
            this.$methods = {};
            this.comfirmFn = null;
            this.mobileGesture = new MobileGesture();
            this.$dateInstance = new Date();
            this.$conf = {
                color: '#f06292',
                layout: 'portrait',
                format: '24hr',
                simplify: false,
                directive: directive
            };
            this.$conf = conf ? Object['assign'](this.$conf, conf) : this.$conf;
            this.inputList = Array.prototype.slice.call(document.querySelectorAll("input[type=\"" + this.$conf['directive'] + "\"]"));
            this.curInputData = this.setInputData();
            this.inputList.map(function (ele) {
                _this.inputEleBind(ele);
            });
        }
        MaterialPicker.prototype.inputEleBind = function (ele) {
            var _this = this;
            this.addEvent(ele, 'focus', function (t) {
                _this.curInputData = _this.setInputData(t);
                _this.show({
                    color: _this.curInputData.color,
                    layout: _this.curInputData.layout,
                    simplify: _this.curInputData.simplify,
                    format: _this.curInputData.format
                });
                t.blur();
            });
        };
        MaterialPicker.prototype.string2Boolean = function (str) {
            if (typeof str === 'string') {
                return str === 'true' ? true : false;
            }
            else
                return str;
        };
        MaterialPicker.prototype.init = function () { };
        MaterialPicker.prototype.show = function (opt) { };
        MaterialPicker.prototype.close = function () {
            var _this = this;
            this.setStyle(this.materialPickerContainer, ['transform', 'opacity'], ['translateY(-30%)', 0]);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['hidden', 0]);
            setTimeout(function () {
                _this.setStyle(_this.wrapper, ['display'], ['none']);
            }, 200);
            this.curInputData.onClose();
            this.curInputData = this.setInputData();
        };
        MaterialPicker.prototype.comfirm = function () {
            if (this.curInputData.inputEle) {
                this.curInputData.inputEle['value'] = this.curInputData.selectedValue = this.value;
                this.curInputData.inputEle.setAttribute('value', this.value);
                this.curInputData.onSelect(this.curInputData.selectedValue);
            }
            else {
                this.comfirmFn && this.comfirmFn(this.value);
            }
        };
        MaterialPicker.prototype.setTheme = function (opt) {
            var _this = this;
            if (opt) {
                this.layout = opt['layout'] || this.$conf.layout;
                this.color = opt['color'] || this.$conf.color;
                this.format = opt['format'] || this.$conf.format;
                this.simplify = (opt['simplify'] !== null && opt['simplify'] !== undefined) ? opt['simplify'] : this.$conf.simplify;
            }
            else {
                this.layout = this.$conf.layout;
                this.color = this.$conf.color;
                this.format = this.$conf.format;
                this.simplify = this.$conf.simplify;
            }
            this.setStyle(this.pickerInfoContainer, ['background'], [this.color]);
            this.setStyle(this.closeBtn, ['color'], [this.color]);
            this.setStyle(this.comfirmBtn, ['color'], [this.color]);
            this.setStyle(this.nowBtn, ['color'], [this.color]);
            this.setStyle(this.materialPickerContainer, ['flexDirection'], [this.layout === 'portrait' ? 'column' : 'row']);
            this.setStyle(this.wrapper, ['display'], ['block']);
            setTimeout(function () {
                _this.setStyle(_this.materialPickerContainer, ['transform', 'opacity'], ['translateY(0)', '1']);
                _this.setStyle(_this.wrapper, ['visibility', 'opacity'], ['visible', 1]);
            }, 0);
        };
        MaterialPicker.prototype.addEvent = function (ele, event, fn) {
            var target = null, x = 0, y = 0;
            if (event === 'click') {
                this.mobileGesture.addEvent(ele, 'tap', fn);
            }
            if (event === 'mousedown') {
                this.addEvent(ele, 'touchstart', fn);
            }
            if (event === 'mousemove') {
                this.addEvent(ele, 'touchmove', fn);
            }
            if (event === 'mouseup') {
                this.addEvent(ele, 'touchend', fn);
            }
            if (event === 'swipeleft') {
                this.mobileGesture.swipe(ele, 0, fn);
                return;
            }
            if (event === 'swiperight') {
                this.mobileGesture.swipe(ele, 1, fn);
                return;
            }
            ele.addEventListener(event, function (e) {
                e = e || window.event;
                target = e.target || e.srcElement;
                e.stopPropagation();
                e.preventDefault();
                if (event === 'touchstart' || event === 'touchmove') {
                    x = e['touches'][0].pageX;
                    y = e['touches'][0].pageY;
                }
                else {
                    x = e['clientX'];
                    y = e['clientY'];
                }
                fn(target, x, y);
            });
        };
        MaterialPicker.prototype.getElement = function (tag, ele) {
            return document.querySelector(tag + "[data-ele=\"" + ele + "\"]");
        };
        MaterialPicker.prototype.setStyle = function (ele, styleList, valueList) {
            styleList.map(function (style, i) { return ele['style'][style] = valueList[i]; });
        };
        MaterialPicker.prototype.getMethod = function (ele, eventName, eventName2) {
            var _this = this;
            return function (date) {
                _this.$methods[ele.getAttribute(eventName)] && _this.$methods[ele.getAttribute(eventName)](date);
                _this.$methods[ele.getAttribute(eventName2)] && _this.$methods[ele.getAttribute(eventName2)](date);
            };
        };
        MaterialPicker.prototype.setInputData = function (node) {
            return node ? {
                inputEle: node,
                selectedValue: node['value'] || '',
                color: node.getAttribute('color') || this.$conf.color,
                layout: node.getAttribute('layout') || this.$conf.layout,
                format: node.getAttribute('format') || this.$conf.format,
                simplify: this.string2Boolean(node.getAttribute('simplify') || this.$conf.simplify),
                onSelect: this.getMethod(node, 'onComfirm', 'data-oncomfirm'),
                onShow: this.getMethod(node, 'onShow', 'data-onshow'),
                onClose: this.getMethod(node, 'onClose', 'data-onclose')
            } : {
                inputEle: null,
                selectedValue: '',
                color: this.$conf.color,
                layout: this.$conf.layout,
                format: this.$conf.format,
                simplify: this.$conf.simplify,
                onSelect: function () { },
                onShow: function () { },
                onClose: function () { }
            };
        };
        MaterialPicker.prototype.addElement = function (ele) {
            var _this = this;
            if (ele['length']) {
                [].slice.call(ele).map(function (e) {
                    _this.inputList.push(e);
                    _this.inputEleBind(e);
                });
            }
            else {
                this.inputList.push(ele);
                this.inputEleBind(ele);
            }
        };
        MaterialPicker.prototype.methods = function (name, fn) {
            this.$methods[name] = fn;
        };
        return MaterialPicker;
    }());
    var DatePicker = (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(conf) {
            var _this = _super.call(this, 'date-picker', conf) || this;
            _this.yearCon_s = null;
            _this.monthCon_s = null;
            _this.dateCon_s = null;
            _this.yearCon_n = null;
            _this.monthCon_n = null;
            _this.dateCon_n = null;
            _this.monthDateCon_s = null;
            _this.monthDateCon_n = null;
            _this.monthYearBody = null;
            _this.calendarBody = null;
            _this.yearListCon = null;
            _this.weekdayCon = null;
            _this.simplifyCon = null;
            _this.normalCon = null;
            _this.todayEle = null;
            _this.curSelectDateEle = null;
            _this.lastSelectDateEle = null;
            _this.curSelectYear = null;
            _this.lastSelectYear = null;
            _this.pmBtn = null;
            _this.nmBtn = null;
            _this.allowAnimation = true;
            _this.curYear = _this.$dateInstance.getFullYear();
            _this.curMonth = _this.$dateInstance.getMonth() + 1;
            _this.curDate = _this.$dateInstance.getDate();
            _this.curWeekday = _this.$dateInstance.getDay();
            _this.ZNlist = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
            _this.init();
            return _this;
        }
        DatePicker.prototype.setDate = function () {
            this.year = this.tempYear;
            this.month = this.tempMonth;
            this.weekday = this.date2weekday(this.year, this.month, this.date);
            this.value = this.year + "-" + this.month + "-" + this.date;
            this.yearCon_s.innerHTML = this.yearCon_n.innerHTML = this.year.toString();
            this.monthCon_n.innerHTML = this.number2ZN(this.month) + '月';
            this.monthCon_s.innerHTML = this.month + '月';
            this.dateCon_s.innerHTML = this.dateCon_n.innerHTML = this.date.toString();
            this.weekdayCon.innerHTML = '周' + this.number2ZN(this.weekday);
        };
        DatePicker.prototype.isLeap = function (year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        };
        DatePicker.prototype.monthDaysCount = function (month, year) {
            var bigMonth = [1, 3, 5, 7, 8, 10, 12];
            if (month === 2) {
                return this.isLeap(year) ? 29 : 28;
            }
            else {
                return bigMonth.indexOf(month) > -1 ? 31 : 30;
            }
        };
        DatePicker.prototype.parseDate = function (date) {
            return date ?
                [parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2])] :
                [this.curYear, this.curMonth, this.curDate];
        };
        DatePicker.prototype.number2ZN = function (n) {
            return this.ZNlist[n];
        };
        DatePicker.prototype.date2weekday = function (year, month, date) {
            return new Date(year, month - 1, date).getDay();
        };
        DatePicker.prototype.setCurDate = function () {
            this.$dateInstance = new Date();
            this.curYear = this.$dateInstance.getFullYear();
            this.curMonth = this.$dateInstance.getMonth() + 1;
            this.curDate = this.$dateInstance.getDate();
            this.curWeekday = this.$dateInstance.getDay();
            this.year = this.parseDate(this.curInputData.selectedValue)[0];
            this.month = this.parseDate(this.curInputData.selectedValue)[1];
            this.date = this.parseDate(this.curInputData.selectedValue)[2];
            this.weekday = this.date2weekday(this.year, this.month, this.date);
        };
        DatePicker.prototype.createAnimationContext = function () {
            var styleNode = document.createElement('style'), animationContext = "\n              @keyframes datepicker-animation-right-1 {\n                  from {\n                      transform: translateX(0);\n                      opacity: 1;\n                  }\n                  to {\n                      transform: translateX(-100%);\n                      opacity: 0;\n                  }\n              }\n          \n              @keyframes datepicker-animation-right-2 {\n                  from {\n                      transform: translateX(100%);\n                      opacity: 0;\n                  }\n                  to {\n                      transform: translateX(0);\n                      opacity: 1;\n                  }\n              }\n          \n              @keyframes datepicker-animation-left-1 {\n                  from {\n                      transform: translateX(0);\n                      opacity: 1;\n                  }\n                  to {\n                      transform: translateX(100%);\n                      opacity: 0;\n                  }\n              }\n          \n              @keyframes datepicker-animation-left-2 {\n                  from {\n                      transform: translateX(-100%);\n                      opacity: 0;\n                  }\n                  to {\n                      transform: translateX(0);\n                      opacity: 1\n                  }\n              }";
            styleNode.innerHTML = animationContext.replace(/[\r\n]/g, "");
            return styleNode;
        };
        DatePicker.prototype.createYearList = function (year) {
            var ul = document.createElement('ul');
            this.setStyle(ul, ['width', 'list-style', 'padding', 'margin'], ['100%', 'none', 0, 0]);
            for (var i = this.curYear - 50; i < this.curYear + 50; i++) {
                var li = document.createElement('li');
                this.setStyle(li, ['text-align', 'padding', 'color', 'cursor', 'font-size', 'transition'], ['center', '6px 0 6px 0', '#666', 'pointer', '20px', 'all 0.25s ease']);
                li.setAttribute("data-ele", "data-year-item-" + i);
                li.innerHTML = i.toString();
                if (i === year) {
                    this.toggleYearFocus(li);
                }
                ul.appendChild(li);
            }
            return ul;
        };
        DatePicker.prototype.createMonthYearItem = function (month, year, dir) {
            var translateX = '', monthYearItem = document.createElement('div');
            if (dir !== undefined) {
                translateX = dir === 0 ? '-100%' : '100%';
            }
            else {
                translateX = '0';
            }
            monthYearItem.setAttribute('data-ele', "month-year-item-" + year + "-" + month);
            monthYearItem.style.cssText = "position: absolute; left: 0; top: 0; transform: translateX(" + translateX + "); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;";
            monthYearItem.innerHTML = month + "\u6708\uFF0C" + year;
            return monthYearItem;
        };
        DatePicker.prototype.createCalendarItem = function (month, year, dir) {
            var startDay = this.date2weekday(year, month, 1), endDay = this.monthDaysCount(month, year), translateX = '', style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;-webkit-user-select:none;-moz-user-select:none;user-select: none;-ms-user-select: none;-webkit-tap-highlight-color:transparent;', day = 0, row = Math.ceil((startDay + endDay) / 7), calendarItem = document.createElement('div');
            if (dir !== undefined) {
                translateX = dir === 0 ? '-100%' : '100%';
            }
            else {
                translateX = '0';
            }
            calendarItem.setAttribute('data-ele', "calendar-item-" + year + "-" + month);
            this.setStyle(calendarItem, ['position', 'left', 'top', 'transform'], ['absolute', 0, 0, "translateX(" + translateX + ")"]);
            for (var j = 0; j < row; j++) {
                var div = document.createElement('div');
                this.setStyle(div, ['display'], ['flex']);
                for (var i = 0; i < 7; i++) {
                    var span = document.createElement('span');
                    span.style.cssText = style;
                    if ((startDay > i && j === 0) || day >= endDay) {
                        span.setAttribute('data-ele', 'date-item');
                    }
                    else {
                        day++;
                        span.setAttribute('data-ele', "date-item-" + day);
                        span.innerHTML = day.toString();
                        if (day === this.date && year === this.year && month === this.month) {
                            this.toggleFocus(span);
                        }
                        if (day === this.curDate && year === this.curYear && month === this.curMonth) {
                            !span.getAttribute('data-select') && this.setStyle(span, ['color'], [this.color]);
                            span.setAttribute('data-today', 'true');
                            this.todayEle = span;
                        }
                    }
                    div.appendChild(span);
                }
                calendarItem.appendChild(div);
            }
            return calendarItem;
        };
        DatePicker.prototype.createContainer = function () {
            var div = document.createElement('div'), template = "\n                <div data-ele=\"wrapper-d\" style=\"box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; visibility: hidden; opacity: 0; transition: all 0.2s ease;display: none;\">\n                    <div style=\"display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background: rgba(0, 0, 0, 0.5);\">\n                        <div data-ele=\"material-picker-container-d\" style=\"-webkit-tap-highlight-color: rgba(0,0,0,0);display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease; transform: translateY(-30%); opacity: 0;\">\n                            \n                            <div data-ele=\"picker-info-container-d\">\n\n                                <div data-ele=\"simplify-container\" style=\"color: #fff;box-sizing: border-box;padding: 24px;\">\n                                    <div style=\"width: 150px; height: 70px;\">\n                                        <div data-ele=\"year-s\" style=\"color: rgba(255, 255, 255, 0.7);cursor: pointer; transition: all 0.2s ease;\"></div>\n                                        <div data-ele=\"month-date-s\" style=\"font-size: 40px; margin-top: 10px;\">\n                                            <span data-ele=\"month-s\"></span><span data-ele=\"date-s\"></span>\u53F7\n                                        </div>\n                                    </div>\n                                </div>\n\n                                <div data-ele=\"normal-container\" style=\"color: #fff;box-sizing: border-box;align-items: stretch; display: flex; flex-direction: column; justify-content: space-between; position: relative; align-items: stretch;\">\n                                    <div data-ele=\"weekday\" style=\"padding: 10px 0 10px 0; background: rgba(0, 0, 0, 0.2); text-align: center; color: rgba(255, 255, 255, 0.8);\"></div>\n                                    <div style=\"padding:20px; width: 140px; align-self: center; flex-grow: 1; display:flex; flex-direction: column;box-sizing: content-box;\">\n                                        <div data-ele=\"month-date-n\">\n                                            <div data-ele=\"month-n\" style=\"text-align: center;font-size: 24px; transition: all 0.2s ease;\"></div>\n                                            <div data-ele=\"date-n\" style=\"color: #fff;font-size: 76px; font-weight: 900;transition: all 0.2s ease;text-align: center; padding: 0 0 12px 0;\"></div>\n                                        </div>\n                                        <div data-ele=\"year-n\" style=\"color: rgba(255, 255, 255, 0.7);cursor: pointer; transition: all 0.2s ease;text-align: center;\"></div>\n                                    </div>\n                                </div>\n                                \n                            </div>\n                \n                            <div data-ele=\"picker-body-container-d\" style=\"display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background: #fff;align-items: stretch; position: relative;\">\n                                <div style=\"display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);\">\n                                    \n                                    <button data-ele=\"btn-pm\" style=\"-webkit-tap-highlight-color:transparent;outline: none;border: none;cursor: pointer; background: transparent;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; -ms-user-select: none;user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"></path>\n                                        </svg>\n                                    </button>\n\n                                    <div data-ele=\"month-year-body\" style=\"overflow: hidden; position: relative; width: 140px; height: 28px;\"></div>\n\n                                    <button data-ele=\"btn-nm\" style=\"-webkit-tap-highlight-color:transparent;outline: none;border: none;cursor: pointer;background: transparent;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px;-ms-user-select: none; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"></path>\n                                        </svg>\n                                    </button>\n\n                                </div>\n                \n                                <div>\n                                    <div style=\"display: flex;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5); text-align: center;\">\n                                        <div style=\"width: 40px;\">\u65E5</div>\n                                        <div style=\"width: 40px;\">\u4E00</div>\n                                        <div style=\"width: 40px;\">\u4E8C</div>\n                                        <div style=\"width: 40px;\">\u4E09</div>\n                                        <div style=\"width: 40px;\">\u56DB</div>\n                                        <div style=\"width: 40px;\">\u4E94</div>\n                                        <div style=\"width: 40px;\">\u516D</div>\n                                    </div>\n                \n                                    <div data-ele=\"calendar-body\" style=\"overflow: hidden;position: relative; width: 280px; height: 240px;\"></div>\n                                </div>\n                \n                                <div style=\"display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;\">\n                                    <button data-ele=\"btn-now-d\" style=\"-webkit-tap-highlight-color:transparent;background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u4ECA\u5929</button>\n                                    <div style=\"display: flex; width: 40%; justify-content: space-between; align-items: center;\">\n                                        <button data-ele=\"btn-close-d\" style=\"-webkit-tap-highlight-color:transparent;background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u5173\u95ED</button>\n                                        <button data-ele=\"btn-comfirm-d\" style=\"-webkit-tap-highlight-color:transparent;background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u786E\u5B9A</button>\n                                    </div>\n                                </div>\n\n                                <div data-ele=\"year-list-con\" style=\"position: absolute; width: 100%; height: 100%; visibility: hidden; background: #fff; transition: all 0.15s ease; left: 0; top: 0; overflow: auto;-webkit-overflow-scrolling: touch;\">\n\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n                ";
            div.innerHTML = template;
            return div.children[0];
        };
        DatePicker.prototype.select = function () {
            var _this = this;
            this.addEvent(this.materialPickerContainer, 'click', function (target) {
                if (_this.isUnselectDateEle(target)) {
                    _this.toggleFocus(target);
                    _this.setDate();
                }
            });
        };
        DatePicker.prototype.hover = function () {
            var _this = this;
            this.addEvent(this.materialPickerContainer, 'mouseover', function (target) {
                if (_this.isUnselectDateEle(target)) {
                    _this.setStyle(target, ['background', 'opacity', 'color'], [_this.color, 0.65, '#fff']);
                }
            });
            this.addEvent(this.materialPickerContainer, 'mouseout', function (target) {
                if (_this.isUnselectDateEle(target)) {
                    _this.setStyle(target, ['background', 'opacity', 'color'], ['#fff', 1, target['getAttribute']('data-today') ? _this.color : '#000']);
                }
            });
        };
        DatePicker.prototype.selectYear = function () {
            var _this = this;
            this.addEvent(this.yearListCon, 'click', function (target) {
                if (target['getAttribute']('data-ele').indexOf('data-year-item') > -1) {
                    _this.toggleYearFocus(target);
                    _this.renderPanel();
                    _this.setDate();
                    _this.yearListClose();
                }
            });
        };
        DatePicker.prototype.isUnselectDateEle = function (ele) {
            return ele['getAttribute']('data-ele') && ele['getAttribute']('data-ele').indexOf('date-item') > -1 && ele['innerHTML'] !== '' && !ele['getAttribute']('data-select');
        };
        DatePicker.prototype.toggleFocus = function (ele) {
            this.curSelectDateEle = ele;
            if (this.lastSelectDateEle) {
                this.setStyle(this.lastSelectDateEle, ['background', 'opacity', 'color'], ['#fff', 1, this.lastSelectDateEle['getAttribute']('data-today') ? this.color : '#000']);
                this.lastSelectDateEle['removeAttribute']('data-select');
            }
            this.curSelectDateEle['setAttribute']('data-select', true);
            this.setStyle(this.curSelectDateEle, ['background', 'opacity', 'color'], [this.color, 1, '#fff']);
            this.lastSelectDateEle = this.curSelectDateEle;
            this.date = parseInt(ele['innerHTML']);
        };
        DatePicker.prototype.toggleYearFocus = function (ele) {
            this.curSelectYear = ele;
            if (this.lastSelectYear) {
                this.setStyle(this.lastSelectYear, ['color', 'font-size'], ['#666', '20px']);
            }
            this.setStyle(this.curSelectYear, ['color', 'font-size'], [this.color, '28px']);
            this.lastSelectYear = this.curSelectYear;
            this.year = parseInt(ele['innerHTML']);
        };
        DatePicker.prototype.renderPanel = function () {
            this.tempMonth = this.month;
            this.tempYear = this.year;
            this.monthYearBody.innerHTML = '';
            this.calendarBody.innerHTML = '';
            this.monthYearBody.appendChild(this.createMonthYearItem(this.month, this.year));
            this.calendarBody.appendChild(this.createCalendarItem(this.month, this.year));
            if (this.simplify) {
                this.setStyle(this.simplifyCon, ['display'], ['flex']);
                this.setStyle(this.normalCon, ['display'], ['none']);
            }
            else {
                this.setStyle(this.simplifyCon, ['display'], ['none']);
                this.setStyle(this.normalCon, ['display'], ['flex']);
            }
        };
        DatePicker.prototype.slideMonths = function (dir) {
            var _this = this;
            if (!this.allowAnimation)
                return;
            this.allowAnimation = false;
            var animationInfo = '450ms cubic-bezier(0.23, 1, 0.32, 1) forwards';
            if (dir) {
                if (this.tempMonth < 12) {
                    this.tempMonth++;
                }
                else {
                    this.tempMonth = 1;
                    this.tempYear++;
                }
            }
            else {
                if (this.tempMonth > 1) {
                    this.tempMonth--;
                }
                else {
                    this.tempMonth = 12;
                    this.tempYear--;
                }
            }
            this.monthYearBody.appendChild(this.createMonthYearItem(this.tempMonth, this.tempYear, dir));
            this.calendarBody.appendChild(this.createCalendarItem(this.tempMonth, this.tempYear, dir));
            if (dir) {
                this.setStyle(this.monthYearBody.children[0], ['animation'], ["datepicker-animation-right-1 " + animationInfo]);
                this.setStyle(this.monthYearBody.children[1], ['animation'], ["datepicker-animation-right-2 " + animationInfo]);
                this.setStyle(this.calendarBody.children[0], ['animation'], ["datepicker-animation-right-1 " + animationInfo]);
                this.setStyle(this.calendarBody.children[1], ['animation'], ["datepicker-animation-right-2 " + animationInfo]);
            }
            else {
                this.setStyle(this.monthYearBody.children[0], ['animation'], ["datepicker-animation-left-1 " + animationInfo]);
                this.setStyle(this.monthYearBody.children[1], ['animation'], ["datepicker-animation-left-2 " + animationInfo]);
                this.setStyle(this.calendarBody.children[0], ['animation'], ["datepicker-animation-left-1 " + animationInfo]);
                this.setStyle(this.calendarBody.children[1], ['animation'], ["datepicker-animation-left-2 " + animationInfo]);
            }
            this.addEvent(this.monthYearBody.firstChild, 'animationend', function (t) {
                _this.monthYearBody.removeChild(_this.monthYearBody.children[0]);
                _this.calendarBody.removeChild(_this.calendarBody.children[0]);
                _this.allowAnimation = true;
            });
        };
        DatePicker.prototype.toToday = function () {
            var dir;
            if (this.tempYear < this.curYear) {
                this.tempYear = this.curYear;
                this.tempMonth = this.curMonth - 1;
                dir = 1;
            }
            else if (this.tempYear > this.curYear) {
                this.tempYear = this.curYear;
                this.tempMonth = this.curMonth + 1;
                dir = 0;
            }
            else {
                if (this.tempMonth < this.curMonth) {
                    this.tempMonth = this.curMonth - 1;
                    dir = 1;
                }
                else if (this.tempMonth > this.curMonth) {
                    this.tempMonth = this.curMonth + 1;
                    dir = 0;
                }
                else {
                    dir = undefined;
                    this.toggleFocus(this.todayEle);
                }
            }
            this.year = this.curYear;
            this.month = this.curMonth;
            this.date = this.curDate;
            if (dir !== undefined) {
                dir === 0 ? this.pmBtn['click']() : this.nmBtn['click']();
            }
            this.setDate();
        };
        DatePicker.prototype.yearListClose = function () {
            if (this.simplify) {
                this.setStyle(this.yearCon_s, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
                this.setStyle(this.monthDateCon_s, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '40px', 'auto']);
            }
            else {
                this.setStyle(this.yearCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
                this.setStyle(this.monthCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '24px', 'auto']);
                this.setStyle(this.dateCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '76px', 'auto']);
            }
            this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['hidden', 0]);
        };
        DatePicker.prototype.yearListShow = function () {
            var toYearEle = this.getElement('li', "data-year-item-" + this.year);
            this.yearListCon.scrollTop = toYearEle['offsetTop'] - this.yearListCon['offsetHeight'] / 2 + 20;
            this.toggleYearFocus(toYearEle);
            if (this.simplify) {
                this.setStyle(this.yearCon_s, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '36px', 'auto']);
                this.setStyle(this.monthDateCon_s, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
            }
            else {
                this.setStyle(this.yearCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '36px', 'auto']);
                this.setStyle(this.monthCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
                this.setStyle(this.dateCon_n, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '36px', 'pointer']);
            }
            this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['visible', 1]);
        };
        DatePicker.prototype.init = function () {
            var _this = this;
            document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
            document.querySelector('head').appendChild(this.createAnimationContext());
            this.wrapper = this.getElement('div', 'wrapper-d'),
                this.materialPickerContainer = this.getElement('div', 'material-picker-container-d');
            this.pickerInfoContainer = this.getElement('div', 'picker-info-container-d');
            this.simplifyCon = this.getElement('div', 'simplify-container');
            this.normalCon = this.getElement('div', 'normal-container');
            this.yearCon_s = this.getElement('div', 'year-s');
            this.monthCon_s = this.getElement('span', 'month-s');
            this.dateCon_s = this.getElement('span', 'date-s');
            this.monthDateCon_s = this.getElement('div', 'month-date-s');
            this.yearCon_n = this.getElement('div', 'year-n');
            this.monthCon_n = this.getElement('div', 'month-n');
            this.dateCon_n = this.getElement('div', 'date-n');
            this.monthDateCon_n = this.getElement('div', 'month-date-n');
            this.monthYearBody = this.getElement('div', 'month-year-body');
            this.weekdayCon = this.getElement('div', 'weekday');
            this.calendarBody = this.getElement('div', 'calendar-body');
            this.yearListCon = this.getElement('div', 'year-list-con');
            this.closeBtn = this.getElement('button', 'btn-close-d');
            this.comfirmBtn = this.getElement('button', 'btn-comfirm-d');
            this.nowBtn = this.getElement('button', 'btn-now-d');
            this.pmBtn = this.getElement('button', 'btn-pm');
            this.nmBtn = this.getElement('button', 'btn-nm');
            this.yearListCon.appendChild(this.createYearList(this.year));
            this.addEvent(this.wrapper, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.closeBtn, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.comfirmBtn, 'click', function (t) {
                _this.comfirm();
                _this.close();
            });
            this.addEvent(this.nowBtn, 'click', function (t) {
                _this.toToday();
            });
            this.addEvent(this.nmBtn, 'click', function (t) {
                _this.slideMonths(1);
            });
            this.addEvent(this.pmBtn, 'click', function (t) {
                _this.slideMonths(0);
            });
            this.addEvent(this.calendarBody, 'swipeleft', function (t) {
                _this.nmBtn['click']();
            });
            this.addEvent(this.calendarBody, 'swiperight', function (t) {
                _this.pmBtn['click']();
            });
            this.addEvent(this.yearCon_s, 'click', function (target) {
                _this.yearListShow();
            });
            this.addEvent(this.yearCon_n, 'click', function (target) {
                _this.yearListShow();
            });
            this.addEvent(this.monthDateCon_s, 'click', function (target) {
                _this.yearListClose();
            });
            this.addEvent(this.monthDateCon_n, 'click', function (target) {
                _this.yearListClose();
            });
            this.hover();
            this.select();
            this.selectYear();
        };
        DatePicker.prototype.show = function (opt) {
            this.comfirmFn = opt ? opt['comfirm'] : null;
            this.setTheme(opt);
            this.setCurDate();
            this.renderPanel();
            this.setDate();
            this.curInputData.onShow();
        };
        return DatePicker;
    }(MaterialPicker));
    ;
    var TimePicker = (function (_super) {
        __extends(TimePicker, _super);
        function TimePicker(conf) {
            var _this = _super.call(this, 'time-picker', conf) || this;
            _this.hourCon = null;
            _this.minuteCon = null;
            _this.meridiemCon = null;
            _this.amCon = null;
            _this.pmCon = null;
            _this.hourClock = {
                clock: null,
                clock24: null,
                clockPointer: null,
                clockPointerPeak: null,
                clockPointerCenter: null,
                type: 'hour',
                itemList: {},
                interval: 360 / 12,
                viewEle: null,
                curEle: null,
                curSelectClockItem: null,
                lastSelectClockItem: null
            };
            _this.minuteClock = {
                clock: null,
                clockPointer: null,
                clockPointerPeak: null,
                clockPointerCenter: null,
                type: 'minute',
                itemList: {},
                interval: 360 / 60,
                viewEle: null,
                curEle: null,
                curSelectClockItem: null,
                lastSelectClockItem: null
            };
            _this.curHour = _this.$dateInstance.getHours();
            _this.curMinute = _this.$dateInstance.getMinutes();
            _this.curMeridiem = _this.curHour > 12 ? 'pm' : 'am';
            _this.centerX = 260 / 2;
            _this.centerY = 260 / 2;
            _this.curClockItem = _this.lastClockItem = null;
            _this.curMeridiemEle = _this.lastMeridiemEle = null;
            _this.init();
            return _this;
        }
        TimePicker.prototype.createMeridiemCon = function () {
            var div = document.createElement('div'), template = "\n                <div style=\"font-size: 22px; margin-left: 12px;\">\n                    <div data-ele=\"am\" style=\"-webkit-tap-highlight-color:transparent;margin-bottom: 4px; cursor: pointer;color: rgba(255, 255, 255, 0.6);\">AM</div>\n                    <div data-ele=\"pm\" style=\"-webkit-tap-highlight-color:transparent;cursor: pointer;color: rgba(255, 255, 255, 0.6);\">PM</div>\n                </div>\n              ";
            div.innerHTML = template;
            return div.children[0];
        };
        TimePicker.prototype.createPointer = function (clock) {
            var pointer = document.createElement('div'), center = document.createElement('div'), peak = document.createElement('div');
            this.setStyle(pointer, ['position', 'width', 'height', 'top', 'left', 'transform-origin'], ['absolute', '4px', '42%', '8%', 'calc(50% - 2px)', 'center bottom']);
            this.setStyle(center, ['position', 'width', 'height', 'top', 'left', 'border-radius'], ['absolute', '8px', '8px', 'calc(100% - 4px)', '-2px', '50%']);
            this.setStyle(peak, ['position', 'width', 'height', 'background', 'top', 'left', 'border-radius', 'box-sizing'], ['absolute', '16px', '16px', '#FFF', '-8px', '-6px', '50%', 'border-box']);
            clock.clockPointer = pointer;
            clock.clockPointerCenter = center;
            clock.clockPointerPeak = peak;
            pointer.appendChild(center);
            pointer.appendChild(peak);
            return pointer;
        };
        TimePicker.prototype.createClock = function (radius, start, end, step) {
            var div = document.createElement('div'), curAngle = 0, angle = 2 * Math.PI / 12, r = radius / 2 - 20;
            this.setStyle(div, ['position', 'width', 'height', 'border-radius', 'background', 'top', 'left'], ['absolute', '100%', '100%', '50%', '#eee', 0, 0]);
            for (var i = 12, j = end; i > 0 && j > start; i--, j -= step) {
                var clockItem = document.createElement('div'), x = 0, y = 0;
                curAngle = angle * i;
                x = Math.floor(r * Math.sin(curAngle));
                y = Math.floor(-1 * r * Math.cos(curAngle));
                this.setStyle(clockItem, ['position', 'width', 'height', 'text-align', 'line-height', 'color', 'transform-origin', 'left', 'top', 'font-size', 'border-radius', 'z-index', 'user-select', '-ms-user-select'], ['absolute', '30px', '30px', 'center', '30px', '#666', '50% 50%', 'calc(50% - 15px)', 'calc(50% - 15px)', '16px', '50%', 10, 'none', 'none']);
                this.setStyle(clockItem, ['transform'], ["translate(" + x + "px, " + y + "px)"]);
                end !== 60 ?
                    clockItem.setAttribute('data-ele', "hourclock-item-" + (j === 60 ? 0 : j)) :
                    clockItem.setAttribute('data-ele', "minuteclock-item-" + (j === 60 ? 0 : j));
                clockItem.innerHTML = j === 60 ? '00' : j.toString();
                div.appendChild(clockItem);
            }
            return div;
        };
        TimePicker.prototype.createContainer = function () {
            var div = document.createElement('div'), template = "\n              <div data-ele=\"wrapper-t\" style=\"display: none;visibility: hidden; opacity: 0; box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; transition: all 0.2s ease;\">\n                <div style=\"display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background: rgba(0, 0, 0, 0.5);\">\n                    <div data-ele=\"material-picker-container-t\" style=\"-webkit-tap-highlight-color: rgba(0,0,0,0);transform: translateY(-30%); opacity: 0;display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease;\">\n                        <div data-ele=\"picker-info-container-t\" style=\"padding: 20px; color: #fff;box-sizing: border-box;align-items: stretch; display: flex; justify-content: center; align-items: center;\">\n                            <div style=\"display: flex;font-size: 56px;width: 150px; justify-content: center;\">\n                                <div data-ele=\"hour\" style=\"cursor: pointer;\"></div>\n                                <div style=\"color: rgba(255, 255, 255, 0.6);\">:</div>\n                                <div data-ele=\"minute\" style=\"cursor: pointer;\"></div>\n                            </div>\n                            <div data-ele=\"meridiem-con\"></div>\n                        </div>\n\n                        <div data-ele=\"picker-body-container-t\" style=\"padding: 0 8px 0 8px;position: relative; display: flex;flex-direction: column;justify-content: space-between;box-sizing: border-box;background: #fff;align-items: center;\">\n                            \n                            <div data-ele=\"clock-container\" style=\"padding: 20px 0 20px 0;\">\n                                <div>\n                                    <div data-ele=\"hour-clock\" style=\"width: 274px; height: 274px; display: flex; justify-content: center; align-items: center;position: relative;visibility: hidden; opacity: 0;transition: all 0.2s ease;\">\n                                        <div data-ele=\"hour-clock-24\" style=\"width: 184px; height: 184px;position: absolute;top:45px; left:45px;\"></div>\n                                    </div>\n\n                                    <div data-ele=\"minute-clock\" style=\"width: 274px; height: 274px; top: 20px; left: 11px; position:absolute;visibility: hidden; opacity: 0;transition: all 0.2s ease;\"></div>\n                                </div>\n                            </div>\n\n                            <div style=\"width: 280px;display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;\">\n                                <button data-ele=\"btn-now-t\" style=\"background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u73B0\u5728</button>\n                                <div style=\"display: flex; width: 40%; justify-content: space-between; align-items: center;\">\n                                    <button data-ele=\"btn-close-t\" style=\"-webkit-tap-highlight-color:transparent;background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u5173\u95ED</button>\n                                    <button data-ele=\"btn-comfirm-t\" style=\"-webkit-tap-highlight-color:transparent;;background: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u786E\u5B9A</button>\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n            </div>\n              ";
            div.innerHTML = template;
            return div.children[0];
        };
        TimePicker.prototype.getClockItemList = function () {
            for (var i = 0; i < 24; i++) {
                this.hourClock.itemList[i * this.hourClock.interval] = this.getElement('div', "hourclock-item-" + this.angle2Time(this.hourClock, i * this.hourClock.interval));
            }
            for (var i = 0; i < 60; i += 5) {
                this.minuteClock.itemList[i * this.minuteClock.interval] = this.getElement('div', "minuteclock-item-" + i);
            }
        };
        TimePicker.prototype.angle2Time = function (clock, angle) {
            if (clock.type === 'hour') {
                if (angle === 0)
                    return 12;
                else if (angle === 360)
                    return 24;
                else
                    return angle / clock.interval;
            }
            else {
                return angle / clock.interval;
            }
        };
        TimePicker.prototype.XY2angle = function (x, y, step) {
            var n = 0, length = 0, angle = 0;
            n = (x - this.centerX) > 0 ? 1 : -1;
            this.distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
            angle = n * 180 / Math.PI * Math.acos((this.centerY - y) / this.distance);
            angle = angle > 0 ? angle : (360 + angle);
            return Math.round(angle / step) * step === 360 ? 0 : Math.round(angle / step) * step;
        };
        TimePicker.prototype.transformXY = function (x, y) {
            return {
                x: Math.floor(x - this.hourClock.clock.getBoundingClientRect().left),
                y: Math.floor(y - this.hourClock.clock.getBoundingClientRect().top)
            };
        };
        TimePicker.prototype.parseDate = function (time) {
            var value = [];
            if (time) {
                this.format === 'ampm' && (this.meridiem = time.split(':')[1].split(' ')[1].toLowerCase());
                value = [parseInt(time.split(':')[0]), parseInt(time.split(':')[1])];
            }
            else {
                value = [this.curHour, this.curMinute];
                this.meridiem = this.curMeridiem;
            }
            return value;
        };
        TimePicker.prototype.getTime = function () {
            this.$dateInstance = new Date();
            this.curHour = this.$dateInstance.getHours();
            this.curMeridiem = this.curHour > 12 ? 'pm' : 'am';
            this.curHour = this.curHour === 0 ? 24 : this.curHour;
            this.curHour =
                this.format === '24hr' ?
                    this.curHour :
                    this.curHour > 12 ? this.curHour - 12 : this.curHour;
            this.curMinute = this.$dateInstance.getMinutes();
            this.hour = this.parseDate(this.curInputData.selectedValue)[0];
            this.minute = this.parseDate(this.curInputData.selectedValue)[1];
            if (this.format === '24hr') {
                this.distance = this.hour > 12 ? 70 : 100;
            }
        };
        TimePicker.prototype.setTime = function () {
            var min = this.minute < 10 ? '0' + this.minute : this.minute.toString();
            this.value =
                this.format === '24hr' ?
                    this.hour + ":" + min :
                    this.hour + ":" + min + " " + this.meridiem;
            this.hourCon.innerHTML = this.hour < 10 ? '0' + this.hour.toString() : this.hour.toString();
            this.minuteCon.innerHTML = min;
        };
        TimePicker.prototype.toNow = function () {
            if (this.format === '24hr') {
                this.distance = this.curHour > 12 ? 70 : 100;
            }
            else {
                this.toggleFocusMeridiem(this[this.curMeridiem + "Con"]);
            }
            this.setPointerRotate(this.hourClock, this.hourClock.interval * (this.curHour % 12));
            this.setPointerRotate(this.minuteClock, this.minuteClock.interval * this.curMinute);
            this.setTime();
        };
        TimePicker.prototype.renderPanel = function () {
            if (this.format === 'ampm') {
                this.setStyle(this.meridiemCon, ['display'], ['block']);
                this.setStyle(this.hourClock.clock24, ['display'], ['none']);
            }
            else {
                this.setStyle(this.meridiemCon, ['display'], ['none']);
                this.setStyle(this.hourClock.clock24, ['display'], ['block']);
            }
            this.format === 'ampm' && this.toggleFocusMeridiem(this[this.meridiem + "Con"]);
            this.setClockTheme(this.hourClock, this.color);
            this.setClockTheme(this.minuteClock, this.color);
            this.setPointerRotate(this.hourClock, this.hourClock.interval * (this.hour % 12));
            this.setPointerRotate(this.minuteClock, this.minuteClock.interval * this.minute);
            this.switchClock(this.hourClock, this.minuteClock);
        };
        TimePicker.prototype.setClockTheme = function (clock, color) {
            if (this.hourClock.curEle) {
                this.setStyle(this.hourClock.curEle, ['color'], ['#666']);
                this.hourClock.curEle.removeAttribute('data-now');
            }
            if (this.minuteClock.curEle) {
                this.setStyle(this.minuteClock.curEle, ['color'], ['#666']);
                this.minuteClock.curEle.removeAttribute('data-now');
            }
            this.hourClock.curEle = this.getElement('div', "hourclock-item-" + this.curHour);
            this.minuteClock.curEle = this.curMinute % 5 === 0 ? this.getElement('div', "clock-minuteitem-" + this.curMinute) : null;
            if (this.hourClock.curEle) {
                this.setStyle(this.hourClock.curEle, ['color'], [color]);
                this.hourClock.curEle.setAttribute('data-now', 'true');
            }
            if (this.minuteClock.curEle) {
                this.setStyle(this.minuteClock.curEle, ['color'], [color]);
                this.minuteClock.curEle.setAttribute('data-now', 'true');
            }
            this.setStyle(clock.clockPointer, ['background'], [color]);
            this.setStyle(clock.clockPointerCenter, ['background'], [color]);
            this.setStyle(clock.clockPointerPeak, ['border'], ["4px solid " + color]);
        };
        TimePicker.prototype.setPointerRotate = function (clock, angle) {
            if (isNaN(angle))
                return;
            if (this.format === '24hr' && clock.type === 'hour') {
                if (this.distance < 90) {
                    this.setStyle(clock.clockPointer, ['height', 'top'], ['28%', '22%']);
                    angle = angle + 360;
                }
                else {
                    this.setStyle(clock.clockPointer, ['height', 'top'], ['42%', '8%']);
                }
            }
            else {
                this.setStyle(clock.clockPointer, ['height', 'top'], ['42%', '8%']);
            }
            this.setStyle(clock.clockPointer, ['transform'], ["rotateZ(" + angle + "deg)"]);
            this.toggleFocus(clock, clock.itemList[angle]);
            this[clock.type] = this.angle2Time(clock, angle);
        };
        TimePicker.prototype.toggleFocus = function (clock, ele) {
            clock.curSelectClockItem = ele;
            if (clock.lastSelectClockItem) {
                this.setStyle(clock.lastSelectClockItem, ['background', 'color'], ['transparent', clock.lastSelectClockItem.getAttribute('data-now') ? this.color : '#666']);
                clock.lastSelectClockItem.removeAttribute('data-select');
            }
            if (clock.curSelectClockItem) {
                this.setStyle(clock.curSelectClockItem, ['background', 'color'], [this.color, '#fff']);
                clock.curSelectClockItem.setAttribute('data-select', 'true');
                clock.lastSelectClockItem = clock.curSelectClockItem;
            }
        };
        TimePicker.prototype.switchClock = function (curClock, lastClock) {
            this.setStyle(lastClock.viewEle, ['color'], ['rgba(255, 255, 255, 0.6)']);
            this.setStyle(lastClock.clock, ['visibility', 'opacity'], ['hidden', 0]);
            this.setStyle(curClock.viewEle, ['color'], ['rgba(255, 255, 255, 1)']);
            this.setStyle(curClock.clock, ['visibility', 'opacity'], ['visible', 1]);
        };
        TimePicker.prototype.toggleFocusMeridiem = function (ele) {
            this.curMeridiemEle = ele;
            if (this.lastMeridiemEle) {
                this.setStyle(this.lastMeridiemEle, ['color'], ['rgba(255, 255, 255, 0.6)']);
            }
            this.setStyle(this.curMeridiemEle, ['color'], ['rgba(255, 255, 255, 1)']);
            this.lastMeridiemEle = this.curMeridiemEle;
            this.meridiem = this.curMeridiemEle.innerHTML.toLowerCase();
        };
        TimePicker.prototype.clockPointerEvent = function (clock, fn) {
            var _this = this;
            var p = null, flag = false;
            this.addEvent(clock.clock, 'mousedown', function (t, x, y) {
                _this.clickFlag = true;
                flag = true;
                p = _this.transformXY(x, y);
                _this.setPointerRotate(clock, _this.XY2angle(p.x, p.y, clock.interval));
                _this.setTime();
            });
            this.addEvent(clock.clock, 'mousemove', function (t, x, y) {
                if (_this.clickFlag) {
                    p = _this.transformXY(x, y);
                    _this.setPointerRotate(clock, _this.XY2angle(p.x, p.y, clock.interval));
                    _this.setTime();
                }
            });
            this.addEvent(clock.clock, 'mouseup', function () {
                if (flag) {
                    _this.clickFlag = false;
                    if (fn && typeof fn === 'function') {
                        fn();
                    }
                    flag = false;
                }
            });
        };
        TimePicker.prototype.init = function () {
            var _this = this;
            document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
            this.wrapper = this.getElement('div', 'wrapper-t'),
                this.materialPickerContainer = this.getElement('div', 'material-picker-container-t');
            this.pickerInfoContainer = this.getElement('div', 'picker-info-container-t');
            this.hourCon = this.getElement('div', 'hour');
            this.minuteCon = this.getElement('div', 'minute');
            this.meridiemCon = this.getElement('div', 'meridiem-con');
            this.hourClock.clock = this.getElement('div', 'hour-clock');
            this.hourClock.clock24 = this.getElement('div', 'hour-clock-24');
            this.minuteClock.clock = this.getElement('div', 'minute-clock');
            this.closeBtn = this.getElement('button', 'btn-close-t');
            this.comfirmBtn = this.getElement('button', 'btn-comfirm-t');
            this.nowBtn = this.getElement('button', 'btn-now-t');
            this.hourClock.viewEle = this.hourCon;
            this.minuteClock.viewEle = this.minuteCon;
            this.meridiemCon.appendChild(this.createMeridiemCon());
            this.hourClock.clock.appendChild(this.createClock(274, 0, 12, 1));
            this.hourClock.clock24.appendChild(this.createClock(194, 12, 24, 1));
            this.hourClock.clock.appendChild(this.createPointer(this.hourClock));
            this.minuteClock.clock.appendChild(this.createClock(274, 0, 60, 5));
            this.minuteClock.clock.appendChild(this.createPointer(this.minuteClock));
            this.amCon = this.getElement('div', 'am');
            this.pmCon = this.getElement('div', 'pm');
            this.getClockItemList();
            this.addEvent(this.wrapper, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.closeBtn, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.comfirmBtn, 'click', function (t) {
                _this.comfirm();
                _this.close();
            });
            this.addEvent(this.nowBtn, 'click', function (t) {
                _this.toNow();
            });
            this.addEvent(this.hourCon, 'click', function (t) {
                _this.switchClock(_this.hourClock, _this.minuteClock);
            });
            this.addEvent(this.minuteCon, 'click', function (t) {
                _this.switchClock(_this.minuteClock, _this.hourClock);
            });
            this.addEvent(this.amCon, 'click', function (t) {
                _this.toggleFocusMeridiem(_this.amCon);
                _this.setTime();
            });
            this.addEvent(this.pmCon, 'click', function (t) {
                _this.toggleFocusMeridiem(_this.pmCon);
                _this.setTime();
            });
            this.addEvent(this.materialPickerContainer, 'click', function (t) { });
            this.clockPointerEvent(this.hourClock, function () {
                _this.switchClock(_this.minuteClock, _this.hourClock);
            });
            this.clockPointerEvent(this.minuteClock);
        };
        TimePicker.prototype.show = function (opt) {
            this.comfirmFn = opt ? opt['comfirm'] : null;
            this.setTheme(opt);
            this.getTime();
            this.renderPanel();
            this.setTime();
        };
        return TimePicker;
    }(MaterialPicker));
    if (typeof module !== "undefined" && module !== null) {
        module.exports = {
            DatePicker: DatePicker,
            TimePicker: TimePicker
        };
    }
    return {
        DatePicker: DatePicker,
        TimePicker: TimePicker
    };
})(window), DatePicker = _a.DatePicker, TimePicker = _a.TimePicker;

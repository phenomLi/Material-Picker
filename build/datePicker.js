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
var MaterialPicker = (function (window) {
    var MaterialPicker = (function () {
        function MaterialPicker(className, conf) {
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
                themeColor: 'rgba(46, 152, 136, 1)',
                type: 'portrait',
                directive: className === 'DatePicker' ? 'date-picker' : 'time-picker'
            };
            this.curInputData = {
                inputEle: null,
                index: -1,
                selectedValue: '',
                themeColor: this.$conf['themeColor'],
                type: this.$conf['type'],
                format: 'true',
                onSelect: function () { },
                onShow: function () { },
                onClose: function () { }
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
            this.curInputData = {
                inputEle: null,
                index: -1,
                selectedValue: '',
                themeColor: this.$conf['themeColor'],
                type: this.$conf['type'],
                format: 'true',
                onSelect: function () { },
                onShow: function () { },
                onClose: function () { }
            };
        };
        MaterialPicker.prototype.comfirm = function (value) {
            if (this.curInputData.inputEle) {
                this.curInputData.inputEle['value'] = this.curInputData.selectedValue = value;
                this.curInputData.onSelect(this.curInputData.selectedValue);
            }
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
        MaterialPicker.prototype.addEvent = function (ele, event, fn) {
            var target;
            ele.addEventListener(event, function (e) {
                e = e || window.event;
                target = e.target || e.srcElement;
                e.stopPropagation();
                e.cancelBubble = true;
                fn(target);
            });
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
                format: inputEle.getAttribute('data-format'),
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
    var DatePicker = (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(conf) {
            var _this = _super.call(this, DatePicker.prototype['constructor']['name'], conf) || this;
            _this.yearCon = null;
            _this.monthCon = null;
            _this.dateCon = null;
            _this.monthDateCon = null;
            _this.monthYearBody = null;
            _this.calendarBody = null;
            _this.yearListCon = null;
            _this.weekdayCon = null;
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
            this.yearCon.innerHTML = this.year.toString();
            this.monthCon.innerHTML = this.number2ZN(this.month) + '月';
            this.dateCon.innerHTML = this.date.toString();
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
            return new Date(year, month, date).getDay();
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
            var startDay = this.date2weekday(year, month, 1), endDay = this.monthDaysCount(month, year), translateX = '', style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;user-select: none;', day = 0, row = Math.ceil((startDay + endDay) / 7), calendarItem = document.createElement('div');
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
                            !span.getAttribute('data-select') && this.setStyle(span, ['color'], [this.themeColor]);
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
            var div = document.createElement('div'), template = "\n                <div data-ele=\"wrapper-d\" style=\"box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; visibility: hidden; opacity: 0; transition: all 0.2s ease;\">\n                    <div style=\"display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);\">\n                        <div data-ele=\"material-picker-container-d\" style=\"display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease; transform: translateY(-30%); opacity: 0;\">\n                            \n                            <div data-ele=\"picker-info-container-d\" style=\"color: #fff;box-sizing: border-box;align-items: stretch; display: flex; flex-direction: column; justify-content: space-between; position: relative; align-items: stretch;\">\n                                <div data-ele=\"weekday\" style=\"padding: 10px 0 10px 0; background-color: rgba(0, 0, 0, 0.2); text-align: center; color: rgba(255, 255, 255, 0.8);\"></div>\n                                <div style=\"padding:20px; width: 140px; align-self: center; flex-grow: 1; display:flex; flex-direction: column;\">\n                                    <div data-ele=\"month-date\">\n                                        <div data-ele=\"month\" style=\"text-align: center;font-size: 24px; transition: all 0.2s ease;\"></div>\n                                        <div data-ele=\"date\" style=\"color: #fff;font-size: 76px; font-weight: 900;transition: all 0.2s ease;text-align: center; padding: 0 0 12px 0;\"></div>\n                                    </div>\n                                    <div data-ele=\"year\" style=\"color: rgba(255, 255, 255, 0.7);cursor: pointer; transition: all 0.2s ease;text-align: center;\"></div>\n                                </div>\n                            </div>\n                \n                            <div data-ele=\"picker-body-container-d\" style=\"display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch; position: relative;\">\n                                <div style=\"display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);\">\n                                    \n                                    <button data-ele=\"btn-pm\" style=\"outline: none;border: none;cursor: pointer; background-color: transparent;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"></path>\n                                        </svg>\n                                    </button>\n\n                                    <div data-ele=\"month-year-body\" style=\"overflow: hidden; position: relative; width: 140px; height: 28px;\"></div>\n\n                                    <button data-ele=\"btn-nm\" style=\"outline: none;border: none;cursor: pointer;background-color: transparent;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"></path>\n                                        </svg>\n                                    </button>\n\n                                </div>\n                \n                                <div>\n                                    <div style=\"display: flex;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5); text-align: center;\">\n                                        <div style=\"width: 40px;\">\u65E5</div>\n                                        <div style=\"width: 40px;\">\u4E00</div>\n                                        <div style=\"width: 40px;\">\u4E8C</div>\n                                        <div style=\"width: 40px;\">\u4E09</div>\n                                        <div style=\"width: 40px;\">\u56DB</div>\n                                        <div style=\"width: 40px;\">\u4E94</div>\n                                        <div style=\"width: 40px;\">\u516D</div>\n                                    </div>\n                \n                                    <div data-ele=\"calendar-body\" style=\"overflow: hidden;position: relative; width: 280px; height: 240px;\"></div>\n                                </div>\n                \n                                <div style=\"display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;\">\n                                    <button data-ele=\"btn-now-d\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u4ECA\u5929</button>\n                                    <div style=\"display: flex; width: 40%; justify-content: space-between; align-items: center;\">\n                                        <button data-ele=\"btn-close-d\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u5173\u95ED</button>\n                                        <button data-ele=\"btn-comfirm-d\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u786E\u5B9A</button>\n                                    </div>\n                                </div>\n\n                                <div data-ele=\"year-list-con\" style=\"position: absolute; width: 100%; height: 100%; visibility: hidden; background-color: #fff; transition: all 0.15s ease; left: 0; top: 0; overflow: auto;\">\n\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n                ";
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
                    _this.setStyle(target, ['backgroundColor', 'opacity', 'color'], [_this.themeColor, 0.65, '#fff']);
                }
            });
            this.addEvent(this.materialPickerContainer, 'mouseout', function (target) {
                if (_this.isUnselectDateEle(target)) {
                    _this.setStyle(target, ['backgroundColor', 'opacity', 'color'], ['#fff', 1, target['getAttribute']('data-today') ? _this.themeColor : '#000']);
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
                this.setStyle(this.lastSelectDateEle, ['backgroundColor', 'opacity', 'color'], ['#fff', 1, this.lastSelectDateEle['getAttribute']('data-today') ? this.themeColor : '#000']);
                this.lastSelectDateEle['removeAttribute']('data-select');
            }
            this.curSelectDateEle['setAttribute']('data-select', true);
            this.setStyle(this.curSelectDateEle, ['backgroundColor', 'opacity', 'color'], [this.themeColor, 1, '#fff']);
            this.lastSelectDateEle = this.curSelectDateEle;
            this.date = parseInt(ele['innerHTML']);
            this.weekday = this.date2weekday(this.year, this.month, this.date);
        };
        DatePicker.prototype.toggleYearFocus = function (ele) {
            this.curSelectYear = ele;
            if (this.lastSelectYear) {
                this.setStyle(this.lastSelectYear, ['color', 'font-size'], ['#666', '20px']);
            }
            this.setStyle(this.curSelectYear, ['color', 'font-size'], [this.themeColor, '28px']);
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
            this.setStyle(this.yearCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
            this.setStyle(this.monthCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '24px', 'auto']);
            this.setStyle(this.dateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '76px', 'auto']);
            this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['hidden', 0]);
        };
        DatePicker.prototype.yearListShow = function () {
            var toYearEle = this.getElement('li', "data-year-item-" + this.year);
            this.yearListCon.scrollTop = toYearEle['offsetTop'] - this.yearListCon['offsetHeight'] / 2 + 20;
            this.toggleYearFocus(toYearEle);
            this.setStyle(this.yearCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '36px', 'auto']);
            this.setStyle(this.monthCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
            this.setStyle(this.dateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '36px', 'pointer']);
            this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['visible', 1]);
        };
        DatePicker.prototype.init = function () {
            var _this = this;
            document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
            document.querySelector('head').appendChild(this.createAnimationContext());
            this.wrapper = this.getElement('div', 'wrapper-d'),
                this.materialPickerContainer = this.getElement('div', 'material-picker-container-d');
            this.pickerInfoContainer = this.getElement('div', 'picker-info-container-d');
            this.yearCon = this.getElement('div', 'year');
            this.monthCon = this.getElement('div', 'month');
            this.dateCon = this.getElement('div', 'date');
            this.monthDateCon = this.getElement('div', 'month-date');
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
            this.inputList.map(function (ele) {
                _this.addEvent(ele, 'focus', function (t) {
                    _this.curInputData = _this.inputDataList[parseInt(ele.getAttribute('data-component-index'))];
                    _this.show(_this.curInputData.themeColor, _this.curInputData.type);
                });
            });
            this.addEvent(this.wrapper, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.closeBtn, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.comfirmBtn, 'click', function (t) {
                _this.comfirm(_this.year + "-" + _this.month + "-" + _this.date);
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
            this.addEvent(this.yearCon, 'click', function (target) {
                _this.yearListShow();
            });
            this.addEvent(this.monthDateCon, 'click', function (target) {
                _this.yearListClose();
            });
            this.hover();
            this.select();
            this.selectYear();
        };
        DatePicker.prototype.show = function (color, type) {
            this.setTheme(color, type);
            this.setCurDate();
            this.renderPanel();
            this.setDate();
            this.curInputData.onShow();
        };
        return DatePicker;
    }(MaterialPicker));
    var TimePicker = (function (_super) {
        __extends(TimePicker, _super);
        function TimePicker(conf) {
            var _this = _super.call(this, TimePicker.prototype['constructor']['name'], conf) || this;
            _this.curHour = _this.$dateInstance.getHours();
            _this.init();
            return _this;
        }
        TimePicker.prototype.createContainer = function () {
            var div = document.createElement('div'), template = "\n              <div data-ele=\"wrapper-t\" style=\"visibility: hidden; opacity: 0; box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; transition: all 0.2s ease;\">\n                <div style=\"display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);\">\n                    <div data-ele=\"material-picker-container-t\" style=\"transform: translateY(-30%); opacity: 0;display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease;\">\n                        <div data-ele=\"picker-info-container-t\" style=\"color: #fff;box-sizing: border-box;align-items: stretch; display: flex; flex-direction: column; justify-content: space-between; position: relative; align-items: stretch;\">\n                            8:30\n                        </div>\n\n                        <div data-ele=\"picker-body-container-t\" style=\"display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch; position: relative;\">\n                            \n                            <div data-ele=\"clock-body\" style=\"padding: 8px 16px 8px 16px;\">\n                                <div style=\"width: 200px; height: 200px; border-radius: 50%; background-color: #eee;\"></div>\n                            </div>\n\n                            <div style=\"display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;\">\n                                <button data-ele=\"btn-now-t\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u4ECA\u5929</button>\n                                <div style=\"display: flex; width: 40%; justify-content: space-between; align-items: center;\">\n                                    <button data-ele=\"btn-close-t\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u5173\u95ED</button>\n                                    <button data-ele=\"btn-comfirm-t\" style=\"background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u786E\u5B9A</button>\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n            </div>\n              ";
            div.innerHTML = template;
            return div.children[0];
        };
        TimePicker.prototype.toNow = function () {
        };
        TimePicker.prototype.init = function () {
            var _this = this;
            document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
            this.wrapper = this.getElement('div', 'wrapper-t'),
                this.materialPickerContainer = this.getElement('div', 'material-picker-container-t');
            this.pickerInfoContainer = this.getElement('div', 'picker-info-container-t');
            this.closeBtn = this.getElement('button', 'btn-close-t');
            this.comfirmBtn = this.getElement('button', 'btn-comfirm-t');
            this.nowBtn = this.getElement('button', 'btn-now-t');
            this.inputList.map(function (ele) {
                _this.addEvent(ele, 'focus', function (t) {
                    _this.curInputData = _this.inputDataList[parseInt(ele.getAttribute('data-component-index'))];
                    _this.show(_this.curInputData.themeColor, _this.curInputData.type);
                });
            });
            this.addEvent(this.wrapper, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.closeBtn, 'click', function (t) {
                _this.close();
            });
            this.addEvent(this.comfirmBtn, 'click', function (t) {
                _this.comfirm("");
                _this.close();
            });
            this.addEvent(this.nowBtn, 'click', function (t) {
                _this.toNow();
            });
        };
        TimePicker.prototype.show = function (themeColor, type) {
            this.setTheme(themeColor, type);
        };
        return TimePicker;
    }(MaterialPicker));
    return {
        DatePicker: DatePicker,
        TimePicker: TimePicker
    };
})(window);

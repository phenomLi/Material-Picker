var DatePicker = (function () {
    function DatePicker() {
        this.eleList = [];
        this.wrapper = null;
        this.datePickerContainer = null;
        this.dateInfoContainer = null;
        this.yearCon = null;
        this.monthDateCon = null;
        this.monthYearCon = null;
        this.todayBtn = null;
        this.closeBtn = null;
        this.comfirmBtn = null;
        this.curSelectDateEle = null;
        this.lastSelectDateEle = null;
        this.todayEle = null;
        this.themeColor = 'rgba(42, 176, 202, 1)';
        this.type = 'portrait';
        this.dateInstance = null;
        this.selectDate = '';
        this.config = {};
        this.dateInstance = new Date();
        this.curYear = this.dateInstance.getFullYear();
        this.curMonth = this.dateInstance.getMonth() + 1;
        this.curDate = this.dateInstance.getDate();
        this.year = this.curYear;
        this.month = this.curMonth;
        this.date = this.curDate;
        this.eleList = Array.prototype.slice.call(document.querySelectorAll('input[type="date-picker"]'));
        if (!this.eleList.length)
            return;
        this.init();
    }
    DatePicker.prototype.setDate = function (year, month, date) {
        this.yearCon.innerHTML = year.toString();
        this.monthDateCon['innerHTML'] = month + "\u6708" + date + "\u65E5";
    };
    DatePicker.prototype.setThemeColor = function () {
        this.setStyle(this.dateInfoContainer, ['backgroundColor'], [this.themeColor]);
        this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
        this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayEle, ['backgroundColor'], [this.themeColor]);
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
    DatePicker.prototype.getElement = function (tag, ele) {
        return document.querySelector(tag + "[data-ele=\"" + ele + "\"]");
    };
    DatePicker.prototype.setStyle = function (ele, styleList, valueList) {
        styleList.map(function (style, i) { return ele['style'][style] = valueList[i]; });
    };
    DatePicker.prototype.toToday = function () {
        this.toggleFocus(this.todayEle);
    };
    DatePicker.prototype.createMonthYearItem = function (month, year) {
        var template = "<div data-ele=\"month-year-item-" + year + "-" + month + "\">" + month + "\u6708\uFF0C" + year + "</div>";
        return template;
    };
    DatePicker.prototype.createCalendarItem = function (month, year) {
        var startDay = new Date(year + "-" + month + "-1").getDay(), endDay = this.monthDaysCount(month, year), template = "<div data-ele=\"calendar-item-" + year + "-" + month + "\">", style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;user-select: none;', day = 0, row = Math.ceil((startDay + endDay) / 7);
        for (var j = 0; j < row; j++) {
            template += '<div style="display: flex;">';
            for (var i = 0; i < 7; i++) {
                var span = '';
                if ((startDay > i && j === 0) || day >= endDay) {
                    span += "<span data-ele=\"date-item\" style=\"" + style + "\"></span>";
                }
                else {
                    day++;
                    span += "<span data-ele=\"date-item-" + day + "\" style=\"" + style + "\">" + day + "</span>";
                }
                template += span;
            }
            template += '</div>';
        }
        template += '</div>';
        return template;
    };
    DatePicker.prototype.createContainer = function () {
        var div = document.createElement('div'), template = "\n                <div data-ele=\"wrapper\" style=\"box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; display: none;\">\n                    <div style=\"display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);\">\n                        <div data-ele=\"date-picker-container\" style=\"display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);\">\n                            \n                            <div data-ele=\"date-info-container\" style=\"padding: 20px;color: #fff;box-sizing: border-box;align-items: stretch;\">\n                                <div data-ele=\"year\" style=\"margin-bottom: 14px;color: rgba(255, 255, 255, 0.7);cursor: pointer;\"></div>\n                                <div data-ele=\"month-date\" style=\"color: #fff;font-size: 32px;\"></div>\n                            </div>\n                \n                            <div data-ele=\"date-calendar-container\" style=\"display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch;\">\n                                <div style=\"display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);\">\n                                    <button style=\"outline: none;border: none;cursor: pointer;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"></path>\n                                        </svg>\n                                    </button>\n                                    <div data-ele=\"month-year-body\" style=\"overflow: hidden;\">\n                                        " + this.createMonthYearItem(this.curMonth, this.curYear) + "\n                                    </div>\n                                    <button style=\"outline: none;border: none;cursor: pointer;\">\n                                        <svg viewBox=\"0 0 24 24\" style=\"display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;\">\n                                            <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"></path>\n                                        </svg>\n                                    </button>\n                                </div>\n                \n                                <div style=\"height: 234px;\">\n                                    <div style=\"display: flex;justify-content: space-around;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5);\">\n                                        <span>\u65E5</span>\n                                        <span>\u4E00</span>\n                                        <span>\u4E8C</span>\n                                        <span>\u4E09</span>\n                                        <span>\u56DB</span>\n                                        <span>\u4E94</span>\n                                        <span>\u516D</span>\n                                    </div>\n                \n                                    <div data-ele=\"calendar-body\" style=\"overflow: hidden;\">\n                                        " + this.createCalendarItem(this.curMonth, this.curYear) + "\n                                    </div>\n                                </div>\n                \n                                <div style=\"display: flex;justify-content: space-between;align-items: center;height: 48px;\">\n                                    <button data-ele=\"btn-today\" style=\"width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u4ECA\u5929</button>\n                                    <div style=\"display: flex; width: 40%; justify-content: space-between; align-items: center;\">\n                                        <button data-ele=\"btn-close\" style=\"width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u5173\u95ED</button>\n                                        <button data-ele=\"btn-comfirm\" style=\"width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;\">\u786E\u5B9A</button>\n                                    </div>\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n                </div>\n                ";
        div.innerHTML = template;
        return div.children[0];
    };
    DatePicker.prototype.select = function () {
        var _this = this;
        this.datePickerContainer.addEventListener('click', function (e) {
            e.stopPropagation();
            if (_this.isUnselectDateEle(e.target)) {
                _this.toggleFocus(e.target);
            }
        });
    };
    DatePicker.prototype.hover = function () {
        var _this = this;
        this.datePickerContainer.addEventListener('mouseover', function (e) {
            e.stopPropagation();
            if (_this.isUnselectDateEle(e.target)) {
                _this.setStyle(e.target, ['backgroundColor', 'opacity', 'color'], [_this.themeColor, 0.65, '#fff']);
            }
        });
        this.datePickerContainer.addEventListener('mouseout', function (e) {
            e.stopPropagation();
            if (_this.isUnselectDateEle(e.target)) {
                _this.setStyle(e.target, ['backgroundColor', 'opacity', 'color'], ['#fff', 1, e.target['getAttribute']('data-today') ? _this.themeColor : '#000']);
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
        this.setDate(this.year, this.month, this.date);
    };
    DatePicker.prototype.init = function () {
        var _this = this;
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
        this.wrapper = this.getElement('div', 'wrapper'),
            this.datePickerContainer = this.getElement('div', 'date-picker-container');
        this.dateInfoContainer = this.getElement('div', 'date-info-container');
        this.yearCon = this.getElement('div', 'year');
        this.monthDateCon = this.getElement('div', 'month-date');
        this.closeBtn = this.getElement('button', 'btn-close');
        this.comfirmBtn = this.getElement('button', 'btn-comfirm');
        this.todayBtn = this.getElement('button', 'btn-today');
        this.todayEle = document.querySelector("span[data-ele=\"date-item-" + this.curDate + "\"]");
        this.todayEle.setAttribute('data-today', true);
        this.eleList.map(function (ele) {
            ele.addEventListener('focus', function () {
                _this.show(ele.getAttribute('data-color'), ele.getAttribute('data-type'));
            });
        });
        this.wrapper.addEventListener('click', function (e) {
            _this.close();
        });
        this.hover();
        this.select();
        this.toToday();
    };
    DatePicker.prototype.close = function () {
        this.wrapper['style'].display = 'none';
    };
    DatePicker.prototype.show = function (color, type) {
        this.type = type || this.type;
        this.themeColor = color || this.themeColor;
        this.setThemeColor();
        this.datePickerContainer['style'].flexDirection = this.type === 'portrait' ? 'column' : 'row';
        this.wrapper['style'].display = 'block';
    };
    return DatePicker;
}());
new DatePicker();
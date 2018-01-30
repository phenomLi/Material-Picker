


class DatePicker {

    //绑定的input元素合集
    private eleList: Array<Element> = [];

    //HTML元素-----------------------------------------------
    private wrapper: Element = null;
    private datePickerContainer: Element = null;
    private dateInfoContainer: Element = null;
    private yearCon: Element = null;
    private monthDateCon: Element = null;
    private monthYearCon: Element = null;
    //按钮：回到今天
    private todayBtn: Element = null;
    //按钮：关闭
    private closeBtn: Element = null;
    //按钮：确认
    private comfirmBtn: Element = null;
    //保存这次和上一次选中的元素
    private curSelectDateEle: Element | EventTarget = null;
    private lastSelectDateEle: Element | EventTarget = null;
    //今天的日期格子元素
    private todayEle = null;

    //一些配置
    private themeColor: string = 'rgba(42, 176, 202, 1)';
    private type: string = 'portrait';

    //保存Date对象的实例
    private dateInstance: Date = null;

    private year: number;
    private month: number;
    private date: number;

    //今年，今月，今日
    private curYear: number;
    private curMonth: number;
    private curDate: number;

    //选择的日期
    private selectDate: string = '';

    //配置项
    private config: object = {};

    /**
     * @param ele <HTMLElement> 绑定的元素
     * @param option <object> 配置项
     */
    constructor() {
        this.dateInstance = new Date();
        this.curYear = this.dateInstance.getFullYear();
        this.curMonth = this.dateInstance.getMonth() + 1;
        this.curDate = this.dateInstance.getDate();

        this.year = this.curYear;
        this.month = this.curMonth;
        this.date = this.curDate;

        this.eleList = Array.prototype.slice.call(document.querySelectorAll('input[type="date-picker"]'));

        if(!this.eleList.length) return;

        //初始化
        this.init();
    }



    public setDate(year: number, month: number, date: number): void {
        this.yearCon.innerHTML = year.toString();
        this.monthDateCon['innerHTML'] = `${month}月${date}日`;
    }

    public setThemeColor(): void {
        this.setStyle(this.dateInfoContainer, ['backgroundColor'], [this.themeColor]);
        this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
        this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayEle, ['backgroundColor'], [this.themeColor]);
    }




    /**
     * 判断是否为闰年
     * @param year <number> 年份
     * @return <boolean>
     */
    private isLeap(year: number): boolean {
        return (year%4 === 0 && year%100 !== 0)||year%400 === 0;
    }

    /**
     * 计算某个月有多少天
     * @param month <number> 月份
     * @param year <number> 年份
     * @return <number> 
     */
    private monthDaysCount(month: number, year: number): number {
        const bigMonth = [1, 3, 5, 7, 8, 10, 12];

        if(month === 2) {
            return this.isLeap(year)? 29: 28;
        }
        else {
            return bigMonth.indexOf(month) > -1? 31: 30;
        }
    }

    /**
     * 根据data-ele属性获取元素
     * @param tag <string> 标签名
     * @param ele <string> data-ele标识
     * @return <Element>
     */
    private getElement(tag: string, ele: string): Element {
        return document.querySelector(`${tag}[data-ele="${ele}"]`);
    }

    /**
     * 设置元素的style
     * @param ele <Element | EventTarget> 元素 
     * @param styleList Array<string> 要设置的style
     * @param valueList Array<string | number> 要设置的值
     */
    private setStyle(ele: Element | EventTarget, styleList: Array<string>, valueList: Array<string | number>): void {
        styleList.map((style, i) => ele['style'][style] = valueList[i]);
    }


    private toToday(): void {
        this.toggleFocus(this.todayEle);
    }







    /**
     * 创建月-年滑块模板
     * @param month <number>
     * @param year <number>
     * @return template <string>
     */
    private createMonthYearItem(month: number, year: number): string {
        let template = `<div data-ele="month-year-item-${year}-${month}">${month}月，${year}</div>`;
        return template;
    }

    /**
     * 创建日历滑块模板
     * @param month <number>
     * @param year <number>
     * @return template <string>
     */
    private createCalendarItem(month: number, year: number): string {
        let startDay: number = new Date(`${year}-${month}-1`).getDay(),
            endDay: number = this.monthDaysCount(month, year),
            template = `<div data-ele="calendar-item-${year}-${month}">`,
            style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;user-select: none;',
            day: number = 0,
            row = Math.ceil((startDay + endDay)/7);

        for(let j = 0; j < row; j++) {
            template += '<div style="display: flex;">';

            for(let i = 0; i < 7; i ++) {
                let span = '';

                if((startDay > i && j === 0) || day >= endDay) {
                    span += `<span data-ele="date-item" style="${style}"></span>`;
                }
                else {
                    day++;
                    span += `<span data-ele="date-item-${day}" style="${style}">${day}</span>`;
                }

                template += span;
            }

            template += '</div>';

        }

        template += '</div>';

        return template;
    }

    /**
     * 创建组件的基础HTML模板
     */
    private createContainer(): Element {
        const div = document.createElement('div'),
              template = `
                <div data-ele="wrapper" style="box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; display: none;">
                    <div style="display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);">
                        <div data-ele="date-picker-container" style="display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
                            
                            <div data-ele="date-info-container" style="padding: 20px;color: #fff;box-sizing: border-box;align-items: stretch;">
                                <div data-ele="year" style="margin-bottom: 14px;color: rgba(255, 255, 255, 0.7);cursor: pointer;"></div>
                                <div data-ele="month-date" style="color: #fff;font-size: 32px;"></div>
                            </div>
                
                            <div data-ele="date-calendar-container" style="display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch;">
                                <div style="display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);">
                                    <button style="outline: none;border: none;cursor: pointer;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                                        </svg>
                                    </button>
                                    <div data-ele="month-year-body" style="overflow: hidden;">
                                        ${this.createMonthYearItem(this.curMonth, this.curYear)}
                                    </div>
                                    <button style="outline: none;border: none;cursor: pointer;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                                        </svg>
                                    </button>
                                </div>
                
                                <div style="height: 234px;">
                                    <div style="display: flex;justify-content: space-around;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5);">
                                        <span>日</span>
                                        <span>一</span>
                                        <span>二</span>
                                        <span>三</span>
                                        <span>四</span>
                                        <span>五</span>
                                        <span>六</span>
                                    </div>
                
                                    <div data-ele="calendar-body" style="overflow: hidden;">
                                        ${this.createCalendarItem(this.curMonth, this.curYear)}
                                    </div>
                                </div>
                
                                <div style="display: flex;justify-content: space-between;align-items: center;height: 48px;">
                                    <button data-ele="btn-today" style="width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">今天</button>
                                    <div style="display: flex; width: 40%; justify-content: space-between; align-items: center;">
                                        <button data-ele="btn-close" style="width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">关闭</button>
                                        <button data-ele="btn-comfirm" style="width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">确定</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                `;
        
        div.innerHTML = template;

        return div.children[0];
    }







    

    /**
     * 确认日期选择
     */
    private select(): void {

        this.datePickerContainer.addEventListener('click', e => {
            e.stopPropagation();

            if(this.isUnselectDateEle(e.target)) {
                this.toggleFocus(e.target);
            }
        });
    }


    /**
     * 鼠标日期悬浮效果
     */
    private hover(): void {
        this.datePickerContainer.addEventListener('mouseover', e => {
            e.stopPropagation();

            if(this.isUnselectDateEle(e.target)) {
                this.setStyle(e.target, ['backgroundColor', 'opacity', 'color'], [this.themeColor, 0.65, '#fff']);
            }
        });

        this.datePickerContainer.addEventListener('mouseout', e => {
            e.stopPropagation();

            if(this.isUnselectDateEle(e.target)) {
                this.setStyle(
                    e.target, 
                    ['backgroundColor', 'opacity', 'color'], 
                    ['#fff', 1, e.target['getAttribute']('data-today')? this.themeColor: '#000']
                );
            }
        });
    }

    /**
     * 判断是否是一个不为空且未被选中的日期格子
     * @param ele <EventTarget> 被选中的日期HTML元素 
     */
    private isUnselectDateEle(ele: EventTarget): boolean {
        return ele['getAttribute']('data-ele') && ele['getAttribute']('data-ele').indexOf('date-item') > -1 && ele['innerHTML'] !== '' && !ele['getAttribute']('data-select')
    }

    /**
     * 选中某个日期格子
     * @param ele <Element | EventTarget> 日期格子函数 
     */
    private toggleFocus(ele): void {
        this.curSelectDateEle = ele;

        if(this.lastSelectDateEle) {
            this.setStyle(
                this.lastSelectDateEle, 
                ['backgroundColor', 'opacity', 'color'], 
                ['#fff', 1, this.lastSelectDateEle['getAttribute']('data-today')? this.themeColor: '#000']
            );
            this.lastSelectDateEle['removeAttribute']('data-select');
        }

        this.curSelectDateEle['setAttribute']('data-select', true);
        this.setStyle(this.curSelectDateEle, ['backgroundColor', 'opacity', 'color'], [this.themeColor, 1, '#fff']);

        this.lastSelectDateEle = this.curSelectDateEle;

        this.date = parseInt(ele['innerHTML']);

        this.setDate(this.year, this.month, this.date);
    }
    

    /**
     * 生命周期函数-----------------------------------------------------
     */


    /**
     * 组件初始化
     * 为一些元素绑定事件,标识今天等
     * 
     */
    public init(): void {

        //首先将模板插入body
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);

        this.wrapper = this.getElement('div', 'wrapper'),
        this.datePickerContainer = this.getElement('div', 'date-picker-container');
        this.dateInfoContainer = this.getElement('div', 'date-info-container');
        this.yearCon = this.getElement('div', 'year');
        this.monthDateCon = this.getElement('div', 'month-date');

        this.closeBtn = this.getElement('button', 'btn-close');
        this.comfirmBtn = this.getElement('button', 'btn-comfirm');
        this.todayBtn = this.getElement('button', 'btn-today');

        this.todayEle = document.querySelector(`span[data-ele="date-item-${this.curDate}"]`);
        this.todayEle.setAttribute('data-today', true);

        //点击input显示元素
        this.eleList.map(ele => {
            ele.addEventListener('focus', () => {
                //显示组件
                this.show(ele.getAttribute('data-color'), ele.getAttribute('data-type'));
            });
        });

        //点击wrapper关闭元素
        this.wrapper.addEventListener('click', e => {
            this.close();
        });

        //悬浮日期
        this.hover();

        //点击选择日期
        this.select();

        this.toToday();
    }


    /**
     * 关闭组件
     */
    public close(): void {
        this.wrapper['style'].display = 'none';
    }

    /**
     * 组件显示
     * @param color <string> 主题色
     * @param type <string> 布局类型
     */
    public show(color: string, type: string) {
 
        this.type = type || this.type;
        this.themeColor = color || this.themeColor;

        this.setThemeColor();

        this.datePickerContainer['style'].flexDirection = this.type === 'portrait'? 'column': 'row';

        this.wrapper['style'].display = 'block';
    }


}



new DatePicker();













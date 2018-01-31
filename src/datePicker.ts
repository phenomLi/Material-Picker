

const DatePicker = (function(window) {


interface inputData {
    //某个input元素
    inputEle: Element | HTMLElement;
    //序号
    index: number;

    //选中的年月日
    year: number;
    month: number;
    date: number;
    //确认选中的日期
    selectedDate: string;
    //主题色和布局
    themeColor: string;
    type: string;
    //事件函数
    onSelect(date: string): (date: string) => void;
    onShow(): () => void;
    onClose(): () => void;
}



return class DatePicker {

    //绑定的input元素合集
    private inputList: Array<Element> = [];
    private inputDataList: Array<inputData> = [];
    //input元素的序号
    private inputEleindex: number = 0;
    //当前选中的input的数据
    private curInputData: inputData = null;

    //HTML元素-----------------------------------------------
    private wrapper: Element = null;
    private datePickerContainer: Element = null;
    private dateInfoContainer: Element = null;
    private yearCon: Element = null;
    private monthDateCon: Element = null;
    private monthYearBody: Element = null;
    private calendarBody: Element = null;
    //按钮：回到今天
    private todayBtn: Element = null;
    //按钮：关闭
    private closeBtn: Element = null;
    //按钮：确认
    private comfirmBtn: Element = null;
    //今天的日期格子元素
    private todayEle = null;
    //当前input保存这次和上一次选中的元素
    private curSelectDateEle: Element | EventTarget = null;
    private lastSelectDateEle: Element | EventTarget = null;
    //上个月/下个月按钮
    private pmBtn: Element = null;
    private nmBtn: Element = null;

    //----------------------------------------------------

    //当前input选中的年月日
    private year: number;
    private month: number;
    private date: number;

    //保存Date对象的实例
    private $dateInstance: Date = null;
    //今年，今月，今日
    private curYear: number;
    private curMonth: number;
    private curDate: number;



    //当前的主题色
    private themeColor: string;
    //当前的布局
    private type: string;
    /**
     * 其他配置项，包括
     * 默认input-type绑定指令
     * 默认主题色
     * 默认布局
     */
    private $conf: object = {};

    /**
     * 保存所有事件函数的容器
     */
    private $methods: object = {};





    /**
     * 
     * @param conf 配置项
     */
    constructor(conf?: object) {
        this.$dateInstance = new Date();
        this.curYear = this.$dateInstance.getFullYear();
        this.curMonth = this.$dateInstance.getMonth() + 1;
        this.curDate = this.$dateInstance.getDate();

        this.year = this.curYear;
        this.month = this.curMonth;
        this.date = this.curDate;

        //默认配置
        this.$conf = {
            themeColor: 'rgba(42, 176, 202, 1)',
            type: 'portrait',
            directive: 'date-picker'
        };

        //合并配置项
        this.$conf = conf? Object['assign'](this.$conf, conf): this.$conf;

        this.inputList = Array.prototype.slice.call(document.querySelectorAll(`input[type="${this.$conf['directive']}"]`));

        if(this.inputList.length) {
            //收集所有数据
            this.inputList.map(item => this.addInputData(item));
        }

        //初始化
        this.init();
    }



    //-------------------工具函数--------------------------------

    /**
     * 设置主面板日期
     * @param year <number> 年份
     * @param month <number> 月份
     * @param date <number> 日
     */
    private setDate(year: number, month: number, date: number): void {
        this.monthYearBody.innerHTML = this.createMonthYearItem(month, year);
        this.yearCon.innerHTML = year.toString();
        this.monthDateCon['innerHTML'] = `${month}月${date}日`;
    }

    /**
     * 设置组件主题：颜色/布局
     */
    private setTheme(color?: string, type?: string): void {

        this.type = type || this.$conf['type'];
        this.themeColor = color || this.$conf['themeColor'];

        this.setStyle(this.dateInfoContainer, ['backgroundColor'], [this.themeColor]);
        this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
        this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayBtn, ['color'], [this.themeColor]);
        this.setStyle(this.todayEle, ['color'], [this.todayEle.getAttribute('data-selected')? '#fff': this.themeColor]);

        this.setStyle(this.datePickerContainer, ['flexDirection'], [this.type === 'portrait'? 'column': 'row']);
        this.setStyle(this.wrapper, ['display'], ['block']);
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

    /**
     * 解析日期
     */
    private parseDate(date: string): Array<number> {
        return date?  
            [parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2])]:
            [this.curYear, this.curMonth, this.curDate];
    }

    //-------------------工具函数END--------------------------------





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
                                    
                                    <button data-ele="btn-pm" style="outline: none;border: none;cursor: pointer;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                                        </svg>
                                    </button>

                                    <div data-ele="month-year-body" style="overflow: hidden;"></div>

                                    <button data-ele="btn-nm" style="outline: none;border: none;cursor: pointer;">
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
                
                                    <div data-ele="calendar-body" style="overflow: hidden;"></div>
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
     * 收集所有input元素的数据
     * @param inputEle <Element | HTMLElement> input元素
     */
    private addInputData(inputEle: Element | HTMLElement): void {

        const ymd = this.parseDate(inputEle['value']);

        inputEle.setAttribute('data-component-index', this.inputEleindex.toString());

        this.inputDataList.push({
            inputEle: inputEle,
            index: this.inputEleindex,
            
            year: ymd[0],
            month: ymd[1],
            date: ymd[2],
            selectedDate: inputEle['value'],

            themeColor: inputEle.getAttribute('data-color') || this.themeColor,
            type: inputEle.getAttribute('data-type') || this.type,

            onSelect: this.$methods[inputEle.getAttribute('onSelect')],
            onShow: this.$methods[inputEle.getAttribute('onShow')],
            onClose: this.$methods[inputEle.getAttribute('onClose')]
        });

        this.inputEleindex++;
    }


    /**
     * 组件初始化
     * 将模板插入到页面
     * 为一些元素绑定事件,标识今天等
     */
    private init(): void {

        //首先将模板插入body
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);

        this.wrapper = this.getElement('div', 'wrapper'),
        this.datePickerContainer = this.getElement('div', 'date-picker-container');
        this.dateInfoContainer = this.getElement('div', 'date-info-container');
        this.yearCon = this.getElement('div', 'year');
        this.monthDateCon = this.getElement('div', 'month-date');
        this.monthYearBody = this.getElement('div', 'month-year-body');
        this.calendarBody = this.getElement('div', 'calendar-body');

        this.closeBtn = this.getElement('button', 'btn-close');
        this.comfirmBtn = this.getElement('button', 'btn-comfirm');
        this.todayBtn = this.getElement('button', 'btn-today');

        this.pmBtn = this.getElement('button', 'btn-pm');
        this.nmBtn = this.getElement('button', 'btn-nm');

        this.monthYearBody.innerHTML = this.createMonthYearItem(this.curMonth, this.curYear);
        this.calendarBody.innerHTML = this.createCalendarItem(this.curMonth, this.curYear);

        this.todayEle = document.querySelector(`span[data-ele="date-item-${this.curDate}"]`);
        this.todayEle.setAttribute('data-today', true);

        //点击input显示组件
        this.inputList.map(ele => {
            ele.addEventListener('focus', () => {

                //将this.curInputData设置为当前选中的input
                this.curInputData = this.inputDataList[parseInt(ele.getAttribute('data-component-index'))];

                //显示组件
                this.show(this.curInputData.themeColor, this.curInputData.type);
            });
        });

        //点击wrapper关闭组件
        this.wrapper.addEventListener('click', e => {
            this.close();
        });

        //点击取消按钮关闭组件
        this.closeBtn.addEventListener('click', e => {
            this.close();
        });

        


        //悬浮日期
        this.hover();

        //点击选择日期
        this.select();
    }


    private comfirm(): void {
        this.curInputData.inputEle['value'] = this.curInputData.selectedDate = `${this.year}-${this.month}-${this.date}`;
        this.curInputData.onSelect && this.curInputData.onSelect(this.curInputData.selectedDate);
    }


    // //---------------暴露API----------------------


    /**
     * 关闭组件
     */
    public close(): void {
        this.setStyle(this.wrapper, ['display'], ['none']);
        this.curInputData.onClose && this.curInputData.onClose();
    }

    /**
     * 组件显示
     * @param color <string> 主题色
     * @param type <string> 布局类型
     */
    public show(color?: string, type?: string) {
        
        //设置外观
        this.setTheme(color, type);

        if(this.curInputData) {
            
            this.year = this.curInputData.year = this.parseDate(this.curInputData.selectedDate)[0];
            this.month = this.curInputData.month = this.parseDate(this.curInputData.selectedDate)[1];
            this.date = this.curInputData.date = this.parseDate(this.curInputData.selectedDate)[2];

            this.toggleFocus(this.getElement('span', `date-item-${this.date}`));
        }
        
        //响应事件
        this.curInputData.onShow && this.curInputData.onShow();
    }


    /**
     * 添加事件方法的接口
     * @param name <object> 要添加的方法名称
     * @param fn <object> 要添加的方法本体
     */
    public methods(name: string, fn): void {
        this.$methods[name] = fn;
    }

}




})(window);












const DatePicker = (function(window) {


interface inputData {
    //某个input元素
    inputEle: Element | HTMLElement;
    //序号
    index: number;

    //确认选中的值
    selectedValue: string;
    //主题色和布局
    themeColor: string;
    type: string;
    //事件函数
    onSelect(date: string);
    onShow();
    onClose();
}




class materialPicker {
    
    //绑定的input元素合集
    protected inputList: Array<Element> = [];
    protected inputDataList: Array<inputData> = [];
    //input元素的序号
    protected inputEleindex: number = 0;
    //当前选中的input的数据
    protected curInputData: inputData = null;

    //HTML元素-----------------------------------------------
    protected wrapper: Element = null;
    protected pickerInfoContainer: Element;
    protected materialPickerContainer: Element
    //按钮：回到今时/今日
    protected nowBtn: Element = null;
    //按钮：关闭
    protected closeBtn: Element = null;
    //按钮：确认
    protected comfirmBtn: Element = null;

    //保存Date对象的实例
    protected $dateInstance: Date = null;

    //当前的主题色
    protected themeColor: string;
    //当前的布局
    protected type: string;
    /**
     * 其他配置项，包括
     * 默认input-type绑定指令
     * 默认主题色
     * 默认布局
     */
    protected $conf: object = {};

    /**
     * 保存所有事件函数的容器
     */
    protected $methods: object = {};

    constructor(conf?: object) {
        this.$dateInstance = new Date();

        //默认配置
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

        //合并配置项
        this.$conf = conf? Object['assign'](this.$conf, conf): this.$conf;

        this.inputList = Array.prototype.slice.call(document.querySelectorAll(`input[type="${this.$conf['directive']}"]`));

        if(this.inputList.length) {
            //收集所有数据
            this.inputList.map(item => this.addInputData(item));
        }
    }

    /**
     * 组件初始化函数(需要子类重构)
     */
    protected init() {}

    /**
     * 关闭组件
     */
    public close() {
        this.setStyle(this.materialPickerContainer, ['transform', 'opacity'], ['translateY(-30%)', 0]);
        this.setStyle(this.wrapper, ['visibility', 'opacity'], ['hidden', 0]);
        this.curInputData.onClose();
    }

    /**
     * 确认选择
     */
    protected comfirm(value: string): void {
        this.curInputData.inputEle['value'] = this.curInputData.selectedValue = value;
        this.curInputData.onSelect(this.curInputData.selectedValue);
    }



    /**
     * 设置组件主题：颜色/布局
     */
    protected setTheme(color?: string, type?: string): void {

        this.type = type || this.$conf['type'];
        this.themeColor = color || this.$conf['themeColor'];

        this.setStyle(this.pickerInfoContainer, ['backgroundColor'], [this.themeColor]);
        this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
        this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
        this.setStyle(this.nowBtn, ['color'], [this.themeColor]);

        this.setStyle(this.materialPickerContainer, 
            ['flexDirection', 'transform', 'opacity'], 
            [this.type === 'portrait'? 'column': 'row', 'translateY(0)', '1']
        );
        this.setStyle(this.wrapper, ['visibility', 'opacity'], ['visible', 1]);
    }


    /**
     * 根据data-ele属性获取元素
     * @param tag <string> 标签名
     * @param ele <string> data-ele标识
     * @return <Element>
     */
    protected getElement(tag: string, ele: string): Element {
        return document.querySelector(`${tag}[data-ele="${ele}"]`);
    }

    /**
     * 设置元素的style
     * @param ele <Element | EventTarget> 元素 
     * @param styleList Array<string> 要设置的style
     * @param valueList Array<string | number> 要设置的值
     */
    protected setStyle(ele: Element | EventTarget, styleList: Array<string>, valueList: Array<string | number>): void {
        styleList.map((style, i) => ele['style'][style] = valueList[i]);
    }


    /**
     * 获取事件方法
     * @param ele <Element> 响应事件的元素
     * @param eventName <string> 事件名
     */
    protected getMethod(ele: Element, eventName: string) {
        return (date?: string) => {
            this.$methods[ele.getAttribute(eventName)] && this.$methods[ele.getAttribute(eventName)](date);
        }
    }

    /**
     * 收集所有input元素的数据
     * @param inputEle <Element | HTMLElement> input元素
     */
    protected addInputData(inputEle: Element | HTMLElement): void {

        inputEle.setAttribute('data-component-index', this.inputEleindex.toString());

        this.inputDataList.push({
            inputEle: inputEle,
            index: this.inputEleindex,
            
            selectedDate: inputEle['value'],

            themeColor: inputEle.getAttribute('data-color') || this.themeColor,
            type: inputEle.getAttribute('data-type') || this.type,

            onSelect: this.getMethod(inputEle, 'onSelect'),
            onShow: this.getMethod(inputEle, 'onShow'),
            onClose: this.getMethod(inputEle, 'onClose')
        });

        this.inputEleindex++;
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









return class DatePicker extends materialPicker {

    
    //HTML元素-----------------------------------------------
 
    private yearCon: Element = null;
    private monthDateCon: Element = null;
    private monthYearBody: Element = null;
    private calendarBody: Element = null;
    private yearListCon: Element = null;
 

    //今天的日期格子元素
    private todayEle = null;
    //当前input保存这次和上一次选中的元素
    private curSelectDateEle: Element | EventTarget = null;
    private lastSelectDateEle: Element | EventTarget = null;
    //保存当前/上一次选择的年份
    private curSelectYear: Element | EventTarget = null;
    private lastSelectYear: Element | EventTarget = null;
    //上个月/下个月按钮
    private pmBtn: Element = null;
    private nmBtn: Element = null;

    //----------------------------------------------------

    //当前input选中的年月日
    private year: number;
    private month: number;
    private date: number;

    //用作保存当前滚动到的月份/年份
    private tempYear: number;
    private tempMonth: number;


    //今年，今月，今日
    private curYear: number;
    private curMonth: number;
    private curDate: number;



    /**
     * 动画防抖，限制动画频率
     */
    private allowAnimation: boolean = true;


    /**
     * 
     * @param conf 配置项
     */
    constructor(conf?: object) {

        super(conf);

        this.curYear = this.$dateInstance.getFullYear();
        this.curMonth = this.$dateInstance.getMonth() + 1;
        this.curDate = this.$dateInstance.getDate();

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
    private setDate(): void {
    
        this.year = this.tempYear;
        this.month = this.tempMonth;

        this.yearCon.innerHTML = this.year.toString();
        this.monthDateCon['innerHTML'] = `${this.month}月${this.date}日`;
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
     * 解析日期
     */
    private parseDate(date: string): Array<number> {
        return date?  
            [parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2])]:
            [this.curYear, this.curMonth, this.curDate];
    }



    /**
     * 根据input的value，设置组件打开时显示的日期
     */
    private setCurDate() {
        this.year = this.parseDate(this.curInputData.selectedValue)[0];
        this.month = this.parseDate(this.curInputData.selectedValue)[1];
        this.date = this.parseDate(this.curInputData.selectedValue)[2];
    }


    //-------------------工具函数END--------------------------------

    /**
     * 创建keyframe内容
     */
    private createAnimationContext(): Element {
        const styleNode = document.createElement('style'),
              animationContext = `
              @keyframes datepicker-animation-right-1 {
                  from {
                      transform: translateX(0);
                      opacity: 1;
                  }
                  to {
                      transform: translateX(-100%);
                      opacity: 0;
                  }
              }
          
              @keyframes datepicker-animation-right-2 {
                  from {
                      transform: translateX(100%);
                      opacity: 0;
                  }
                  to {
                      transform: translateX(0);
                      opacity: 1;
                  }
              }
          
              @keyframes datepicker-animation-left-1 {
                  from {
                      transform: translateX(0);
                      opacity: 1;
                  }
                  to {
                      transform: translateX(100%);
                      opacity: 0;
                  }
              }
          
              @keyframes datepicker-animation-left-2 {
                  from {
                      transform: translateX(-100%);
                      opacity: 0;
                  }
                  to {
                      transform: translateX(0);
                      opacity: 1
                  }
              }`;

        styleNode.innerHTML = animationContext.replace(/[\r\n]/g, "");

        return styleNode;
    }


    /**
     * 创建年份选择列表
     * @param year <number> 年份
     */
    private createYearList(year: number): Element { 
        const ul = document.createElement('ul');

        this.setStyle(ul, ['width', 'list-style', 'padding', 'margin'], ['100%', 'none', 0, 0]);

        for(let i = this.curYear - 50; i < this.curYear + 50; i++) {
            let li = document.createElement('li');

            this.setStyle(li, 
                ['text-align', 'padding', 'color', 'cursor', 'font-size', 'transition'], 
                ['center', '6px 0 6px 0', '#666', 'pointer', '20px', 'all 0.25s ease']
            );
            li.setAttribute(`data-ele`, `data-year-item-${i}`);
            li.innerHTML = i.toString();

            if(i === year) {
                this.toggleYearFocus(li);
            }

            ul.appendChild(li);
        }

        return ul;
    }


    /**
     * 创建月-年滑块模板
     * @param month <number>
     * @param year <number>
     * @return template <Element>
     */
    private createMonthYearItem(month: number, year: number, dir?: number): Element {

        let translateX: string = '',
            monthYearItem = document.createElement('div');

        if(dir !== undefined) {
            translateX = dir === 0? '-100%': '100%';
        }
        else {
            translateX = '0';
        } 

        monthYearItem.setAttribute('data-ele', `month-year-item-${year}-${month}`);
        monthYearItem.style.cssText = `position: absolute; left: 0; top: 0; transform: translateX(${translateX}); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;`;

        monthYearItem.innerHTML = `${month}月，${year}`;

        return monthYearItem;
    }

    /**
     * 创建日历滑块模板
     * @param month <number>
     * @param year <number>
     * @return template <Element>
     */
    private createCalendarItem(month: number, year: number, dir?: number): Element {
        let startDay: number = new Date(`${year}-${month}-1`).getDay(),
            endDay: number = this.monthDaysCount(month, year),
            translateX: string = '',
            style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;user-select: none;',
            day: number = 0,
            row = Math.ceil((startDay + endDay)/7),
            calendarItem = document.createElement('div');

        
        if(dir !== undefined) {
            translateX = dir === 0? '-100%': '100%';
        }
        else {
            translateX = '0';
        }    
        
        calendarItem.setAttribute('data-ele', `calendar-item-${year}-${month}`);
        this.setStyle(calendarItem, ['position', 'left', 'top', 'transform'], ['absolute', 0, 0, `translateX(${translateX})`]);
        
        for(let j = 0; j < row; j++) {
            let div = document.createElement('div');
            this.setStyle(div, ['display'], ['flex']);
              
            for(let i = 0; i < 7; i ++) {
                
                let span = document.createElement('span');
                span.style.cssText = style;

                if((startDay > i && j === 0) || day >= endDay) {
                    span.setAttribute('data-ele', 'date-item');
                    
                }
                else {
                    day++;
                    span.setAttribute('data-ele', `date-item-${day}`);
                    span.innerHTML = day.toString();

                    if(day === this.date && year === this.year && month === this.month) {
                        this.toggleFocus(span);
                    }

                    if(day === this.curDate && year === this.curYear && month === this.curMonth) {
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
    }

    /**
     * 创建组件的基础HTML模板
     */
    private createContainer(): Element {
        const div = document.createElement('div'),
              template = `
                <div data-ele="wrapper" style="box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; visibility: hidden; opacity: 0; transition: all 0.2s ease;">
                    <div style="display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);">
                        <div data-ele="material-picker-container" style="display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease; transform: translateY(-30%); opacity: 0;">
                            
                            <div data-ele="picker-info-container" style="padding: 20px;color: #fff;box-sizing: border-box;align-items: stretch;">
                                <div data-ele="year" style="margin-bottom: 14px;color: rgba(255, 255, 255, 0.7);cursor: pointer; transition: all 0.2s ease;"></div>
                                <div data-ele="month-date" style="color: #fff;font-size: 32px; width: 140px;transition: all 0.2s ease;"></div>
                            </div>
                
                            <div data-ele="picker-body-container" style="display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch; position: relative;">
                                <div style="display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);">
                                    
                                    <button data-ele="btn-pm" style="outline: none;border: none;cursor: pointer; background-color: transparent;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                                        </svg>
                                    </button>

                                    <div data-ele="month-year-body" style="overflow: hidden; position: relative; width: 140px; height: 28px;"></div>

                                    <button data-ele="btn-nm" style="outline: none;border: none;cursor: pointer;background-color: transparent;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                                        </svg>
                                    </button>

                                </div>
                
                                <div>
                                    <div style="display: flex;justify-content: space-around;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5);">
                                        <span>日</span>
                                        <span>一</span>
                                        <span>二</span>
                                        <span>三</span>
                                        <span>四</span>
                                        <span>五</span>
                                        <span>六</span>
                                    </div>
                
                                    <div data-ele="calendar-body" style="overflow: hidden;position: relative; width: 280px; height: 240px;"></div>
                                </div>
                
                                <div style="display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;">
                                    <button data-ele="btn-now" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">今天</button>
                                    <div style="display: flex; width: 40%; justify-content: space-between; align-items: center;">
                                        <button data-ele="btn-close" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">关闭</button>
                                        <button data-ele="btn-comfirm" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">确定</button>
                                    </div>
                                </div>

                                <div data-ele="year-list-con" style="position: absolute; width: 100%; height: 100%; visibility: hidden; background-color: #fff; transition: all 0.15s ease; left: 0; overflow: auto;">

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

        this.materialPickerContainer.addEventListener('click', e => {
            e.stopPropagation();

            if(this.isUnselectDateEle(e.target)) {
                this.toggleFocus(e.target);
                this.setDate();
            }
        });
    }


    /**
     * 鼠标日期悬浮效果
     */
    private hover(): void {

        this.materialPickerContainer.addEventListener('mouseover', e => {
            e.stopPropagation();

            if(this.isUnselectDateEle(e.target)) {
                this.setStyle(e.target, ['backgroundColor', 'opacity', 'color'], [this.themeColor, 0.65, '#fff']);
            }
        });

        this.materialPickerContainer.addEventListener('mouseout', e => {
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
     * 确认年份选择
     */
    private selectYear(): void {
        this.yearListCon.addEventListener('click', e => {
            e.stopPropagation();

            if(e.target['getAttribute']('data-ele').indexOf('data-year-item') > -1) {
                this.toggleYearFocus(e.target);

                this.renderPanel();
                this.setDate();
                this.yearListClose();
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
     * 高亮某个日期格子
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
    }
    

    private toggleYearFocus(ele): void {
        this.curSelectYear = ele;

        if(this.lastSelectYear) {
            this.setStyle(this.lastSelectYear, ['color', 'font-size'], ['#666', '20px']);
        }

        this.setStyle(this.curSelectYear, ['color', 'font-size'], [this.themeColor, '28px']);

        this.lastSelectYear = this.curSelectYear;
        
        this.year = parseInt(ele['innerHTML']);
    }


    /**
     * 渲染组件部分内容
     */
    private renderPanel(): void {

        this.tempMonth = this.month;
        this.tempYear = this.year;

        this.monthYearBody.innerHTML = '';
        this.calendarBody.innerHTML = '';
        this.monthYearBody.appendChild(this.createMonthYearItem(this.month, this.year));
        this.calendarBody.appendChild(this.createCalendarItem(this.month, this.year));
    }

    /**
     * 滑动切换当前月
     * @param <number> dir: 0左方向，1右方向
     */
    private slideMonths(dir: number) {
        
        if(!this.allowAnimation) return;
        this.allowAnimation = false;

        let animationInfo: string = '450ms cubic-bezier(0.23, 1, 0.32, 1) forwards';

        //向右
        if(dir) {
            if(this.tempMonth < 12) {
                this.tempMonth++;
            }
            else {
                this.tempMonth = 1;
                this.tempYear++;
            } 
        }
        //向左
        else {
            if(this.tempMonth > 1) {
                this.tempMonth--;
            }
            else {
                this.tempMonth = 12;
                this.tempYear--;
            }
        }

        this.monthYearBody.appendChild(this.createMonthYearItem(this.tempMonth, this.tempYear, dir));
        this.calendarBody.appendChild(this.createCalendarItem(this.tempMonth, this.tempYear, dir));

        //向右
        if(dir) {
            this.setStyle(this.monthYearBody.children[0], ['animation'], [`datepicker-animation-right-1 ${animationInfo}`]);
            this.setStyle(this.monthYearBody.children[1], ['animation'], [`datepicker-animation-right-2 ${animationInfo}`]);
            this.setStyle(this.calendarBody.children[0], ['animation'], [`datepicker-animation-right-1 ${animationInfo}`]);
            this.setStyle(this.calendarBody.children[1], ['animation'], [`datepicker-animation-right-2 ${animationInfo}`]);
        }
        //向左
        else {
            this.setStyle(this.monthYearBody.children[0], ['animation'], [`datepicker-animation-left-1 ${animationInfo}`]);
            this.setStyle(this.monthYearBody.children[1], ['animation'], [`datepicker-animation-left-2 ${animationInfo}`]);
            this.setStyle(this.calendarBody.children[0], ['animation'], [`datepicker-animation-left-1 ${animationInfo}`]);
            this.setStyle(this.calendarBody.children[1], ['animation'], [`datepicker-animation-left-2 ${animationInfo}`]);
        }

        /**
         * 动画结束后，删除多余的元素，将动画防抖标准设置为true，表示可以继续动画
         */
        this.monthYearBody.firstChild.addEventListener('animationend', e => {
            this.monthYearBody.removeChild(this.monthYearBody.children[0]);
            this.calendarBody.removeChild(this.calendarBody.children[0]);

            this.allowAnimation = true;
        });
    }

    /**
     * 回到今天函数
     */
    private toToday() {
        let dir: number;

        if(this.tempYear < this.curYear) {
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
            if(this.tempMonth < this.curMonth) {
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

        if(dir !== undefined) {
            dir === 0? this.pmBtn['click'](): this.nmBtn['click']();
        }

        this.setDate();
    }

    /**
     * 关闭年份选择列表
     */
    private yearListClose() {
        this.setStyle(this.yearCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
        this.setStyle(this.monthDateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '32px', 'auto']);

        this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['hidden', 0]); 
    }   

    /**
     * 打开年份选择列表
     */
    private yearListShow() {
        let toYearEle = this.getElement('li', `data-year-item-${this.year}`);

        this.yearListCon.scrollTop = toYearEle['offsetTop'] - this.yearListCon['offsetHeight']/2 + 20;

        this.toggleYearFocus(toYearEle);

        this.setStyle(this.yearCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '32px', 'auto']);
        this.setStyle(this.monthDateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);

        this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['visible', 1]); 
    }


    /**
     * 生命周期函数-----------------------------------------------------
     */



    /**
     * 组件初始化
     * 将模板插入到页面
     * 为一些元素绑定事件,标识今天等
     */
    protected init(): void {

        //首先将模板插入body
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
        //将动画插入到一个style标签
        document.querySelector('head').appendChild(this.createAnimationContext());

        this.wrapper = this.getElement('div', 'wrapper'),
        this.materialPickerContainer = this.getElement('div', 'material-picker-container');
        this.pickerInfoContainer = this.getElement('div', 'picker-info-container');
        this.yearCon = this.getElement('div', 'year');
        this.monthDateCon = this.getElement('div', 'month-date');
        this.monthYearBody = this.getElement('div', 'month-year-body');

        this.calendarBody = this.getElement('div', 'calendar-body');
        this.yearListCon = this.getElement('div', 'year-list-con');

        this.closeBtn = this.getElement('button', 'btn-close');
        this.comfirmBtn = this.getElement('button', 'btn-comfirm');
        this.nowBtn = this.getElement('button', 'btn-now');

        this.pmBtn = this.getElement('button', 'btn-pm');
        this.nmBtn = this.getElement('button', 'btn-nm');


        this.setCurDate();

        this.renderPanel();
        this.yearListCon.appendChild(this.createYearList(this.year));

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

        //确认选择
        this.comfirmBtn.addEventListener('click', e => {
            this.comfirm(`${this.year}-${this.month}-${this.date}`);
            this.close();
        });

        //回到今天
        this.nowBtn.addEventListener('click', e => {
            this.toToday();
        });


        /**
         * 为两个切换月份的按钮添加功能
         */
        this.nmBtn.addEventListener('click', e => {
            this.slideMonths(1);
        });

        this.pmBtn.addEventListener('click', e => {
            this.slideMonths(0);
        });


        /**
         * 点击年份显示年份选择列表
         */
        this.yearCon.addEventListener('click', e => {
            this.yearListShow();
        });
        /**
         * 点击月份关闭年份选择列表
         */
        this.monthDateCon.addEventListener('click', e => {
            this.yearListClose();
        });


        //悬浮日期
        this.hover();

        //点击选择日期
        this.select();

        //点击选择年份
        this.selectYear();
    }




    // //---------------暴露API----------------------



    /**
     * 组件显示
     * @param color <string> 主题色
     * @param type <string> 布局类型
     */
    public show(color?: string, type?: string) {
        
        //设置外观
        this.setTheme(color, type);

        //获取value的日期并应用到组件
        this.setCurDate();

        console.log(this.month);

        //渲染面板
        this.renderPanel();

        //高亮选中的日期
        this.toggleFocus(this.getElement('span', `date-item-${this.date}`));

        //设置组件的选择日期为input选择的
        this.setDate();
        
        //响应事件onShow
        this.curInputData.onShow();
    }

}


















})(window);










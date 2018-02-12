

const {DatePicker, TimePicker} = (function(window) {


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

    //是否使用24小时制（仅在TimePicker中生效）
    format?: string;

    //事件函数
    onSelect(date: string);
    onShow();
    onClose();
}




class MaterialPicker {
    
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

    //--------------------------------------------------------

    //保存Date对象的实例
    protected $dateInstance: Date = null;
    //最终生成插入到input的值
    protected value: string;


    //当前的主题色
    protected themeColor: string;
    //当前的布局
    protected type: string;
    //当前时间制格式
    protected format: string;
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

    constructor(className: string, conf?: object) {
        this.$dateInstance = new Date();

        //默认配置
        this.$conf = {
            themeColor: 'rgba(46, 152, 136, 1)',
            type: 'portrait',
            format: '24hr',
            directive: className === 'DatePicker'? 'date-picker': 'time-picker'
        };

        this.curInputData = {
            inputEle: null,
            index: -1,
            selectedValue: '',
            themeColor: this.$conf['themeColor'],
            type: this.$conf['type'],
            format: '24hr',
            onSelect: () => {},
            onShow: () => {},
            onClose: () => {}
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

        setTimeout(() => {
            this.setStyle(this.wrapper, ['display'], ['none']);
        }, 200);

        this.curInputData.onClose();

        this.curInputData = {
            inputEle: null,
            index: -1,
            selectedValue: '',
            themeColor: this.$conf['themeColor'],
            type: this.$conf['type'],
            format: '24hr',
            onSelect: () => {},
            onShow: () => {},
            onClose: () => {}
        };
    }

    /**
     * 确认选择
     */
    public comfirm(fn?: Function): void {
        if(this.curInputData.inputEle) {
            this.curInputData.inputEle['value'] = this.curInputData.selectedValue = this.value;
            this.curInputData.onSelect(this.curInputData.selectedValue);

            if(fn && typeof fn === 'function') {
                fn(this.value);
            }
        }
    }



    /**
     * 设置组件主题：颜色/布局
     */
    protected setTheme(color?: string, type?: string, format?: string): void {

        this.type = type || this.$conf['type'];
        this.themeColor = color || this.$conf['themeColor'];
        this.format = format || this.$conf['format'];

        this.setStyle(this.pickerInfoContainer, ['backgroundColor'], [this.themeColor]);
        this.setStyle(this.closeBtn, ['color'], [this.themeColor]);
        this.setStyle(this.comfirmBtn, ['color'], [this.themeColor]);
        this.setStyle(this.nowBtn, ['color'], [this.themeColor]);

        this.setStyle(this.materialPickerContainer, ['flexDirection'], [this.type === 'portrait'? 'column': 'row']);
        
        this.setStyle(this.wrapper, ['display'], ['block']);
        setTimeout(() => {
            this.setStyle(this.materialPickerContainer, ['transform', 'opacity'], ['translateY(0)', '1']);
            this.setStyle(this.wrapper, ['visibility', 'opacity'], ['visible', 1]);
        }, 0);
    }


    /**
     * 兼容的事件绑定封装
     * @param ele <Element> 要绑定事件的元素
     * @param event <string> 事件名称
     * @param fn <e => void> 要绑定的事件的内容
     */
    protected addEvent(ele: Element | Node, event: string, fn: (target, x?: number, y?: number) => void) {
        let target = null,
            x: number = 0,
            y: number = 0;

        //若是点击，再为移动端绑定touch事件
        if(event === 'click') {
            this.addEvent(ele, 'touchend', fn);
        }

        if(event === 'mousedown') {
            this.addEvent(ele, 'touchstart', fn);
        }

        if(event === 'mousemove') {
            this.addEvent(ele, 'touchmove', fn);
        }

        if(event === 'mouseup') {
            this.addEvent(ele, 'touchend', fn);
        }

        ele.addEventListener(event, e => {
            e = e || window.event;

            target = e.target || e.srcElement;

            e.stopPropagation();
            e.preventDefault();

            //获取鼠标/触摸坐标
            if(event === 'touchstart' || event === 'touchmove') {
                x = e['touches'][0].pageX;
                y = e['touches'][0].pageY;
            }
            else {
                x = e['clientX'];
                y = e['clientY'];
            }

            fn(target, x, y);
        });
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
            
            selectedValue: inputEle['value'],

            themeColor: inputEle.getAttribute('data-color') || this.themeColor,
            type: inputEle.getAttribute('data-type') || this.type,

            format: inputEle.getAttribute('data-format'),

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



class DatePicker extends MaterialPicker {

    
    //HTML元素-----------------------------------------------
 
    private yearCon: Element = null;
    private monthCon: Element = null;
    private dateCon: Element = null;
    private monthDateCon: Element = null;
    private monthYearBody: Element = null;
    private calendarBody: Element = null;
    private yearListCon: Element = null;
    private weekdayCon: Element = null;
 

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

    //当前input选中的年月日星期
    private year: number;
    private month: number;
    private date: number;
    protected weekday: number;

    //用作保存当前滚动到的月份/年份
    private tempYear: number;
    private tempMonth: number;


    //今年，今月，今日,今星期几
    private curYear: number;
    private curMonth: number;
    private curDate: number;
    private curWeekday: number;

    //中文数字列表
    private ZNlist: Array<string>;

    /**
     * 动画防抖，限制动画频率
     */
    private allowAnimation: boolean = true;


    /**
     * 
     * @param conf 配置项
     */
    constructor(conf?: object) {
        super('DatePicker', conf);

        this.curYear = this.$dateInstance.getFullYear();
        this.curMonth = this.$dateInstance.getMonth() + 1;
        this.curDate = this.$dateInstance.getDate();
        this.curWeekday = this.$dateInstance.getDay();

        this.ZNlist = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

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
        this.weekday = this.date2weekday(this.year, this.month, this.date);

        this.value = `${this.year}-${this.month}-${this.date}`;

        this.yearCon.innerHTML = this.year.toString();
        this.monthCon.innerHTML = this.number2ZN(this.month) + '月';
        this.dateCon.innerHTML = this.date.toString();
        this.weekdayCon.innerHTML = '周' + this.number2ZN(this.weekday);
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
     * 将阿拉伯数字转换成为汉字
     * @param n <number> 要转换的数字
     */
    private number2ZN(n: number): string {
        return this.ZNlist[n];
    }

    /**
     * 算出某天是星期几
     * @param date <string> 要算的日期，格式：年-月-日
     */
    private date2weekday(year: number, month: number, date: number): number {
        return new Date(year, month, date).getDay();
    }


    /**
     * 根据input的value，设置组件打开时显示的日期
     */
    private setCurDate() {
        this.$dateInstance = new Date();

        this.curYear = this.$dateInstance.getFullYear();
        this.curMonth = this.$dateInstance.getMonth() + 1;
        this.curDate = this.$dateInstance.getDate();
        this.curWeekday = this.$dateInstance.getDay();

        this.year = this.parseDate(this.curInputData.selectedValue)[0];
        this.month = this.parseDate(this.curInputData.selectedValue)[1];
        this.date = this.parseDate(this.curInputData.selectedValue)[2];
        this.weekday = this.date2weekday(this.year, this.month, this.date);
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
        let startDay: number = this.date2weekday(year, month, 1),
            endDay: number = this.monthDaysCount(month, year),
            translateX: string = '',
            style = 'display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 12px;border-radius: 20px;cursor: pointer;user-select: none;-ms-user-select: none;',
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
                <div data-ele="wrapper-d" style="box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; visibility: hidden; opacity: 0; transition: all 0.2s ease;">
                    <div style="display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);">
                        <div data-ele="material-picker-container-d" style="display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease; transform: translateY(-30%); opacity: 0;">
                            
                            <div data-ele="picker-info-container-d" style="color: #fff;box-sizing: border-box;align-items: stretch; display: flex; flex-direction: column; justify-content: space-between; position: relative; align-items: stretch;">
                                <div data-ele="weekday" style="padding: 10px 0 10px 0; background-color: rgba(0, 0, 0, 0.2); text-align: center; color: rgba(255, 255, 255, 0.8);"></div>
                                <div style="padding:20px; width: 140px; align-self: center; flex-grow: 1; display:flex; flex-direction: column;">
                                    <div data-ele="month-date">
                                        <div data-ele="month" style="text-align: center;font-size: 24px; transition: all 0.2s ease;"></div>
                                        <div data-ele="date" style="color: #fff;font-size: 76px; font-weight: 900;transition: all 0.2s ease;text-align: center; padding: 0 0 12px 0;"></div>
                                    </div>
                                    <div data-ele="year" style="color: rgba(255, 255, 255, 0.7);cursor: pointer; transition: all 0.2s ease;text-align: center;"></div>
                                </div>
                            </div>
                
                            <div data-ele="picker-body-container-d" style="display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch; position: relative;">
                                <div style="display: flex;justify-content: space-around;align-items: center;font-size: 14px;font-weight: 900;height: 48px;color: rgba(0, 0, 0, 0.7);">
                                    
                                    <button data-ele="btn-pm" style="outline: none;border: none;cursor: pointer; background-color: transparent;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px; -ms-user-select: none;user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                                        </svg>
                                    </button>

                                    <div data-ele="month-year-body" style="overflow: hidden; position: relative; width: 140px; height: 28px;"></div>

                                    <button data-ele="btn-nm" style="outline: none;border: none;cursor: pointer;background-color: transparent;">
                                        <svg viewBox="0 0 24 24" style="display: inline-block; color: rgba(0, 0, 0, 0.87); fill: currentcolor; height: 24px; width: 24px;-ms-user-select: none; user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                                        </svg>
                                    </button>

                                </div>
                
                                <div>
                                    <div style="display: flex;height: 20px;font-size: 12px;color: rgba(0, 0, 0, 0.5); text-align: center;">
                                        <div style="width: 40px;">日</div>
                                        <div style="width: 40px;">一</div>
                                        <div style="width: 40px;">二</div>
                                        <div style="width: 40px;">三</div>
                                        <div style="width: 40px;">四</div>
                                        <div style="width: 40px;">五</div>
                                        <div style="width: 40px;">六</div>
                                    </div>
                
                                    <div data-ele="calendar-body" style="overflow: hidden;position: relative; width: 280px; height: 240px;"></div>
                                </div>
                
                                <div style="display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;">
                                    <button data-ele="btn-now-d" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">今天</button>
                                    <div style="display: flex; width: 40%; justify-content: space-between; align-items: center;">
                                        <button data-ele="btn-close-d" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">关闭</button>
                                        <button data-ele="btn-comfirm-d" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">确定</button>
                                    </div>
                                </div>

                                <div data-ele="year-list-con" style="position: absolute; width: 100%; height: 100%; visibility: hidden; background-color: #fff; transition: all 0.15s ease; left: 0; top: 0; overflow: auto;">

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
        this.addEvent(this.materialPickerContainer, 'click', target => {
            if(this.isUnselectDateEle(target)) {
                this.toggleFocus(target);
                this.setDate();
            }
        });
    }


    /**
     * 鼠标日期悬浮效果
     */
    private hover(): void {

        this.addEvent(this.materialPickerContainer, 'mouseover', target => {
            if(this.isUnselectDateEle(target)) {
                this.setStyle(target, ['backgroundColor', 'opacity', 'color'], [this.themeColor, 0.65, '#fff']);
            }
        });


        this.addEvent(this.materialPickerContainer, 'mouseout', target => {
            if(this.isUnselectDateEle(target)) {
                this.setStyle(
                    target, 
                    ['backgroundColor', 'opacity', 'color'], 
                    ['#fff', 1, target['getAttribute']('data-today')? this.themeColor: '#000']
                );
            }
        });
    }

    /**
     * 确认年份选择
     */
    private selectYear(): void {
        this.addEvent(this.yearListCon, 'click', target => {
            if(target['getAttribute']('data-ele').indexOf('data-year-item') > -1) {
                this.toggleYearFocus(target);

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
        this.addEvent(this.monthYearBody.firstChild, 'animationend', t => {
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
        this.setStyle(this.monthCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '24px', 'auto']);
        this.setStyle(this.dateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '76px', 'auto']);

        this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['hidden', 0]); 
    }   

    /**
     * 打开年份选择列表
     */
    private yearListShow() {
        let toYearEle = this.getElement('li', `data-year-item-${this.year}`);

        this.yearListCon.scrollTop = toYearEle['offsetTop'] - this.yearListCon['offsetHeight']/2 + 20;

        this.toggleYearFocus(toYearEle);

        this.setStyle(this.yearCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 1)', '36px', 'auto']);
        this.setStyle(this.monthCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '16px', 'pointer']);
        this.setStyle(this.dateCon, ['color', 'font-size', 'cursor'], ['rgba(255, 255, 255, 0.7)', '36px', 'pointer']);

        this.setStyle(this.yearListCon, ['visibility', 'opacity'], ['visible', 1]); 
    }


    /**
     * 生命周期函数-----------------------------------------------------
     */



    /**
     * 组件初始化,工作内容：
     * - 将模板插入到页面
     * - 获取需要的元素
     * - 为元素绑定事件
     */
    protected init(): void {

        //首先将模板插入body
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);
        //将动画插入到一个style标签
        document.querySelector('head').appendChild(this.createAnimationContext());

        /**
         * -------------------获取元素-------------------------------
         */
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


        /**
         * -----------------事件绑定------------------------
         */

        //点击input显示组件
        this.inputList.map(ele => {
            this.addEvent(ele, 'focus', t => {
                //将this.curInputData设置为当前选中的input
                this.curInputData = this.inputDataList[parseInt(ele.getAttribute('data-component-index'))];

                //显示组件
                this.show(this.curInputData.themeColor, this.curInputData.type);

                ele.setAttribute('readonly', 'readonly');
            });

        });


        //点击wrapper关闭组件
        this.addEvent(this.wrapper, 'click', t => {
            this.close();
        });


        //点击取消按钮关闭组件
        this.addEvent(this.closeBtn, 'click', t => {
            this.close();
        });


        //确认选择
        this.addEvent(this.comfirmBtn, 'click', t => {
            this.comfirm();
            this.close();
        });


        //回到今天
        this.addEvent(this.nowBtn, 'click', t => {
            this.toToday();
        });




        /**
         * 为两个切换月份的按钮添加功能
         */
        this.addEvent(this.nmBtn, 'click', t => {
            this.slideMonths(1);
        });

        this.addEvent(this.pmBtn, 'click', t => {
            this.slideMonths(0);
        });

        /**
         * 点击年份显示年份选择列表
         */

        this.addEvent(this.yearCon, 'click', target => {
            this.yearListShow();
        });

        /**
         * 点击月份关闭年份选择列表
         */
        this.addEvent(this.monthDateCon, 'click', target => {
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

        //重新渲染面板
        this.renderPanel();

        //设置组件的面板显示的日期为input选择的
        this.setDate();
        
        //响应事件onShow
        this.curInputData.onShow();
    }
}



/**
 * 每个时钟的元素
 */
interface clockInfo {
    //时钟圆盘的html元素
    clock: Element;
    //24时钟圆盘的html元素
    clock24?: Element;
    //时钟指针的html元素
    clockPointer: Element;
    //时钟顶点的html元素
    clockPointerPeak: Element;
    //时钟指针转轴html元素
    clockPointerCenter: Element;
    //时钟类型名称
    type: string;
    //时钟刻度的html元素
    itemList: object;
    //时钟刻度间隔（单位：度数）
    interval: number;
    //显示时钟数字的html元素
    viewEle: Element;
    //当前时间的HTML元素
    curEle: Element;
    //当前指向的刻度元素
    curSelectClockItem: Element;
    //上一次指向的刻度元素
    lastSelectClockItem: Element;
};

/**
 * 坐标
 */
interface P {
    x: number;
    y: number;
}


class TimePicker extends MaterialPicker {


    /**
     * -----------HTML元素-----------------
     */
    private hourCon: Element = null;
    private minuteCon: Element = null;

    private meridiemCon: Element = null;
    private amCon: Element = null;
    private pmCon: Element = null;

    /**
     * 小时时钟和分钟时钟的信息
     */
    private hourClock: clockInfo = {
        clock: null,
        clock24: null,
        clockPointer: null,
        clockPointerPeak: null,
        clockPointerCenter: null,
        type: 'hour',
        itemList: {},
        interval: 360/12,
        viewEle: null,
        curEle: null,
        curSelectClockItem: null,
        lastSelectClockItem: null
    };
    private minuteClock: clockInfo = {
        clock: null,
        clockPointer: null,
        clockPointerPeak: null,
        clockPointerCenter: null,
        type: 'minute',
        itemList: {},
        interval: 360/60,
        viewEle: null,
        curEle: null,
        curSelectClockItem: null,
        lastSelectClockItem: null
    };




    /**
     * ----------------------------------
     */


    /**
     * 当前时/分/上下午
     */
    private curHour: number;
    private curMinute: number;
    private curMeridiem: string;

    /**
     * 选择的时/分/上下午
     */
    private hour: number;
    private minute: number;
    private meridiem: string;

    //时钟圆盘的中点坐标
    private centerX: number;
    private centerY: number;

    //当前鼠标离时钟圆盘的中点的距离
    private distance: number;

    /**
     * 标志变量：<boolean> 用作判断是否按下鼠标左键
     * true: 按下
     * false: 松开
     */
    private clickFlag: boolean;
    //private minuteClockFlag: boolean;


    //当前/上一次指向的时钟刻度（高亮）
    private curClockItem: Element;
    private lastClockItem: Element;

    //当前/上一次选择的am/pm
    private curMeridiemEle: Element;
    private lastMeridiemEle: Element;


    constructor(conf?: object) {
        super('TimePicker', conf);

        this.curHour = this.$dateInstance.getHours();
        this.curMinute = this.$dateInstance.getMinutes();
        this.curMeridiem = this.curHour > 12? 'pm': 'am';

        this.centerX = 260/2;
        this.centerY = 260/2;

        this.curClockItem = this.lastClockItem = null;
        this.curMeridiemEle = this.lastMeridiemEle = null;

        //初始化
        this.init();
    }


    /**
     * 创建模板---------------------------------------------------------------------------
     */


    private createMeridiemCon(): Element {
        const div = document.createElement('div'),
              template = `
                <div style="font-size: 22px; margin-left: 12px;">
                    <div data-ele="am" style="margin-bottom: 4px; cursor: pointer;color: rgba(255, 255, 255, 0.6);">AM</div>
                    <div data-ele="pm" style="cursor: pointer;color: rgba(255, 255, 255, 0.6);">PM</div>
                </div>
              `;
        
        div.innerHTML = template; 
        
        return div.children[0];
    }


    private createPointer(clock: clockInfo): Element {
        const pointer = document.createElement('div'),
              center = document.createElement('div'),
              peak = document.createElement('div');

        this.setStyle(
            pointer, 
            ['position', 'width', 'height', 'top', 'left', 'transform-origin'],
            ['absolute', '4px', '42%', '8%', 'calc(50% - 2px)', 'center bottom']
        );      
        
        this.setStyle(
            center, 
            ['position', 'width', 'height', 'top', 'left', 'border-radius'],
            ['absolute', '8px', '8px', 'calc(100% - 4px)', '-2px', '50%']
        );

        this.setStyle(
            peak, 
            ['position', 'width', 'height', 'background-color', 'top', 'left', 'border-radius', 'box-sizing'],
            ['absolute', '16px', '16px', '#FFF', '-8px', '-6px', '50%', 'border-box']
        );

        clock.clockPointer = pointer;
        clock.clockPointerCenter = center;
        clock.clockPointerPeak = peak;

        pointer.appendChild(center);
        pointer.appendChild(peak);

        return pointer;
    }


    /**
     * 创建一个时钟圆盘
     * @param radius 圆盘半径 
     * @param start 最大值
     * @param end 最小值
     * @param step 间隔区间值
     */
    private createClock(radius: number, start: number, end: number, step: number): Element {
        let div = document.createElement('div'),
            curAngle = 0,
            angle = 2*Math.PI/12,
            r = radius/2 - 20;

        this.setStyle(div, 
            ['position', 'width', 'height', 'border-radius', 'background-color', 'top', 'left'], 
            ['absolute', '100%', '100%', '50%', '#eee', 0, 0]
        );

        for(let i = 12, j = end; i > 0 && j > start; i --, j -= step) {
            let clockItem = document.createElement('div'),
                x = 0,
                y = 0;

            curAngle = angle*i;
            x = r*Math.sin(curAngle);
            y = -1*r*Math.cos(curAngle);

            this.setStyle(clockItem, 
                ['position', 'width', 'height', 'text-align', 'line-height', 'color', 'transform-origin', 'left', 'top', 'font-size', 'border-radius', 'z-index', 'user-select', '-ms-user-select'],
                ['absolute', '30px', '30px', 'center', '30px', '#666', '50% 50%', 'calc(50% - 15px)', 'calc(50% - 15px)', '16px', '50%', 10, 'none', 'none']
            );

            this.setStyle(clockItem, 
                ['transform'], 
                [`translate(${x}px, ${y}px)`]
            );

            end !== 60?
                clockItem.setAttribute('data-ele', `hourclock-item-${j === 60? 0: j}`):
                clockItem.setAttribute('data-ele', `minuteclock-item-${j === 60? 0: j}`);
            
            clockItem.innerHTML = j === 60? '00': j.toString();

            div.appendChild(clockItem);
        }     

        return div;
    }    
     


    private createContainer(): Element {
        const div = document.createElement('div'),
              template = `
              <div data-ele="wrapper-t" style="visibility: hidden; opacity: 0; box-sizing: border-box; position: absolute; top: 0;left: 0;width: 100%; height: 100vh; transition: all 0.2s ease;">
                <div style="display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);">
                    <div data-ele="material-picker-container-t" style="transform: translateY(-30%); opacity: 0;display: flex;box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); transition: all 0.35s ease;">
                        <div data-ele="picker-info-container-t" style="padding: 20px; color: #fff;box-sizing: border-box;align-items: stretch; display: flex; justify-content: center; align-items: center;">
                            <div style="display: flex;font-size: 56px;width: 150px; justify-content: center;">
                                <div data-ele="hour" style="cursor: pointer;"></div>
                                <div style="color: rgba(255, 255, 255, 0.6);">:</div>
                                <div data-ele="minute" style="cursor: pointer;"></div>
                            </div>
                            <div data-ele="meridiem-con"></div>
                        </div>

                        <div data-ele="picker-body-container-t" style="display: flex;flex-direction: column;justify-content: space-between;padding: 0 8px 0 8px;box-sizing: border-box;background-color: #fff;align-items: stretch; position: relative;">
                            
                            <div data-ele="clock-container" style="padding: 20px 0 20px 0;">
                                <div>
                                    <div data-ele="hour-clock" style="width: 260px; height: 260px; display: flex; justify-content: center; align-items: center;position: relative;visibility: hidden; opacity: 0;transition: all 0.2s ease;">
                                        <div data-ele="hour-clock-24" style="width: 180px; height: 180px;position: absolute;top:40px; left:40px;"></div>
                                    </div>

                                    <div data-ele="minute-clock" style="width: 260px; height: 260px; top: 20px; left: 8px; position:absolute;visibility: hidden; opacity: 0;transition: all 0.2s ease;"></div>
                                </div>
                            </div>

                            <div style="display: flex;justify-content: space-between;align-items: center; padding: 8px 0 8px 0;">
                                <button data-ele="btn-now-t" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">现在</button>
                                <div style="display: flex; width: 40%; justify-content: space-between; align-items: center;">
                                    <button data-ele="btn-close-t" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">关闭</button>
                                    <button data-ele="btn-comfirm-t" style="background-color: transparent;width: 64px;height: 36px;outline: none;border: none;font-size: 14px;cursor: pointer;">确定</button>
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
     * 功能函数---------------------------------------------------------------------------
     */


    private getClockItemList() {
        for(let i = 0; i < 24; i++) {
            this.hourClock.itemList[i*this.hourClock.interval] = this.getElement('div', `hourclock-item-${this.angle2Time(this.hourClock, i*this.hourClock.interval)}`);
        }

        for(let i = 0; i < 60; i+=5) {
            this.minuteClock.itemList[i*this.minuteClock.interval] = this.getElement('div', `minuteclock-item-${i}`);
        }
    }

    /**
     * 角度转时间
     * @param angle 角度
     * @param interval 时间间隔 
     */
    private angle2Time(clock: clockInfo, angle: number): number {
        if(clock.type === 'hour') {
            if(angle === 0) return 12;
            else if(angle === 360) return 24;
            else return angle/clock.interval;
        }
        else {
            return angle/clock.interval;
        }
    }


    /**
     * 坐标转换成角度
     * @param x 横轴
     * @param y 纵轴
     * @param step 跨度
     */
    private XY2angle(x: number, y: number, step: number): number {
        let n = 0,
            length = 0,
            angle = 0;

        n = (x - this.centerX) > 0? 1: -1;

        this.distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));

        angle = n*180/Math.PI*Math.acos((this.centerY - y)/this.distance);

        angle = angle > 0? angle: (360 + angle);

        return Math.round(angle/step)*step === 360? 0: Math.round(angle/step)*step;
    }



    /**
     * 页面坐标转换为时钟内坐标
     */
    private transformXY(x: number, y: number): P {
        return {
            x: Math.floor(x - this.hourClock.clock.getBoundingClientRect().left),
            y: Math.floor(y - this.hourClock.clock.getBoundingClientRect().top),
        };
    }


    /**
     * 解析时间格式
     */
    private parseDate(time) {
        let value = [];

        if(time) {
            this.format === 'ampm' && (this.meridiem = time.split(':')[1].split(' ')[1].toLowerCase());
            value = [parseInt(time.split(':')[0]), parseInt(time.split(':')[1])];
        }
        else {
            value = [this.curHour, this.curMinute];
            this.meridiem = this.curMeridiem;
        }

        return value;
    } 


     /**
     * 根据input的value，设置组件打开时显示的时间
     */
    private getTime() {
        this.$dateInstance = new Date();

        this.curHour = this.$dateInstance.getHours();
        this.curMeridiem = this.curHour > 12? 'pm': 'am';

        this.curHour = this.curHour === 0? 24: this.curHour; 
        this.curHour = 
            this.format === '24hr'? 
            this.curHour: 
            this.curHour > 12? this.curHour - 12: this.curHour;

        this.curMinute = this.$dateInstance.getMinutes();
        
        this.hour = this.parseDate(this.curInputData.selectedValue)[0];
        this.minute = this.parseDate(this.curInputData.selectedValue)[1];
        
        if(this.format === '24hr') {
            this.distance = this.hour > 12? 70: 100;
        }
    }


    /**
     * 这种组件全局时间为选择的时间
     */
    private setTime() {
        let min: string = this.minute < 10? '0' + this.minute: this.minute.toString();

        this.value = 
            this.format === '24hr'? 
            `${this.hour}:${min}`: 
            `${this.hour}:${min} ${this.meridiem}`;

        this.hourCon.innerHTML = this.hour < 10? '0' + this.hour.toString(): this.hour.toString();
        this.minuteCon.innerHTML = min;
    }


    //回到现在 
    private toNow() {

        if(this.format === '24hr') {
            this.distance = this.curHour > 12? 70: 100;
        }
        else {
            this.toggleFocusMeridiem(this[`${this.curMeridiem}Con`]);
        }

        this.setPointerRotate(this.hourClock, this.hourClock.interval*(this.curHour%12));
        this.setPointerRotate(this.minuteClock, this.minuteClock.interval*this.curMinute);

        this.setTime();
    }
    

    //重新渲染面板
    private renderPanel() {

        //若不是24小时制，则渲染am，pm
        if(this.format === 'ampm') {
            this.setStyle(this.meridiemCon, ['display'], ['block']);
            this.setStyle(this.hourClock.clock24, ['display'], ['none']);
        }
        //若是，则渲染12-24小时时钟圆盘
        else {
            this.setStyle(this.meridiemCon, ['display'], ['none']);
            this.setStyle(this.hourClock.clock24, ['display'], ['block']);
        }
        
        this.format === 'ampm' && this.toggleFocusMeridiem(this[`${this.meridiem}Con`]);

        /**
         * 设置指针信息
         */
        this.setClockTheme(this.hourClock, this.themeColor);
        this.setClockTheme(this.minuteClock, this.themeColor);
        this.setPointerRotate(this.hourClock, this.hourClock.interval*(this.hour%12));
        this.setPointerRotate(this.minuteClock, this.minuteClock.interval*this.minute);

        this.switchClock(this.hourClock, this.minuteClock);
    }


    /**
     * 设置指针外观
     * @param p 指针元素
     * @param color 主题色
     */
    private setClockTheme(clock: clockInfo, color: string) {

        //清除上一次的选择
        if(this.hourClock.curEle) {
            this.setStyle(this.hourClock.curEle, ['color'], ['#666']);
            this.hourClock.curEle.removeAttribute('data-now');
        }
        
        if(this.minuteClock.curEle) {
            this.setStyle(this.minuteClock.curEle, ['color'], ['#666']);
            this.minuteClock.curEle.removeAttribute('data-now');
        }

        this.hourClock.curEle = this.getElement('div', `hourclock-item-${this.curHour}`);
        this.minuteClock.curEle = this.curMinute%5 === 0? this.getElement('div', `clock-minuteitem-${this.curMinute}`): null;

        if(this.hourClock.curEle) {
            this.setStyle(this.hourClock.curEle, ['color'], [color]);
            this.hourClock.curEle.setAttribute('data-now', 'true');
        }
        
        if(this.minuteClock.curEle) {
            this.setStyle(this.minuteClock.curEle, ['color'], [color]);
            this.minuteClock.curEle.setAttribute('data-now', 'true');
        }


        this.setStyle(clock.clockPointer, ['background-color'], [color]);
        this.setStyle(clock.clockPointerCenter, ['background-color'], [color]);
        this.setStyle(clock.clockPointerPeak, ['border'], [`4px solid ${color}`]);
    }

    /**
     * 设置指针指向
     * @param p 指针元素
     * @param angle 主题色
     */
    private setPointerRotate(clock: clockInfo, angle: number) {

        if(isNaN(angle)) return;

        //24小时制时钟
        if(this.format === '24hr' && clock.type === 'hour') {
            if(this.distance < 90) {
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

        this.setStyle(clock.clockPointer, ['transform'], [`rotateZ(${angle}deg)`]);
        this.toggleFocus(clock, clock.itemList[angle]);

        this[clock.type] = this.angle2Time(clock, angle);
    }


    /**
     * 聚焦时钟刻度元素（高亮）
     * @param ele 元素
     */
    private toggleFocus(clock: clockInfo, ele: Element) {
        clock.curSelectClockItem = ele;

        if(clock.lastSelectClockItem) {
            this.setStyle(
                clock.lastSelectClockItem, 
                ['background-color', 'color'], 
                ['transparent', clock.lastSelectClockItem.getAttribute('data-now')? this.themeColor: '#666']
            );
            clock.lastSelectClockItem.removeAttribute('data-select');
        }

        if(clock.curSelectClockItem) {
            this.setStyle(clock.curSelectClockItem, ['background-color', 'color'], [this.themeColor, '#fff']);
            clock.curSelectClockItem.setAttribute('data-select', 'true');

            clock.lastSelectClockItem = clock.curSelectClockItem;
        }
    }

    /**
     * 切换显示的时钟
     * @param curClock 当前要显示的时钟
     * @param lastClock 要隐藏的时钟
     */
    private switchClock(curClock: clockInfo, lastClock: clockInfo) {
        this.setStyle(lastClock.viewEle, ['color'], ['rgba(255, 255, 255, 0.6)']);
        this.setStyle(lastClock.clock, ['visibility', 'opacity'], ['hidden', 0]);

        this.setStyle(curClock.viewEle, ['color'], ['rgba(255, 255, 255, 1)']);
        this.setStyle(curClock.clock, ['visibility', 'opacity'], ['visible', 1]);
    }


    /**
     * 切换显示am/pm
     */
    private toggleFocusMeridiem(ele: Element) {
        this.curMeridiemEle = ele;

        if(this.lastMeridiemEle) {
            this.setStyle(this.lastMeridiemEle, ['color'], ['rgba(255, 255, 255, 0.6)']);
        }

        this.setStyle(this.curMeridiemEle, ['color'], ['rgba(255, 255, 255, 1)']);

        this.lastMeridiemEle = this.curMeridiemEle;

        this.meridiem = this.curMeridiemEle.innerHTML.toLowerCase();
    }



    /**
     * ----------------生命周期---------------------------------------
     */

    /**
     * 时钟圆盘时间选择
     */
    private clockPointerEvent(clock: clockInfo, fn?: Function) {
        let p: P = null,
            /**
             * 解决：当点击input显示组件的时候，有时候组件会出现在鼠标指针下面，然后松开鼠标的时候就会触发moveup事件
             * 加一个标志变量，用来判断mouseup前面是否经过了点击组件的mousedown
             */
            flag: boolean = false;

        this.addEvent(clock.clock, 'mousedown', (t, x, y) => {
            this.clickFlag = true;
            flag = true;
            p = this.transformXY(x, y);
            this.setPointerRotate(clock, this.XY2angle(p.x, p.y, clock.interval));
            this.setTime();
        });

        this.addEvent(clock.clock, 'mousemove', (t, x, y) => {
            if(this.clickFlag) {
                p = this.transformXY(x, y);
                this.setPointerRotate(clock, this.XY2angle(p.x, p.y, clock.interval));
                this.setTime();
            }
        });

        this.addEvent(clock.clock, 'mouseup', () => {
            if(flag) {
                this.clickFlag = false;

                if(fn && typeof fn === 'function') {
                    fn();
                }

                flag = false;
            }
        });
    } 



    protected init() {
        //首先将模板插入body
        document.body.insertBefore(this.createContainer(), document.body.getElementsByTagName('script')[0]);

        /**
         * ----------------获取需要的html元素----------------
         */

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

        /**
         * ----------------------------------------------------
         */

        this.meridiemCon.appendChild(this.createMeridiemCon());

        //生成时钟圆盘
        this.hourClock.clock.appendChild(this.createClock(260, 0, 12, 1));
        this.hourClock.clock24.appendChild(this.createClock(190, 12, 24, 1));
        this.hourClock.clock.appendChild(this.createPointer(this.hourClock));

        //生成分钟圆盘
        this.minuteClock.clock.appendChild(this.createClock(260, 0, 60, 5));
        this.minuteClock.clock.appendChild(this.createPointer(this.minuteClock));

        this.amCon = this.getElement('div', 'am');
        this.pmCon = this.getElement('div', 'pm');

        this.getClockItemList();
        
        /**
         * -----------------事件绑定------------------------
         */

        //点击input显示组件
        this.inputList.map(ele => {
            this.addEvent(ele, 'focus', t => {
                //将this.curInputData设置为当前选中的input
                this.curInputData = this.inputDataList[parseInt(ele.getAttribute('data-component-index'))];

                //显示组件
                this.show(this.curInputData.themeColor, this.curInputData.type, this.curInputData.format);

                ele.setAttribute('readonly', 'readonly');
            });

        });


        //点击wrapper关闭组件
        this.addEvent(this.wrapper, 'click', t => {
            this.close();
        });

        //点击取消按钮关闭组件
        this.addEvent(this.closeBtn, 'click', t => {
            this.close();
        });


        //确认选择
        this.addEvent(this.comfirmBtn, 'click', t => {
            this.comfirm();
            this.close();
        });


        //回到现在
        this.addEvent(this.nowBtn, 'click', t => {
            this.toNow();
        });

        
        //选择时钟
        this.addEvent(this.hourCon, 'click', t => {
            this.switchClock(this.hourClock, this.minuteClock);
        });
        this.addEvent(this.minuteCon, 'click', t => {
            this.switchClock(this.minuteClock, this.hourClock);
        });

        /**
         * 选择am/pm
         */
        this.addEvent(this.amCon, 'click', t => {
            this.toggleFocusMeridiem(this.amCon);
            this.setTime();
        });
        this.addEvent(this.pmCon, 'click', t => {
            this.toggleFocusMeridiem(this.pmCon);
            this.setTime();
        });



        this.addEvent(this.materialPickerContainer, 'click', t => {});

        this.clockPointerEvent(this.hourClock, () => {
            this.switchClock(this.minuteClock, this.hourClock);
        });
        this.clockPointerEvent(this.minuteClock);
    }


    /**
     * 显示组件
     * @param themeColor 主题色
     * @param type 布局类型
     */
    public show(themeColor: string, type: string, format: string) {
        //设置主题/布局
        this.setTheme(themeColor, type, format);

        //解析组件value里的值
        this.getTime();

        //渲染面板内容
        this.renderPanel();

        //设置组件时间
        this.setTime();
    }


}


//CMD
if(typeof module !== "undefined" && module !== null) {
    module.exports = {
        DatePicker,
        TimePicker
    };
}


return {
    DatePicker,
    TimePicker
};

})(window);










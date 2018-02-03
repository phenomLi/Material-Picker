
const timePicker = (function(window) {

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
            
            selectedValue: inputEle['value'],

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






class timePicker extends materialPicker {


    /**
     * 当前时/分/上下午
     */
    private curHour: number;
    private curMinute: number;
    private curMeridiem: number;

    /**
     * 选择的时/分/上下午
     */
    private hour: number;
    private minute: number;
    private meridiem: number;


    constructor(conf?: object) {
        super(conf);
    }




    private createContainer() {

    }






    protected init() {

    }

    public show() {

    }


}



return timePicker;

})(window);

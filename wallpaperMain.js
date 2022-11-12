window.onload=()=>{
    console.log("欢迎使用Wallpaper --By:wh131462");
    let dom=document.querySelector('#wallpaper');
    const wallpaper=new Wallpaper(dom);
    wallpaper.init();
    let file = new FileSystemDirectoryReader()
}
//Wallpaper Engine 属性监听对象
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        console.log("监听到对象属性",properties)
            // Read custom color
            if (properties.loop) {

            }
        }
}
//枚举对象  模式 目前有两个模式 一种是
const Mode={
    "img":"img",
    "video":"video",
    "random":"random"
}
class Wallpaper{
    //全局设置
    Setting={
        //播放模式
        mode:Mode.img,
        //内容是否随机播放
        contentRandom:false,
        //是否循环 图片如果循环 那么就相当于静态壁纸
        loop:false,
        //时间间隔
        duration:3000,
        //显示时间
        isTime:true,
        //显示用户语
        isMotto:true
    };
    wallpaper;//dom元素
    content=null;//内容存放对象
    timer=null;//主计时器
    _timeTimer=null;//时间专用计时器
    resources={
        img:[],
        audio:[],
        video:[]
    };
    constructor(dom,config) {
        this.wallpaper=dom;
        if(config){
            Object.assign(this.Setting,config);
        }
    }
    //初始化函数
    init(){
        this.initTimer();
        this.initTime()
    }
    //初始化资源
    initResources(){

    }
    //初始化轮播
    initTimer(){
        if(this.timer){
            clearInterval(this.timer);
        }
        let {mode,duration,contentRandom}=this.Setting;
        let {img,video,audio} = this.resources;
        switch (mode){
            case Mode.img:
                this.timer=setInterval(()=>{
                    let curIndex=img.findIndex(i=>i==this.content),//todo 未确定资源对象的属性
                    len=img.length;
                    //资源变量
                    let index;
                    let resource;
                    //内容随机 就给随机数
                    index=contentRandom?this.randomIndex(len,curIndex):(curIndex+1)%len;
                    resource=img[index];
                    this.setContent();

                },duration);
                break;
            case Mode.video:

                break;
            case Mode.random:

                break;
        }
    }
    //设置内容
    setContent(resource,tag){
        if(!resource)return;
        let contentDom;
        if(tag=="img"){
            contentDom=document.createElement('img');
            contentDom.alt=resource.name;
            contentDom.src=resource.src;
        }else if(tag=="video"){
            contentDom=document.createElement('video');
            contentDom.src=resource.src;
            contentDom.autoplay=true;
            contentDom.loop=this.Setting.loop;
            contentDom.onended=(e)=>{
                console.log("视频播放结束");
            }
        }else if(tag=="audio"){

        }
        this.wallpaper.appendChild(contentDom);
    }
    //初始化时间
    initTime(){
        this._timeTimer = setInterval(()=>{
            if(this.Setting.isTime){
                let date=new Date().format("hh:mm:ss");;
                let timeDom=this.wallpaper.querySelector('.time');
                if(timeDom===null){
                    let dom=document.createElement('div');
                    dom.classList.add('time');
                    timeDom=dom;
                    this.wallpaper.appendChild(dom);
                }
                timeDom.innerText=date;
            }else{
                let timeDom=this.wallpaper.querySelector('.time');
                if(timeDom){
                    timeDom.remove();
                }
            }
        },1000)
    }
    //随机index
    randomIndex(len,index=-1){
        if(len<2)return 0
        if(index==-1){
            return Math.floor(Math.random()*len);
        }else{
            let i=this.randomIndex(len,index);
            return index==i?this.randomIndex(len,index):i;
        }
    }
}


//工具
Date.prototype.format=function (fmt) {
    let o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(let k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}
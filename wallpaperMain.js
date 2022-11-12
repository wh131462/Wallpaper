//资源列表生成
let dir={};
getJson();
window.onload=()=>{
    console.log("欢迎使用Wallpaper --By:wh131462");
    let dom=document.querySelector('#wallpaper');
    const wallpaper=new Wallpaper(dom);
    wallpaper.init();
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
        duration:5000,
        //显示时间
        isTime:true,
        //显示用户语
        isMotto:true
    };
    wallpaper;//dom元素
    content=null;//内容存放对象
    timer=null;//主计时器
    _timeTimer=null;//时间专用计时器
    resources;
    constructor(dom,config) {
        this.wallpaper=dom;
        if(config){
            Object.assign(this.Setting,config);
        }
        this.resources=dir;
        this.initResources()
    }
    //初始化函数
    init(){
        this.initDefault();
        this.initTimer();
        this.initTime()
    }

    initDefault(){
        this.next();
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
                this.timer=setInterval(()=>this.next(),duration);
                break;
            case Mode.video:

                break;
            case Mode.random:

                break;
        }
    }
    next(){
        let {contentRandom}=this.Setting;
        let {img,video,audio} = this.resources;
        let curIndex=img.findIndex(i=>i.src==this.content?.src),
            len=img.length;
        //资源变量
        let index;
        let resource;
        //内容随机 就给随机数
        index=contentRandom?this.randomIndex(len,curIndex):(curIndex + 1)%len;
        resource=img[index];
        this.setContent(resource);
    }
    //设置内容
    setContent(resource){
        if(!resource)return;
        let contentDom;
        if(resource.type=="img"){
            let lastDom=this.wallpaper.querySelector('.now-img');
            if(lastDom){
                lastDom.classList.remove('now-img');
                lastDom.classList.remove('show');
                lastDom.classList.add('last-img');
                lastDom.classList.add('fade');
                setTimeout(()=>lastDom.remove(),3000);
            }
            contentDom=document.createElement('img');
            contentDom.classList.add('now-img');
            contentDom.classList.add('show');
            contentDom.alt=resource.name;
            contentDom.src=resource.src;
            contentDom.draggable=false;
        }else if(resource.type=="video"){
            this.wallpaper.querySelector('video')?.remove();
            contentDom=document.createElement('video');
            contentDom.src=resource.src;
            contentDom.autoplay=true;
            contentDom.loop=this.Setting.loop;
            contentDom.onended=(e)=>{
                console.log("视频播放结束");
            }
        }else if(resource.type=="audio"){
            this.wallpaper.querySelector('audio')?.remove();
            contentDom=document.createElement('audio');
            contentDom.src=resource.src;
            contentDom.autoplay=true;
            contentDom.loop=this.Setting.loop;
            contentDom.onended=(e)=>{
                console.log("音频播放结束");
            }
        }
        this.content=resource;
        this.content.dom=contentDom;
        this.wallpaper.appendChild(contentDom);
    }
    //初始化时间
    initTime(){
        this._timeTimer = setInterval(()=>{
            if(this.Setting.isTime){
                let date=new Date().format("hh:mm:ss");;
                let timeDom=this.wallpaper.querySelector('.time');
                if(timeDom===null){
                    let dom=document.createElement('div'),
                    p=document.createElement('p');
                    dom.classList.add('time');
                    dom.appendChild(p);
                    timeDom=dom;
                    this.wallpaper.appendChild(dom);
                }
                timeDom.querySelector('p').innerText=date;
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
        console.log(len)
        if(len<2)return 0;
        if(index==-1){
            return Math.floor(Math.random()*len);
        }else{
            let i=Math.floor(Math.random()*len);
            return index==i?this.randomIndex(len,index):i;
        }
    }
    //初始化资源 刚开始获取到的只有一个简单的文件名字 需要将其对象补全
    initResources(){
        if(!this.resources){
            throw new Error("未正确获取到资源，在确认资源存在于对应的文件夹下之后，请检查 【dir.json】 文件，若文件不正常，可以执行同级目录下的 【initDir.bat】 来初始化资源。")
        }
        Object.keys(this.resources).forEach(key=>{
            if(Array.isArray(this.resources[key])){
                this.resources[key]=this.resources[key].map(name=>{
                    let item={
                        name:name,
                        src:`./resources/${key}/${name}`,
                        type:key
                    };
                    return item;
                });
            }
        });
        console.log("=========资源初始化完成=========",this.resources)
    }
    initSetting(){
        let settingDom = document.querySelector('.setting-button');
        let settingPanel = document.querySelector('.setting');

        settingDom.addEventListener('click',(e)=>{

        })
    }
}

//工具
function getJson(){
    let url = './dir.json';
    let request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
            let json = JSON.parse(request.responseText);
            dir=json;
        }
    }
}
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
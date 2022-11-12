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
        ///////基础配置
        //播放模式
        mode:Mode.img,
        //内容是否随机播放 否则就按顺序变化
        contentRandom:true,
        //是否循环 图片如果循环 那么就相当于静态壁纸
        loop:false,
        //是否静音
        mute:false,
        //时间间隔
        duration:3000,
        //////附加配置
        //显示时间
        isTime:true,
        //显示用户语
        isMotto:true,
        //座右铭
        motto:"无限进步"
    };
    //设置的辅助配置
    baseField=[
        {key:"播放模式",value:'mode'},
        {key:"是否随机播放内容",value:'contentRandom'},
        {key:"是否开启循环",value:'loop'},
        {key:"是否静音",value:'mute'},
        {key:"时间间隔",value:'duration'}
    ];
    otherField=[
        {key:"是否显示时间",value:'isTime'},
        {key:"是否显示座右铭",value:'isMotto'},
        {key:"座右铭",value:'motto'}
    ];
    wallpaper;//dom元素
    content=null;//内容存放对象
    timer=null;//主计时器
    _timeTimer=null;//时间专用计时器
    resources;
    constructor(dom,config) {
        //更新配置已经初始化 基本资源
        this.wallpaper=dom;
        if(config){
            Object.assign(this.Setting,config);
        }
        this.resources=dir;
        console.log("资源赋值",new Date().valueOf())
        this.initResources()
        console.log("初始化数组",new Date().valueOf())
        this.initSetting();
        console.log("初始化设置",new Date().valueOf())
    }
    //初始化函数
    init(){
        this.initTimer();
        this.initTime()
        this.initMotto();
        this.initDefault();
    }

    initDefault(){
        console.log("初始化默认值",)
        this.next(this.Setting.mode);
    }
    //初始化轮播
    initTimer(){
        if(this.timer){
            clearInterval(this.timer);
        }
        this.clearContainer();
        let {mode,duration,contentRandom}=this.Setting;
        let {img,video,audio} = this.resources;
        switch (mode){
            case Mode.img:
                this.timer=setInterval(()=>this.next('img'),duration);
                break;
            case Mode.video:
                this.next('video');
                break;
            case Mode.random:

                break;
        }
    }
    clearContainer(){
        if(!this.wallpaper||!this.wallpaper.children.length)return;
        console.dir(this.wallpaper)
        Array.from(this.wallpaper.children).forEach(dom=>{
            if(!(dom.classList.contains('time')||dom.classList.contains('motto'))){
                dom.remove();
            }
        })
    }
    next(type="img"){
        let {contentRandom}=this.Setting;
        let {img,video,audio} = this.resources;
        let curIndex,len;
        //资源变量
        let index;
        let resource;
        switch(type){
            case "img":
                curIndex=img.findIndex(i=>i.src==this.content?.src);
                len=img.length;
                //内容随机 就给随机数
                if(!this.Setting.loop){
                    index=contentRandom?this.randomIndex(len,curIndex):(curIndex + 1)%len;
                }else{
                    index=curIndex==-1?0:curIndex;
                }
                resource=img[index];
                break;
            case "video":
                curIndex=video.findIndex(i=>i.src==this.content?.src);
                len=video.length;
                //内容随机 就给随机数
                index=contentRandom?this.randomIndex(len,curIndex):(curIndex + 1)%len;
                resource=video[index];
                break;
            case "audio":
                curIndex=audio.findIndex(i=>i.src==this.content?.src);
                len=audio.length;
                //内容随机 就给随机数
                index=contentRandom?this.randomIndex(len,curIndex):(curIndex + 1)%len;
                resource=audio[index];
                break;
        }
        this.setContent(resource);
    }
    //设置内容
    setContent(resource){
        if(!resource)return;
        let contentDom;
        if(resource.type=="img"){
            let lastDom=this.wallpaper.querySelector('.now-img');
            if(lastDom){
                if(this.Setting.loop){return;}
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
            let lastDom=this.wallpaper.querySelector('.now-video');
            if(lastDom){
                lastDom.remove();
            }
            contentDom=document.createElement('video');
            contentDom.classList.add('now-video');
            contentDom.classList.add('show');
            contentDom.src=resource.src;
            contentDom.autoplay=true;
            contentDom.loop=this.Setting.loop;
            // contentDom.onloadeddata=(e)=>{
            //     console.log("视频时长",contentDom.duration)
            //     contentDom.currentTime=contentDom.duration-5;
            //     console.dir(contentDom)
            // }
            contentDom.onended=(e)=>{
                console.log("视频播放结束");
                if(!this.Setting.loop){
                    this.next('video');
                }
            }
        }else if(resource.type=="audio"){

            if(!this.wallpaper.querySelector('audio')){
                contentDom=document.createElement('audio');
            }
            else{
                contentDom=this.wallpaper.querySelector('audio');
            }
            contentDom.src=resource.src;
            contentDom.autoplay=true;
            contentDom.loop=this.Setting.loop;
            contentDom.onended=(e)=>{
                console.log("音频播放结束");
                if(!this.Setting.loop){
                    this.next('audio');
                }
            }
        }
        this.content=resource;
        this.content.dom=contentDom;
        this.wallpaper.appendChild(contentDom);
        if(this.Setting.mute){
            if(document.querySelector('video'))document.querySelector('video').muted=true;
            if(document.querySelector('audio'))document.querySelector('audio').muted=true;
        }else{
            if(document.querySelector('video'))document.querySelector('video').muted=false;
            if(document.querySelector('audio'))document.querySelector('audio').muted=false;
        }
    }
    //初始化时间
    initTime(){
        this._timeTimer = setInterval(()=>{
            if(this.Setting.isTime){
                let date=new Date().format("hh:mm:ss");
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
    initMotto(){
        let mottoDom=this.wallpaper.querySelector('.motto');
        if(mottoDom===null){
            let dom=document.createElement('div'),
                p=document.createElement('p');
            dom.classList.add('motto');
            dom.appendChild(p);
            mottoDom=dom;
            this.wallpaper.appendChild(dom);
        }
        mottoDom.querySelector('p').innerText=this.Setting.motto;
    }
    //随机index
    randomIndex(len,index=-1){
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
    //初始化设置面板
    initSetting(){
        let settingDom = document.querySelector('.setting-button');
        let settingPanel = document.querySelector('.setting');

        let baseSetting=this.getSettingDiv('基础设置');
        let otherSetting=this.getSettingDiv('其他设置');

        Object.keys(this.Setting).forEach(key=>{
            //基础设置
            if(this.baseField.findIndex(f=>f.value==key)!=-1){
                 let dom=baseSetting.querySelector('.setting-content');
                 this.insetSettingInput(dom,key);
            }
            //其他设置
            else if(this.otherField.findIndex(f=>f.value==key)!=-1){
                let dom=otherSetting.querySelector('.setting-content');
                this.insetSettingInput(dom,key);
            }
        })
        settingDom.addEventListener('click',(e)=>{
            console.log("点击开启或者关闭",)
            settingPanel.hidden=!settingPanel.hidden;
        })
    }
    //获取设置的DIV级别
    getSettingDiv(title='设置'){
        let settingPanel = document.querySelector('.setting');
        let baseDom=document.createElement('div');
        let label=document.createElement('div');
        let content=document.createElement('div');
        baseDom.classList.add('setting-div');
        label.classList.add('setting-title');
        content.classList.add('setting-content')
        label.innerHTML=`<p>${title}</p>`;
        baseDom.appendChild(label);
        baseDom.appendChild(content);
        settingPanel.appendChild(baseDom);
        return baseDom;
    }
    insetSettingInput(container,key){
        let fields=[...this.baseField,...this.otherField];
        let dom=document.createElement('div');
        let label=document.createElement('p');
        dom.classList.add('setting-input');
        label.classList.add('label');
        label.innerText=fields.find(f=>f.value==key).key;

        let input;
        let type=typeof this.Setting[key];
        switch (type){
            case "string":
                if(key=='mode'){
                    input=document.createElement('select');
                    Object.keys(Mode).forEach(key=>{
                        let opt=document.createElement('option');
                        opt.label=Mode[key];
                        opt.value=Mode[key];
                        input.add(opt);
                    });
                }else{
                    input=document.createElement('input');
                    input.type="text";
                }
                input.classList.add('input');
                input.value=this.Setting[key];
                input.onchange=(e)=>{
                    this.Setting[key]=e.target.value.toString();
                    console.log("值变化",key,e,this.Setting[key])
                    this.initTimer();
                }
                break;
            case "number":
                input=document.createElement('input');
                input.classList.add('input');
                input.type="number";
                input.value=this.Setting[key];
                input.onchange=(e)=>{
                    this.Setting[key]=parseFloat(e.target.value);
                    console.log("值变化",key,e,this.Setting[key])
                    this.initTimer();
                }
                break;
            case "boolean":
                input=document.createElement('input');
                input.classList.add('input');
                input.type="checkbox";
                input.checked=this.Setting[key];
                input.onchange=(e)=>{
                    this.Setting[key]=e.target.checked;
                    console.log("值变化",key,e,this.Setting[key])
                    this.initTimer();
                }
                break;
        }

        dom.appendChild(label);
        dom.appendChild(input);
        container.appendChild(dom);
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
            console.log("json 获取",new Date().valueOf())
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
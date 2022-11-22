//资源列表生成
let Wall;
let dir = {};
// let baseUri = document?.currentScript?.src.toString().replace(/wallpaperMain\.js$/mi, "").replace(/^(http|https)/, "file");
//工具
function getJson() {
    let url = './dir.json';
    let request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
            let json = JSON.parse(request.responseText);
            dir = json;
            //直接在此初始化了
            log("欢迎使用Wallpaper --By:wh131462");
            let dom = document.querySelector('#wallpaper');
            if(!Wall){
                log("初始化壁纸 from load")
                Wall = new Wallpaper(dom)
                Wall.init();
            }
            log("json已获取", new Date().valueOf())
        }
    }
}
getJson();
console.error = (...rest) => {
    log("ERR:",...rest)
}
function log(mes, ...objs) {
    let content = mes;
    objs.forEach(item => {
        if (item instanceof Object) {
            content += "<p>" + JSON.stringify(item) + '</p>';
        } else {
            content += "<p>" + item + '</p>';
        }
    })
    console.log(content);
    document.querySelector('#log').innerHTML += '<p>' + content + '</p>';
}
Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
const Mode = {
    "img": "img",
    "video": "video",
    "random": "random"
}

class Wallpaper {
    //全局设置
    Setting = {
        ///////基础配置
        //播放模式
        mode: Mode.img,
        //内容是否随机播放 否则就按顺序变化
        contentRandom: true,
        //是否循环 图片如果循环 那么就相当于静态壁纸
        loop: false,
        //是否静音
        mute: false,
        //时间间隔
        duration: 3000,
        //////附加配置
        //显示时间
        isTime: true,
        //显示用户语
        isMotto: true,
        //座右铭
        motto: "无限进步",
        //是否显示日志
        isLog: false
    };
    //设置的辅助配置
    baseField = [
        {key: "播放模式", value: 'mode'},
        {key: "是否随机播放内容", value: 'contentRandom'},
        {key: "是否开启循环", value: 'loop'},
        {key: "是否静音", value: 'mute'},
        {key: "时间间隔", value: 'duration'}
    ];
    otherField = [
        {key: "是否显示时间", value: 'isTime'},
        {key: "是否显示座右铭", value: 'isMotto'},
        {key: "座右铭", value: 'motto'},
        {key: "是否显示日志", value: "isLog"}
    ];
    wallpaper;//dom元素
    content = null;//内容存放对象
    timer = null;//主计时器
    _timeTimer = null;//时间专用计时器
    resources;
    //播放器对象
    Player={
        currentPlayer: undefined,
    };
    //设置的dom对象
    SettingDom={

    }

    constructor(dom, config) {
        //更新配置已经初始化 基本资源
        this.wallpaper = dom;
        this.setConfig(config)
        this.resources = dir;
        this.initResources()
        this.initSetting();
        this.initPlayer();
    }

    /**
     * 初始化函数
     */
    init() {
        this.render()
    }

    /**
     * 同步用户配置
     * @param config
     */
    setConfig(config) {
        if (config) {
            Object.assign(this.Setting,config);
            this.syncSetting(Object.keys(config)[0]);
            log("配置同步完成", this.Setting,config)
        }
    }
    /**
     *     render渲染函数 更改某些配置将执行
     */
    render() {
        this.clearContainer()
        if (this.timer) {
            clearInterval(this.timer);
        }
        //通用模块必须加载
        this.initTime();
        this.initMotto();
        this.initLog();
        //按模式加载
        switch (this.Setting.mode) {
            case "img":
                this.initImg();
                break;
            case "video":
                this.initVideo();
                break;
            case "random":
                this.initRandom();
                break;
        }
    }

    initImg() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        let {duration} = this.Setting;
        this.next('img');
        this.next("audio")
        this.timer = setInterval(() => this.next('img'), duration);
    }

    initVideo() {
        this.next('video')
    }

    initRandom() {
        this.next('random');
    }

    /**
     * 清理容器
     */
    clearContainer() {
        if (!this.wallpaper || !this.wallpaper.children.length) return;
        console.dir(this.wallpaper)
        Array.from(this.wallpaper.children).forEach(dom => {
            if (!(dom.classList.contains('time') || dom.classList.contains('motto'))) {
                dom.remove();
            }
        })
    }

    /**
     * **重要**  next函数 找到下一个
     * @param type
     * @param m 如果传入-1 并且是顺序的话会减
     */
    next(type = "img",m=0) {
        let {contentRandom} = this.Setting;
        let {img, video, audio} = this.resources;
        let curIndex, len;
        //资源变量
        let index;
        let resource;
        switch (type) {
            case "img":
                curIndex = img.findIndex(i => i.src == this.content?.src);
                len = img.length;
                //内容随机 就给随机数
                if (!this.Setting.loop) {
                    index = contentRandom ? this.randomIndex(len, curIndex) : (curIndex + 1) % len;
                } else {
                    index = curIndex == -1 ? 0 : curIndex;
                }
                resource = img[index];
                break;
            case "video":
                if (!video.length) {
                    this.Setting.mode = Mode.img;
                    this.initImg()
                    return;
                }
                curIndex = video.findIndex(i => i.src == this.content?.src);
                len = video.length;
                //内容随机 就给随机数
                index = contentRandom ? this.randomIndex(len, curIndex) :m==0?(curIndex + 1) % len:(curIndex==0?len-1:curIndex-1);
                resource = video[index];
                break;
            case "audio":
                curIndex = audio.findIndex(i => i.src == this.content?.src);
                len = audio.length;
                //内容随机 就给随机数
                index = contentRandom ? this.randomIndex(len, curIndex) : m==0?(curIndex + 1) % len:(curIndex==0?len-1:curIndex-1);
                resource = audio[index];
                break;
            case "random":
                let what = Math.floor(Math.random() * 2);
                if (what === 0) {
                    this.clearContainer()
                    this.initImg();
                } else {
                    this.clearContainer()
                    this.next("video");
                }
                break;
        }
        log("next", type, curIndex, index, len, resource);
        this.setContent(resource);
    }

    //设置内容
    setContent(resource) {
        if (!resource) return;
        let contentDom;
        if (resource.type == "img") {
            let lastDom = this.wallpaper.querySelector('.now-img');
            if (lastDom) {
                if (this.Setting.loop) {
                    return;
                }
                lastDom.classList.remove('now-img');
                lastDom.classList.remove('show');
                lastDom.classList.add('last-img');
                lastDom.classList.add('fade');
                setTimeout(() => lastDom.remove(), 3000);
            }
            contentDom = document.createElement('img');
            contentDom.classList.add('now-img');
            contentDom.classList.add('show');
            contentDom.alt = resource.name;
            contentDom.src = resource.src;
            contentDom.draggable = false;
        } else if (resource.type == "video") {
            if (!this.wallpaper.querySelector('video')) {
                contentDom = document.createElement('video');
            } else {
                contentDom = this.wallpaper.querySelector("video");
            }
            contentDom.src = resource.src;
            contentDom.autoplay = true;
            contentDom.loop = this.Setting.loop;
            contentDom.onplaying=(e)=>{
                console.log("playing",e)
                let name=decodeURI(e.target.src.replace(/^.*video\//,"").replace(/\.(mp4|mp3|ogg|webm|acc|wav|flac)$/i,""));
                this.Player.title.innerHTML=name;
                if(this.Player.timeTimer){
                    clearInterval(this.Player.timeTimer);
                }
                this.Player.timeTimer=setInterval(()=>{
                    this.Player.time.innerHTML=this.toTime(e.target.currentTime)+'/'+this.toTime(e.target.duration);
                    this.Player.progress.style.width=((e.target.currentTime/e.target.duration)*100)+'%';
                },500);
            }
            // contentDom.onloadeddata = (e) => {
            //     log("视频时长", contentDom.duration)
            //     contentDom.currentTime = contentDom.duration - 5;
            //     console.dir(contentDom)
            // }
            contentDom.onpause=()=>{
                this.Player.play.src='./resources/icon/play.png'
            }
            contentDom.onplay=()=>{
                this.Player.play.src='./resources/icon/pause.png'
            }
            contentDom.onended = (e) => {
                if (!this.Setting.loop) {
                    this.next(this.Player.type);
                }
            }
            this.Player.currentPlayer=contentDom;
            this.Player.type="video";
        } else if (resource.type == "audio") {
            if (!this.wallpaper.querySelector('audio')) {
                contentDom = document.createElement('audio');
            } else {
                contentDom = this.wallpaper.querySelector("audio");
            }
            contentDom.src = resource.src;
            contentDom.autoplay = true;
            contentDom.loop = this.Setting.loop;
            contentDom.onplaying=(e)=>{
                console.log("playing",e)
                let name=decodeURI(e.target.src.replace(/^.*audio\//,"").replace(/\.(mp3|ogg|webm|acc|wav|flac)$/i,""));
                this.Player.title.innerHTML=name;
                if(this.Player.timeTimer){
                    clearInterval(this.Player.timeTimer);
                }
                this.Player.timeTimer=setInterval(()=> {
                    this.Player.time.innerHTML = this.toTime(e.target.currentTime) + '/' + this.toTime(e.target.duration)
                    this.Player.progress.style.width=((e.target.currentTime/e.target.duration)*100)+'%';
                },500);
            }
            contentDom.onpause=()=>{
                this.Player.play.src='./resources/icon/play.png'
            }
            contentDom.onplay=()=>{
                this.Player.play.src='./resources/icon/pause.png'
            }
            contentDom.onended = (e) => {
                if (!this.Setting.loop) {
                    this.next(this.Player.type);
                }
            }
            this.Player.currentPlayer=contentDom;
            this.Player.type="audio";
        }
        this.content = resource;
        this.content.dom = contentDom;
        this.wallpaper.appendChild(contentDom);
        if (this.Setting.mute) {
            if (document.querySelector('video')) document.querySelector('video').muted = true;
            if (document.querySelector('audio')) document.querySelector('audio').muted = true;
        } else {
            if (document.querySelector('video')) document.querySelector('video').muted = false;
            if (document.querySelector('audio')) document.querySelector('audio').muted = false;
        }
    }

    /**
     * 秒数转时间
     * @param seconds
     */
    toTime(seconds){
        let hours=Math.floor(seconds/3600);
        let min=Math.floor((seconds%3600)/60);
        let sec=Math.floor(seconds%60);
        let res;
        if(hours>0) res=`${hours}:${getTow(min)}:${getTow(sec)}`;
        else res = `${min}:${getTow(sec)}`;
        //内部函数用于返回两位数
        function getTow(v){
            return v<10?'0'+v:v;
        }
        return res;
    }
    //初始化时间
    initTime() {
        if (this._timeTimer) {
            clearInterval(this._timeTimer);
        }
        let timeDom = this.wallpaper.querySelector('.time');
        if (timeDom === null) {
            let dom = document.createElement('div'),
                p = document.createElement('p');
            dom.classList.add('time');
            dom.appendChild(p);
            timeDom = dom;
            this.wallpaper.appendChild(dom);
        }
        let date = new Date().format("hh:mm:ss");
        timeDom.querySelector('p').innerHTML =this.Setting.isTime ? date:"";
        this._timeTimer = setInterval(() => {
            let date = new Date().format("hh:mm:ss");
            timeDom.querySelector('p').innerHTML =this.Setting.isTime ? date:"";
        }, 1000)
    }

    //初始化座右铭
    initMotto() {
        let mottoDom = this.wallpaper.querySelector('.motto');
        if (mottoDom === null) {
            let dom = document.createElement('div'),
                p = document.createElement('p');
            dom.classList.add('motto');
            dom.appendChild(p);
            mottoDom = dom;
            this.wallpaper.appendChild(dom);
        }
        mottoDom.querySelector('p').innerHTML = this.Setting.isMotto ? this.Setting.motto : "";
    }

    //初始化日志
    initLog() {
        let dom = document.querySelector('#log')
        dom.style.opacity = this.Setting.isLog == true ? "1" : "0";
        log("初始化日志")
    }

    /**
     * 随机index
     * @param len
     * @param index
     * @returns {number|number|number|*}
     */
    randomIndex(len, index = -1) {
        if (len < 2) return 0;
        if (index == -1) {
            return Math.floor(Math.random() * len);
        } else {
            let i = Math.floor(Math.random() * len);
            return index == i ? this.randomIndex(len, index) : i;
        }
    }

    /**
     * 初始化资源 刚开始获取到的只有一个简单的文件名字 需要将其对象补全
     */
    initResources() {
        if (!this.resources) {
            throw new Error("未正确获取到资源，在确认资源存在于对应的文件夹下之后，请检查 【dir.json】 文件，若文件不正常，可以执行同级目录下的 【initDir.bat】 来初始化资源。")
        }
        Object.keys(this.resources).forEach(key => {
            if (Array.isArray(this.resources[key])) {
                this.resources[key] = this.resources[key].map(name => {
                    if(/\.mp4/im.test(name)){}else{
                        let item = {
                            name: name,
                            src: `./resources/${key}/${name}`,
                            type: key
                        };
                        return item;
                    }
                }).filter(i=>i);
            }
        });
        log("=========资源初始化完成=========")
    }
    //region player
    initPlayer(){
        let player=document.querySelector(".player");

        let info=player.querySelector('.info');
        let title=info.querySelector('.title');
        let time=info.querySelector('.time');

        let progressContent=player.querySelector('.progress');
        let progress=progressContent.querySelector(".progress-bar");

        let btns=player.querySelector('.player-btn');
        let pre=btns.querySelector('#pre');
        let play=btns.querySelector('#play');
        let next=btns.querySelector('#next');
        let list=btns.querySelector('#list');

        title.innerHTML="未播放媒体文件";
        time.innerHTML="";
        progress.style.width='0%';
        //同步Player
        this.Player={
            self:player,
            title,
            time,
            progress,
            pre,
            play,
            next,
            list
        };
        this.initPlayerEvent();
    }
    initPlayerEvent(){
        let {pre,play,next,list}=this.Player;
        pre.onclick=(e)=>{
            this.next(this.Player.type,-1);
        }
        play.onclick=(e)=>{
            if(this.Player.currentPlayer.paused) {
                this.Player.currentPlayer.play()
            }else{
                this.Player.currentPlayer.pause()
            }
        }
        next.onclick=(e)=>{
            this.next(this.Player.type);
        }
        list.onclick=(e)=>{

        }
    }
    //endregion
    //region setting
    /**
     * 根据设置不同进行不同的处理
     * @param key
     */
    syncSetting(key) {
        let {mode,duration}=this.Setting;
        switch (key) {
            case 'mode':
                this.render()
                break;
            case 'contentRandom':
                //do nothing
                break;
            case 'loop':
                if(mode=="img")
                    this.wallpaper.querySelector('audio').loop=this.Setting.loop;
                else
                    this.wallpaper.querySelector('video').loop=this.Setting.loop;
                break;
            case 'mute':
                if(mode=="img")
                    this.wallpaper.querySelector('audio').muted=this.Setting.mute;
                else
                    this.wallpaper.querySelector('video').muted=this.Setting.mute;
                break;
            case 'duration':
                if(mode=="img"){
                    if(this.timer)clearInterval(this.timer)
                    this.timer=setInterval(() => this.next('img'), duration);
                }
                break;
            case 'isTime':
                this.initTime()
                break;
            case 'isMotto':
                this.initMotto()
                break;
            case 'motto':
                this.initMotto()
                break;
            case 'isLog':
                this.initLog()
                break;
        }
        //同步显示
        this.syncSettingDisplay();
    }

    /**
     * 初始化设置面板
     */
    initSetting() {
        let settingDom = document.querySelector('.setting-button');
        let settingPanel = document.querySelector('.setting');

        let baseSetting = this.getSettingDiv('基础设置');
        let otherSetting = this.getSettingDiv('其他设置');

        Object.keys(this.Setting).forEach(key => {
            //基础设置
            if (this.baseField.findIndex(f => f.value == key) != -1) {
                let dom = baseSetting.querySelector('.setting-content');
                this.insetSettingInput(dom, key);
            }
            //其他设置
            else if (this.otherField.findIndex(f => f.value == key) != -1) {
                let dom = otherSetting.querySelector('.setting-content');
                this.insetSettingInput(dom, key);
            }
        })
        settingDom.addEventListener('click', (e) => {
            settingPanel.hidden = !settingPanel.hidden;
        })
    }

    /**
     * 获取设置的DIV级别
     * @param title
     * @returns {HTMLDivElement}
     */
    getSettingDiv(title = '设置') {
        let settingPanel = document.querySelector('.setting');
        let baseDom = document.createElement('div');
        let label = document.createElement('div');
        let content = document.createElement('div');
        baseDom.classList.add('setting-div');
        label.classList.add('setting-title');
        content.classList.add('setting-content')
        label.innerHTML = `<p>${title}</p>`;
        baseDom.appendChild(label);
        baseDom.appendChild(content);
        settingPanel.appendChild(baseDom);
        return baseDom;
    }

    /**
     * 插入设置输入框 并监听其变化
     * @param container
     * @param key
     */
    insetSettingInput(container, key) {
        let fields = [...this.baseField, ...this.otherField];
        let dom = document.createElement('div');
        let label = document.createElement('p');
        dom.classList.add('setting-input');
        label.classList.add('label');
        label.innerText = fields.find(f => f.value == key).key;

        let input;
        let type = typeof this.Setting[key];
        switch (type) {
            case "string":
                if (key == 'mode') {
                    input = document.createElement('div');
                    Object.keys(Mode).forEach(m => {
                        let opt = document.createElement('button');
                        opt.innerText = Mode[m];
                        opt.name = Mode[m];
                        opt.value = Mode[m];
                        opt.onclick = (e) => {
                            this.Setting[key] = e.target.value;
                            this.syncSetting(key);
                        }
                        input.appendChild(opt);
                    });
                } else {
                    input = document.createElement('input');
                    input.type = "text";
                }
                input.classList.add('input');
                input.value = this.Setting[key];
                input.onchange = (e) => {
                    this.Setting[key] = e.target.value.toString();
                    this.syncSetting(key);
                }
                break;
            case "number":
                input = document.createElement('input');
                input.classList.add('input');
                input.type = "number";
                input.value = this.Setting[key];
                if (key == "duration") {
                    input.step = "500";
                }
                input.onchange = (e) => {
                    this.Setting[key] = parseFloat(e.target.value);
                    this.syncSetting(key);
                }
                break;
            case "boolean":
                input = document.createElement('input');
                input.classList.add('input');
                input.type = "checkbox";
                input.checked = this.Setting[key];
                input.onchange = (e) => {
                    this.Setting[key] = e.target.checked;
                    this.syncSetting(key);
                }
                break;
        }

        this.SettingDom[key]=input;
        dom.appendChild(label);
        dom.appendChild(input);
        container.appendChild(dom);
    }

    syncSettingDisplay(){
        Object.keys(this.SettingDom).forEach(key=> {
            switch (typeof this.Setting[key]) {
                case "string":
                case "number":
                    this.SettingDom[key].value = this.Setting[key];
                    break;
                case "boolean":
                    this.SettingDom[key].checked = this.Setting[key];
                    break;
            }
        })
    }
    //endregion
}
//Wallpaper Engine 属性监听对象
window.wallpaperPropertyListener = {
    applyUserProperties:(properties)=>{
        log("属性",properties)
        Object.keys(properties).forEach(key=>{
            let config={};
            config[key]=properties[key].value;
            Wall.setConfig(config)
        })
        if(!Wall){
            log("初始化壁纸 from engine")
            let dom = document.querySelector('#wallpaper');
            Wall = new Wallpaper(dom,config)
            Wall.init();
        }
    }
}

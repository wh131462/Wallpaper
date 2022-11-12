

window.onload=()=>{
    console.log("欢迎访问")
    let dom=document.querySelector('#Wallpaper');
    const WallPaper=new Wallpaper(dom);
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
        //是否循环
        loop:false,
        //
    };
    wallpaper;//dom元素
    timer=null;//计时器
    constructor(dom,config) {
        this.wallpaper=dom;
        if(config){
            Object.assign(this.Setting,config);
        }
    }
    //初始化函数
    init(){
        this.settingMode();
    }


}


async function initWallpaper(){
    let dir=await getJson();
    let dom = document.querySelector('#wallpaper');
    //直接在此初始化
    log("欢迎使用Wallpaper --By:wh131462");
    this.Wall = new Wallpaper(dom,dir)
    this.Wall.init();
}

initWallpaper().then(()=>{
    log("初始化成功！")
})
//Wallpaper Engine 属性监听对象
window.wallpaperPropertyListener = {
    applyUserProperties:(properties)=>{
        log("属性",properties)
        if(!this.Wall){
           this.initWallpaper().then(()=>{
               log("初始化壁纸 from engine")
           });
        }
        Object.keys(properties).forEach(key=>{
            let config={};
            config[key]=properties[key].value;
            this.Wall.setConfig(config)
        })
    }
}

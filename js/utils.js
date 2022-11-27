const Mode = {
    "img": "img",
    "video": "video",
    "random": "random"
}

//改写原型方法
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
console.error = (...rest) => {
    log("ERR:",...rest)
}


//工具
async function getJson(url) {
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("get", url);/*设置请求方法与路径*/
        request.send(null);/*不发送数据到服务器*/
        request.onload = function () {/*XHR对象获取到返回信息后执行*/
            if (request.status === 200) {/*返回状态为200，即为数据获取成功*/
                log("json已获取", new Date().valueOf())
               resolve(JSON.parse(request.responseText));
            }else{
                resolve(false)
            }
        }
    })
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

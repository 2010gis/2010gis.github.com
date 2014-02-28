$(document).ready(function () {
    //---------检测浏览器版本---------------------------------------------------//
    var BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        },
        searchString: function (data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        },
        dataBrowser: [
           {
               string: navigator.userAgent,
               subString: "Chrome",
               identity: "Chrome"
           },
           {
               string: navigator.vendor,
               subString: "Apple",
               identity: "Safari",
               versionSearch: "Version"
           },
           {
               prop: window.opera,
               identity: "Opera",
               versionSearch: "Version"
           },
           {
               string: navigator.userAgent,
               subString: "Firefox",
               identity: "Firefox"
           },
           {
               string: navigator.userAgent,
               subString: "MSIE",
               identity: "Explorer",
               versionSearch: "MSIE"
           },
           {
               string: navigator.userAgent,
               subString: "Gecko",
               identity: "Mozilla",
               versionSearch: "rv"
           },
           { // for older Netscapes (4-)
               string: navigator.userAgent,
               subString: "Mozilla",
               identity: "Netscape",
               versionSearch: "Mozilla"
           }
        ]
    };
    BrowserDetect.init();
    if (BrowserDetect.version <= 9 && BrowserDetect.browser == "Explorer") {
        //alert("IE版本小于8，请更新！");
        clickme(5);
    }
});

function addLoadingGif() {
    var h = $(document).height();
    $(".overlay").css({ "height": h });
    $(".overlay").css({ 'display': 'block', 'opacity': '0.8' });

    $(".showbox").animate({ 'display': 'block', 'margin-top': '250px', 'opacity': '0.8' }, 600);
    $("#AjaxLoading").css({ 'display': 'block' });
}

function removeLoadingGif() {
    $(".overlay").css({ 'display': 'none' });
    $(".showbox").css({ 'display': 'none' });
}

//function trim(str) {//去除首尾字符
//    for (var i = 0; i < str.length && str.charAt(i) == " "; i++);//从左到右得到最右边的第一个非空字符
//    for (var j = str.length; j > 0 && str.charAt(j - 1) == " "; j--);//从右到左得到最左边的第一个非空字符
//    if (i > j) return "";
//    return str.substring(i, j);//得到字符串  
//}


function login() {
    var username = $("#username").val();//取框中的用户名 
    //username = trim(username);
    //alert(username);
    var password = $("#password").val();//取框中的密码
    if (username == "" || password == "") {
        ZENG.msgbox.show("请输入完整", 5, 3000);
    } else {

        addLoadingGif();//加载动画框

        $.ajax({
            type: "GET",
            async: false,
            url: "http://www.bzjg.com.cn/10gis/10gis_login.ashx?username='" + username + "'&password='" + password + "'",
            //url: "http://localhost:10706/bzwebsite/Default.aspx?username='" + username + "'&password='" + password + "'",
            dataType: "jsonp",
            //jsonp: "callbackparam",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
            cache: true, //允许有缓存
            jsonpCallback: "success_jsonpCallback"//callback的function名称

        });
    }


}//function login结束

function success_jsonpCallback(o) {
    removeLoadingGif();
    var timestamp = Math.round(new Date().getTime() / 1000);//unix时间戳一个小时表示为UNIX时间戳格式为：3600秒；一天表示为UNIX时间戳为86400秒，闰秒不计算
    var timeout = timestamp + 3600;//设定过期时间为一个小时后过期
    if (decode(o.result) == "Verification successful") {
        //alert("登录成功，等待跳转"+decode(o.username));
        window.location.href = "main.html?us=" + o.username + "&timeout=" + timeout;
    } else if (decode(o.result) == "Verification Failure") {
        clickautohide(5);
        $("#password").val("");//用户名或密码错误，把密码清空
    } else {
        clickautohide(1);
    }
}

f23 = {};
f23.ts = "8ABC7DLO5MN6Z9EFGdeJfghijkHIVrstuvwWSTUXYabclmnopqKPQRxyz01234";
function decode(n) {
    var c = n.charAt(0) * 1
    if (isNaN(c)) return ""
    c = n.substr(1, c) * 1
    if (isNaN(c)) return ""
    var nl = n.length, t = [], a, f, b, x = String(c).length + 1, m = function (y) { return f23.ts.indexOf(n.charAt(y)) }, N = f23.ts.length
    if (nl != x + c) return ""
    while (x < nl) {
        a = m(x++)
        if (a < 5) f = a * N + m(x)
        else f = (a - 5) * N * N + m(x) * N + m(x += 1)
        t[t.length] = String.fromCharCode(f)
        x++
    }
    return t.join("")
}



function keyLogin() {//回车自动登录
    if (event.keyCode == 13) {
        event.returnValue = false;
        event.cancel = true;
        $("#btn_login").click();
    }
}


function clickme(i) {
    var tip = "";
    switch (i) {
        case 1:
            tip = "网络繁忙，请稍后再试。";
            break;
        case 4:
            tip = "设置成功！";
            break;
        case 5:
            tip = "本网页不支持IE8及其内核的浏览器，请升级或使用其他浏览器";
            break;
        case 6:
            tip = "正在加载中，请稍后...";
            break;
    }
    ZENG.msgbox.show(tip, i);
}
function clickhide() {
    ZENG.msgbox._hide();
}
function clickautohide(i) {
    var tip = "";
    switch (i) {
        case 1:
            tip = "网络繁忙，请稍后再试。";
            break;
        case 4:
            tip = "设置成功！";
            break;
        case 5:
            tip = "用户名或密码错误";
            break;
        case 6:
            tip = "正在加载中，请稍后...";
            break;
    }
    ZENG.msgbox.show(tip, i, 3000);
}
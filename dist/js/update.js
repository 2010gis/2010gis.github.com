dojo.require("esri.map");
dojo.require("esri.graphic");
dojo.require("esri.geometry.Point");
var username, map, geoservice, dingweiPoint, symbol, handler;
var ifpress = new Boolean(false);//用检测是否按了修改经纬度按钮,默认没按。

$(document).ready(function () {//最先运行
    if (getParamValue("timeout") < Math.round(new Date().getTime() / 1000)) {//检测时间，如果当前时间大于允许时间，重新登录
        window.location.href = "http://2010gis.github.io/";
    }
    $(".nav li:eq(0) a").attr("href", "http://2010gis.github.io/main.html?us=" + getParamValue("us") + "&timeout=" + getParamValue("timeout"));

    username = decode(getParamValue("us"));
    var len = username.length; username = username.substring(1, len - 1);
    $(".nav li:eq(2) a").text("当前用户:" + username);

    //找到所有的td节点  
    var abbrs = $("abbr");
    //给所有的td节点增加点击事件  
    abbrs.click(abbrclick);

    $.ajax({//获得 list
        url: "http://www.bzjg.com.cn/10gis/output_usinfo.ashx?us=" + username,
        type: "GET",
        dataType: "jsonp",
        jsonpCallback: 'output_usinfo_jsonpCallback', //定义回调函数名称//callback的function名称
        cache: true, //缓存
        async: true//异步
    });


    //-加载uploadify组件-----------------------------------------//
    $("#uploadify").uploadify({
        'uploader': 'dist/js/uploadify/swf/uploadify.swf',
        'script': 'http://www.bzjg.com.cn/10gis/Uploadimg.ashx',
        'cancelImg': 'dist/js/uploadify/images/cancel.png',
        'queueID': 'fileQueue',
        'queueSizeLimit': 1,
        'fileDesc': 'jpg、gif、png文件',
        'fileExt': '*.jpg;*.gif;*.png',
        'auto': false,
        'multi': true,
        'simUploadLimit': 1,
        'buttonText': 'BROWSE',
        'displayData': 'percentage',
        'scriptAccess': 'always',
        onComplete: function (evt, queueID, fileObj, response, data) { alert("操作结果: " + response); }
    });

});



function output_usinfo_jsonpCallback(o) {

    point_attr = {
        "studentID": o.statuses[0].studentID,
        "name": o.statuses[0].name,
        "tel": o.statuses[0].tel,
        "qq": o.statuses[0].qq,
        "address": o.statuses[0].address,
        "picurl": o.statuses[0].picurl,
        "longitude": o.statuses[0].longitude,
        "latitude": o.statuses[0].latitude
    };
    $("#infodiv li:eq(0) abbr").text(point_attr["tel"]);
    $("#infodiv li:eq(1) abbr").text(point_attr["qq"]);
    $("#infodiv li:eq(2) abbr").text(point_attr["address"]);

}

function abbrclick() {
    var abbr = $(this);//保存当前的abbr节点     
    var text = abbr.text(); //1.取出当前abbr中的文本内容保存起来      
    abbr.html("");//2.清空td中的文本内容      
    var input = $("<input style=' width:120px ' >");//3.建立一个文本框 也就是input的元素节点 (没有尖括号时候是找,有尖括号时是创建)  
    input.attr("value", text); //4.设置文本框的值是保存起来的文本内容  

    input.blur(function (event) {//失去焦点发生的事件,修改文本框中的内容
        var inputtext = input.val();//获取当前文本框的内容
        if (inputtext == "") {
            alert("内容不能为空");
        } else {
            var abbrNode = input.parent(); //拿到abbr节点  
            abbrNode.html(inputtext);
            abbrNode.click(abbrclick);//让abbr重新拥有点击事件 
        }
    });


    input.keyup(function (event) {//当敲击回车时，修改文本框内容        
        var myEvent = event || window.event;//解决不同的浏览器获取时间的对象的差异       
        var inputtext = input.val();
        if (myEvent.keyCode == 13) {
            if (inputtext == "") {
                alert("内容不能为空");
            } else {
                var abbrNode = input.parent(); //拿到abbr节点  
                abbrNode.html(inputtext);
                abbrNode.click(abbrclick);
            }
        }
    });

    var inputtext = input.val();//获取当前文本框的内容
    var abbrNode = input.parent(); //拿到abbr节点
    abbrNode.html(inputtext); //将保存的文本框的内容填充到abbr中
    abbrNode.click(abbrclick);//让abbr重新拥有点击事件
    abbr.append(input);//也可以用input.appendTo(abbr);  
    var inputdom = input.get(0);  //让文本框中的文字被高亮选中 需要将jquery的对象转换为dom对象  
    inputdom.select();
    abbr.unbind("click");// 清除td上注册的点击事件
}

function init() {//第二，仅次于document.ready
    var initExtent = new esri.geometry.Extent({ "xmin": 9827967.348792259, "ymin": 2640651.7462632125, "xmax": 14230740.17801724, "ymax": 5575833.632413201, "spatialReference": { wkid: 102100 } }); //没用这种new esri.SpatialReference({ wkid: 3857 })也可以
    map = new esri.Map("map", { extent: initExtent }); //{ extent:esri.geometry.geographicToWebMercator(initExtent)  }
    map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer("http://www.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer"));
    geoservice = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"); //在线的空间几何服务用于坐标系转换等

}
dojo.addOnLoad(init);


window.onload = function () {//window.onload最后加载，不然，下面的代码会显示 cann't call 'add' method for not defined,说明jsapi还未完全加载
    dingweiPoint = new esri.geometry.Point(point_attr["longitude"], point_attr["latitude"], new esri.SpatialReference({
        wkid: 4326
    })); // long经度 lat纬度  先经度后纬度
    symbol = new esri.symbol.PictureMarkerSymbol({ url: 'img/point.gif', width: 13, height: 13 });
    graphic = new esri.Graphic(dingweiPoint, symbol, point_attr, new esri.InfoTemplate("原来的位置"));
    map.graphics.add(graphic);
}


function bind() {

    ifpress = true;
    $("#long_lat_div").css("display", "block");
    handler = dojo.connect(map, "onClick", addpin);

    $("#longlat_btn").text("取消修改");
    $("#longlat_btn").attr("onclick", "nonupdate()");
}

function nonupdate() {
    ifpress = false;
    $("#long_lat_div").css("display", "none");
    dojo.disconnect(handler); //取消绑定地图点选事件
    $("#longlat_btn").text("修改经纬度");
    $("#longlat_btn").attr("onclick", "bind()");
}

function addpin(evt) {
    addLoadingGif();
    map.graphics.clear();
    var point = evt.mapPoint;
    var outSR = new esri.SpatialReference({ wkid: 4326 });
    var symbol = new esri.symbol.PictureMarkerSymbol("img/map_pin_alt_16.png", 20, 24);
    var graphic = new esri.Graphic(point, symbol);
    map.graphics.add(graphic);
    geoservice.project([point], outSR, function (projectedPoints) {
        pt = projectedPoints[0];
        $("#long").val(pt.x);
        $("#lat").val(pt.y);
    });
    // dojo.disconnect(handler); //然后再取消绑定地图点选事件，以免在图上点就出来一个图钉
    removeLoadingGif();
    //转换投影 帮助见文档，地址：https://developers.arcgis.com/en/javascript/jsapi/geometryservice-amd.html#project  https://developers.arcgis.com/en/javascript/jsapi/projectparameters-amd.html  
}


function showphotodiv() {
    $("#photodiv").css("display", "block");
    $("#changephoto_a").text("取消修改");
    $("#changephoto_a").attr("onclick", "hidephotodiv()");
}

function hidephotodiv() {
    $("#photodiv").css("display", "none");
    $("#changephoto_a").text("修改照片");
    $("#changephoto_a").attr("onclick", "showphotodiv()");
}


function update_info() {
    var tel = $("#infodiv li:eq(0) abbr").text();
    var qq = $("#infodiv li:eq(1) abbr").text();
    var address = $("#infodiv li:eq(2) abbr").text();
    if (ifpress == false) {//未修改经纬度
        $.ajax({
            url: "http://www.bzjg.com.cn/10gis/updateusinfo.ashx?us=" + username + "&tel=" + tel + "&qq=" + qq + "&address=" + address + "&ifpress=" + ifpress,
            type: "GET",
            dataType: "jsonp",
            jsonpCallback: 'update_usinfo_jsonpCallback', //定义回调函数名称//callback的function名称
            cache: true, //缓存
            async: true//异步
        });
    } else {//修改了经纬度
        var long = $("#long").val();
        var lat = $("#lat").val();
        $.ajax({
            url: "http://www.bzjg.com.cn/10gis/updateusinfo.ashx?us=" + username + "&tel=" + tel + "&qq=" + qq + "&address=" + address + "&ifpress=" + ifpress+"&long="+long+"&lat="+lat,
            type: "GET",
            dataType: "jsonp",
            jsonpCallback: 'update_usinfo_jsonpCallback', //定义回调函数名称//callback的function名称
            cache: true, //缓存
            async: true//异步
        });
    }
}



function update_usinfo_jsonpCallback(o) {
   
    if (o.result = true) {
        if (confirm("修改成功，去主页查看？")) {
            window.location.href = "http://2010gis.github.io/main.html?us=" + getParamValue("us") + "&timeout=" + getParamValue("timeout");
        }
        else {
            window.location.reload();
        }
    } else {
        alert("修改失败");
    }

    

}
//-----------获取地址栏参数----------------------------------------------------------//

function getParamValue(name) {//地址栏获取参数值
    var paramsArray = getUrlParams();
    if (paramsArray != null) {
        for (var i = 0 ; i < paramsArray.length ; i++) {
            for (var j in paramsArray[i]) {
                if (j == name) {
                    return paramsArray[i][j];
                }
            }
        }
    }
    return null;
}

function getUrlParams() {
    var search = window.location.search;
    // 写入数据字典
    var tmparray = search.substr(1, search.length).split("&");
    var paramsArray = new Array;
    if (tmparray != null) {
        for (var i = 0; i < tmparray.length; i++) {
            var reg = /[=|^==]/;    // 用=进行拆分，但不包括==
            var set1 = tmparray[i].replace(reg, '&');
            var tmpStr2 = set1.split('&');
            var array = new Array;
            array[tmpStr2[0]] = tmpStr2[1];
            paramsArray.push(array);
        }
    }
    // 将参数数组进行返回
    return paramsArray;
}



//----------------解码-----------------------------------------------------------//

f23 = {};
f23.ts = "8ABC7DLO5MN6Z9EFGdeJfghijkHIVrstuvwWSTUXYabclmnopqKPQRxyz01234";
function decode(n)//解密
{
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
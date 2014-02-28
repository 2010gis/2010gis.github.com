
dojo.require("esri.map");
dojo.require("esri.graphic");
dojo.require("esri.geometry.Point");
//document.ready先于window.onload 先于dojo.onload
//左侧列表必须先于点的加载  而js包的引用必须先于点的加载

var this_us;


window.onload = function () {
    addpoint();//加载点
}



$(document).ready(function () {
    $.ajax({//获得 list
        url: "http://www.bzjg.com.cn/10gis/outputpoint.ashx",
        type: "GET",
        dataType: "jsonp",
        jsonpCallback: 'outputmsg_jsonpCallback', //定义回调函数名称//callback的function名称
        cache: true, //缓存
        async: true//异步
    });

    

    addLoadingGif();
    // alert("timeout=" + getParamValue("timeout") + "nowtime=" + Math.round(new Date().getTime() / 1000));;
    if (getParamValue("timeout") < Math.round(new Date().getTime() / 1000)) {//检测时间，如果当前时间大于允许时间，重新登录
        window.location.href = "http://2010gis.github.io/";
    }
    this_us = decode(getParamValue("us")); 
    if (this_us) { //先解码，如果连解码都解不出，就不用验证了，直接重新登录
        ifhas();// 解码成功，然后再检测用户名，如果用户名不匹配，跳转至登录界面重新登录
    } else {
        window.location.href = "http://2010gis.github.io/";  // 解码都解不出，就不用验证了，直接重新登录
    }
    var timestamp = Math.round(new Date().getTime() / 1000);//unix时间戳一个小时表示为UNIX时间戳格式为：3600秒；一天表示为UNIX时间戳为86400秒，闰秒不计算
    timestamp = timestamp + 1200;//设置20分钟过期
    $(".nav li:eq(4) a").attr('href', 'update.html?us=' + getParamValue("us") + "&timeout=" + timestamp );//不能在这里加1200，会像字符串一样在末尾加1200

    var len = this_us.length;this_us = this_us.substring(1, len - 1);//去除首尾的''
    $(".nav li:eq(4) a").text('个人中心:' + this_us);
    $(".nav li:eq(1) a").attr('href', 'leavemsg.html?us='+ getParamValue("us")+ "&timeout=" + timestamp );//设置半个小时就过期
});//document.ready结束





function ifhas() {
    $.ajax({
        type: "GET",
        async: false,
        url: "http://www.bzjg.com.cn/10gis/confirmpeople.ashx?username=" + this_us,
        dataType: "jsonp",
        cache: true,
        jsonpCallback: "confirm_jsonpCallback"//callback的function名称
    });
}


function confirm_jsonpCallback(o) {
    if (decode(o.result) == "Verification Failure") {
        window.location.href = "http://2010gis.github.io/";
    } else {
        return;
        //go();不在这里执行，因为会在arcgis for js api还未载入的时候就执行，这是很多还没实例化 。事实证明，dojo的addonload比jquery的documentready执行的晚
    }
}


var map, geoservice, graphic, symbol, layer, dingweiPoint;
var pointsList = [];//点的数据列表
var attr = []//属性列表
var graphic_points = [];//graphic点列表
function init() {
    var initExtent = new esri.geometry.Extent({ "xmin": 9827967.348792259, "ymin": 2640651.7462632125, "xmax": 14230740.17801724, "ymax": 5575833.632413201, "spatialReference": { wkid: 102100 } }); //没用这种new esri.SpatialReference({ wkid: 3857 })也可以
    map = new esri.Map("map", { extent: initExtent }); //{ extent:esri.geometry.geographicToWebMercator(initExtent)  }
    map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer("http://www.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer"));
    geoservice = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"); //在线的空间几何服务用于坐标系转换等
    iTip = new InfoTip("i2Div", "infoTip white", map.position, true);
}
dojo.addOnLoad(init);

function outputmsg_jsonpCallback(o) {
    var leftul = $(".helix");
    for (var i = 0; i < o.statuses.length; i++) {
        pointsList[i] = o.statuses[i];
        attr[i] = {
            "studentID": o.statuses[i].studentID,
            "name": o.statuses[i].name,
            "tel": o.statuses[i].tel,
            "qq": o.statuses[i].qq,
            "address": o.statuses[i].address,
            "picurl": o.statuses[i].picurl,
            "longitude": o.statuses[i].longitude,
            "latitude": o.statuses[i].latitude
        };

        
        leftul.append("<li><a href=\"javascript:void(0)\" onClick=\"locat("+i+");\"  >学号:" + attr[i].studentID + "<br/>姓名:" + attr[i].name + "&nbsp;&nbsp;电话:" + attr[i].tel + "</a></li>");//绑定左侧数据列表 必须先于点的加载。否侧加载几个点，li就会重复几遍

        stroll.bind('#leftlist ul');
    }//for结束
}//function结束

function addpoint() {
    for (var i = 0; i < pointsList.length; i++) {
        if (pointsList[i]) {
           dingweiPoint = new esri.geometry.Point(attr[i].longitude, attr[i].latitude, new esri.SpatialReference({
                wkid: 4326
            })); // long经度 lat纬度  先经度后纬度
            symbol = new esri.symbol.PictureMarkerSymbol({ url: 'img/point.gif', width: 13, height: 13 }); 
            graphic = new esri.Graphic(dingweiPoint, symbol, attr[i], new esri.InfoTemplate("${name}", "大头贴：<img src='${picurl}' style=' width: 100px; height:100px'  alt='头像'/><br/> 学号：${studentID} </br>姓名：${name}<br/>  联系方式:${tel}<br/> QQ号码:${qq}<br/> 地址:${address}<br/>经度:${longitude}<br/>纬度${latitude}"));
            map.graphics.add(graphic);
            dojo.connect(map.graphics, "onMouseOver", g_onMouseOverHandler);
            dojo.connect(map.graphics, "onMouseOut", g_onMouseOutHandler);
            graphic_points.push(graphic);
            
            removeLoadingGif();
        } else {
            continue;
        }

    } //for循环结束
}//function结束

function g_onMouseOutHandler(evt) {
    iTip.hide();
}

function g_onMouseOverHandler(evt) {
    iTip.setClass('infoTip bgimage')
    iTip.setContent(evt.graphic.attributes.name);
    iTip.show(evt.screenPoint);
    //console.log(evt.screenPoint);
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

//----------------加载加载框和移出加载框---------------------------------------------------------//

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

//-----------点击左侧某一人时地图同时定位----------------------------------------------------------------------------------//
function locat(i) {
    var sspoint = new esri.geometry.Point({ "x": graphic_points[i].geometry.x, "y": graphic_points[i].geometry.y, "spatialReference": { "wkid": 4326 } });
    var screenPoint = map.toScreen(sspoint);
    iTip.setClass('infoTip bgimage')
    iTip.setContent(graphic_points[i].attributes.name);
   //var extent = new esri.geometry.Extent(graphic_points[i]._extent.xmin, graphic_points[i]._extent.ymin, graphic_points[i]._extent.xmax, graphic_points[i]._extent.ymax, new esri.SpatialReference({ wkid: 4326 }));
    //map.setExtent(extent);
    map.centerAndZoom(sspoint, 12);//https://developers.arcgis.com/en/javascript/jsapi/map-amd.html#centerandzoom
   setTimeout(function () {
       iTip.show(screenPoint);
   }, 3000);
    //var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
    //map.infoWindow.setTitle(graphic_points[i].attributes.name);
    //map.infoWindow.setContent(graphic_points[i].attributes.name);
    //var screenPnt = map.toScreen(graphic_points[i]);
    //map.infoWindow.show(screenPnt, map.getInfoWindowAnchor(screenPnt));
   // console.log(screenPoint);
    //map.infoWindow.setTitle("Coordinates");
    //map.infoWindow.setContent("哈哈！");
    //map.infoWindow.show(sspoint, esri.dijit.InfoWindow.ANCHOR_UPPERRIGHT);

   // console.log(graphic_points[i]);
    //console.log(screenPoint);
    
}



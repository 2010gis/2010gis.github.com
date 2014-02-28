<%@ page language="java" contentType="text/html; charset=utf-8"%>

<% 
String path = request.getContextPath(); 
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/"; 
%>

 

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>

      <head>

        <base href="<%=basePath%>">

        <title>Upload</title>

 <!--装载文件-->

        <link href="<%=path %>/css/default.css" rel="stylesheet" type="text/css" /> 
        <link href="<%=path %>/css/uploadify.css" rel="stylesheet" type="text/css" /> 
        
        <script type="text/javascript" src="<%=path %>/script/jquery-1.3.2.min.js"></script> 
        <script type="text/javascript" src="<%=path %>/script/swfobject.js"></script> 
        <script type="text/javascript" src="<%=path %>/script/jquery.uploadify.v2.1.0.min.js"></script>

   <!--ready事件-->

<script type="text/javascript">

$(document).ready(function() {

			    $("#uploadify").uploadify({
			        'uploader' : '<%=path %>/swf/uploadify.swf',
			        'script' : 'servlet/Upload',
			        'cancelImg' : '<%=path %>/images/cancel.png',
			        'queueID' : 'fileQueue',
			        'queueSizeLimit'  :2,
			        'fileDesc' : 'jpg、gif、swf文件',            
			        'fileExt' : '*.jpg;*.gif;*.swf',
			        'auto' : false,
			        'multi' : true,
			        'simUploadLimit' : 2,
			        'buttonText' : 'BROWSE',
			        'displayData' : 'percentage',
			        onComplete: function (evt, queueID, fileObj, response, data) {alert("上传成功: "+response);}
			    }); 
			}); 
</script>
</head>

    <body> 
        <div id="fileQueue"></div> 
        <input type="file" name="uploadify" id="uploadify" /> 
        <p> 
        <a href="javascript:jQuery('#uploadify').uploadifyUpload()">开始上传</a>&nbsp; 
        <a href="javascript:jQuery('#uploadify').uploadifyClearQueue()">取消所有上传</a> 
        </p> 
    </body> 
</html>


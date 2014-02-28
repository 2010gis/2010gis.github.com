$(function(){    

	$("li>h5","#questions").bind("click",function(){
	    var li=$(this).parent();
		if(li.hasClass("fold")){
			li.removeClass("fold");
			$(this).find("b").removeClass("UI-bubble").addClass("UI-ask");
			li.find(".foldContent").slideDown();
		}else{
			li.addClass("fold");
			$(this).find("b").removeClass("UI-ask").addClass("UI-bubble");
			li.find(".foldContent").slideUp();
		}
	});
	
})
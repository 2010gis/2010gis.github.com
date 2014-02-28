

<%
	String fileUrl = (String)request.getParameter("folder");
	System.out.println(fileUrl);
	
	
	String savePath = this.getServletConfig().getServletContext().getRealPath(fileUrl);  
 	
 	System.out.println(savePath);
	response.getWriter().write("1");
%>
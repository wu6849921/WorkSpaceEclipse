function demoRssPortlet(portlet) {
	portlet.setTitle('Joe Test Link');
	portlet.addLine('百度', 'http://www.baidu.com', 5);
	portlet.addLine('跳转到百度');
	portlet.addLine(' ');

	var poUrl = nlapiResolveURL('RECORD', 'purchaseorder');
	portlet.addLine('New Purchase Order', poUrl);
	portlet.addLine('新建PO');
}

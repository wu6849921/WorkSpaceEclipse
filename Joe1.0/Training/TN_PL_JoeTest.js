function demoRssPortlet(portlet) {
	portlet.setTitle('Joe Test Link');
	portlet.addLine('�ٶ�', 'http://www.baidu.com', 5);
	portlet.addLine('��ת���ٶ�');
	portlet.addLine(' ');

	var poUrl = nlapiResolveURL('RECORD', 'purchaseorder');
	portlet.addLine('New Purchase Order', poUrl);
	portlet.addLine('�½�PO');
}

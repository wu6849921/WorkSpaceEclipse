/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function DownloadCabinetFolder(request,response)
{

var form = nlapiCreateForm(' NSWMS Print Driver ');
var ctx = nlapiGetContext();

var f=getLoadFileforIntegration('NSWMS Print Driver installation Guide.pdf')

var cd=f.name;
var d=f.folder;
var fdinternalid=f.id;
nlapiLogExecution('Error',"FolderId", d );
nlapiLogExecution('Error',"fdinternalid", fdinternalid );
nlapiLogExecution('Error',"cd", cd );
var  htmlfileurl=f.getURL();
 var sublist = form.addSubList("custpage_integrationfiles", "list","NSWMS Print Driver Files");
//sublist.addField("custpage_integration", "text", "Integration Files");

sublist.addField("custpage_donwload", "text", "Download Print Driver Files");
var htmlduplicatestring = "/app/common/media/mediaitemfolders.nl?folder=" + d + "&whence=";
var htmlurl="";

nlapiLogExecution('Error',"htmlurl", htmlurl );
var htmltext = "";
//form.getSubList('custpage_integrationfiles').setLineItemValue('custpage_integration', 1, "Integration Files");
form.getSubList('custpage_integrationfiles').setLineItemValue('custpage_donwload', 1, '<a href="' + htmlduplicatestring + '" target="_self">Download Print Driver Files</a>');
//form.getSubList('custpage_integrationfiles').setLineItemValue('custpage_donwload', 1, '<a href="' + htmlfileurl + '" target="_self">Download</a>');
//form.getSubList('custpage_integrationfiles').setLineItemValue('custpage_donwload', 1, '<a href="' + response.write(htmlfileurl) + '" target="_self">Download</a>');
//form.getSublist('custpage_integrationfiles').setLineItemValue('custpage_donwload', 1, '<a>Pick Report</a>');

response.writePage(form);


}
 
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jul 2015     Zed
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
    try{
    	var nsaccount = [];
    	var chinaaccount=[];
    	var r=[];
    	var notmultiple=[];
    	var classlang = new trigger.local.language();
    	var lang = nlapiGetContext().getPreference('language');
    	
    	var sc = nlapiLoadSearch('transaction','customsearch_tn_coamappingvarification');
    	var resultSet = sc.runSearch();
    	for(var i=0;i<100;i++){
    		var rts = resultSet.getResults(i*1000, (i+1)*1000);
    		if(rts.length<=0) break;
    		for(var j=0;j<rts.length;j++){
    			var cols=rts[j].getAllColumns();
    			var accountid=rts[j].getValue(cols[0]);
    			var accounttext=rts[j].getText(cols[0]);
    			var departmentid=rts[j].getValue(cols[1]);
    			var departmenttext=rts[j].getText(cols[1]);
    			nsaccount.push(accountid.toString()+'--'+accounttext+','+departmentid+'--'+departmenttext);
    		}
    	}
    	
    	var sc = nlapiLoadSearch('customrecord_trigger_mapping_cn_coa','customsearch_trigger_mapping_cn_coa');
    	var resultSet = sc.runSearch();
    	for(var i=0;i<100;i++){
    		var rts = resultSet.getResults(i*1000, (i+1)*1000);
    		if(rts.length<=0) break;
    		for(var j=0;j<rts.length;j++){
    			var cols=rts[j].getAllColumns();
    			
    			var ismultiple=rts[j].getValue(cols[2]);
    			
    			
    			var accountid=rts[j].getValue(cols[7]);
    			var accounttext=rts[j].getValue(cols[8]);
    			var departmentid=rts[j].getValue(cols[3]);
    			var departmenttext=rts[j].getText(cols[3]);
    			var isInactive=rts[j].getValue('isinactive');
    			if(isInactive == 'F'){//ignore existing inactive mapping, behave the same way like mapping doesn't exist
	    			if(ismultiple=='F'&&notmultiple.indexOf(accountid)==-1){
	    				notmultiple.push(accountid);
	    			}
	    			else{
	    				chinaaccount.push(accountid.toString()+'--'+accounttext+','+departmentid+'--'+departmenttext);
	    			}
    			}
    		}
    	}
    	for(var i=0;i<nsaccount.length;i++){
    		var accid=nsaccount[i].substring(0,nsaccount[i].toString().indexOf('--'));
    		if(notmultiple.indexOf(accid)==-1 && chinaaccount.indexOf(nsaccount[i])==-1){
    			r.push(nsaccount[i]);
    		}
    	}
    	nlapiLogExecution('debug','r.length',r.length);
    	var missingMappingTxt = classlang.GetMsgMissingMaping(lang);
    	var html='';
    	html+='<table>';
    	for(var i=0;i<r.length;i++){
    		
    		var t=r[i].split(',');
    		if(i%2==0){
    			html+='<tr>';
    		    html+='<td>' + missingMappingTxt + t[0] + '</td>';
    		    if(t[1] != 'null--null'){//if there is no department value, don't print it as a missing value 
    		    	html+='<td>' + t[1] + '</td>';
    		    }    		    
    		    html+='</tr>';
    		}
    		else{
    			html+='<tr style="background-color:yellow" >';
    			html+='<td>' + missingMappingTxt + t[0]+'</td>';
    			if(t[1] != 'null--null'){//if there is no department value, don't print it as a missing value 
    				html+='<td>' + t[1] + '</td>';
    			}        		
        		html+='</tr>';
    		}
    	}
    	html+='</table>';
    	if(html=='<table></table>'){    		
    		html = classlang.GetMsgSuccesfullMaping(lang);
    	} 
    	response.write(html);
    	//nlapiLogExecution('debug','r.length',r.length);
    }
    catch(ex){
    	nlapiLogExecution('debug','suitelet',ex);
    }
}


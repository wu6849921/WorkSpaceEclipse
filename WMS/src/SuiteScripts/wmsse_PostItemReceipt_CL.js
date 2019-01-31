/***************************************************************************
ï¿½eBizNET Solutions Inc 
 ****************************************************************************
 *
 *ï¿½ $Source: /cvs/products/NSWMS/EoN/WMS_UI/Transactions/Inbound/Client/Attic/ebiz_PostItemReceipt_CL.js,v $
 *ï¿½ $Revision: 1.1.2.2 $
 *ï¿½ $Date: 2014/06/18 15:42:19 $
 *ï¿½ $Author: sponnaganti $
 *ï¿½ $Name: b_eBN_2014_1_3_StdBundle_Issues $
 *
 * DESCRIPTION
 *ï¿½ Functionality
 *
 * REVISION HISTORY
 *ï¿½ $Log: ebiz_PostItemReceipt_CL.js,v $
 *ï¿½ Revision 1.1.2.2  2014/06/18 15:42:19  sponnaganti
 *ï¿½ case# 20148632
 *ï¿½ Stnd Bundle Issue fix
 *ï¿½
 *ï¿½ Revision 1.1.2.1  2013/07/25 08:58:20  rmukkera
 *ï¿½ landed cost cr new file
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.14  2013/06/25 16:00:47  skreddy
 *ï¿½ CASE# 20123113
 *ï¿½ Serial Number count equal to Order Qty
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.13  2013/06/25 14:50:29  mbpragada
 *ï¿½ Case# 20123176
 *ï¿½ System throwing invalid LP range in GUI check-in.
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.12  2013/05/20 15:22:23  grao
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Standard bundle issues fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.11  2013/05/10 13:57:11  grao
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Standard bundle issues fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.10  2013/05/08 15:23:01  skreddy
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Standard bundle Issue Fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.9  2013/05/08 15:13:34  grao
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Standard bundle issues fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.8  2013/05/01 12:44:21  rmukkera
 *ï¿½ Autobreakdownrelated changes were done
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.7  2013/04/17 15:54:21  skreddy
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ issue fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.6  2013/04/09 08:48:30  grao
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Issue fixed for set alert for serial numbers
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.5  2013/04/03 20:40:48  kavitha
 *ï¿½ CASE201112/CR201113/LOG2012392
 *ï¿½ TSG Issue fixes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.4  2013/03/19 12:21:59  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ change url path
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.3  2013/03/19 11:46:48  snimmakayala
 *ï¿½ CASE201112/CR201113/LOG2012392
 *ï¿½ Production and UAT issue fixes.
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.2  2013/03/05 13:35:46  rmukkera
 *ï¿½ Merging of lexjet Bundle files to Standard bundle
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6.2.1  2013/02/26 12:56:04  skreddy
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ merged boombah changes
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.6  2013/02/22 06:42:18  skreddy
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ issue related to accepting invalid lp Prefix
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.5  2013/02/07 08:49:54  skreddy
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Date Validation
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.4  2012/12/14 07:42:52  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ moved from 2012.2 branch
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.3  2012/11/01 14:55:22  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Decimal Qty Conversions
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.2  2012/10/03 11:29:53  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Auto Gen Lot No
 *ï¿½
 *ï¿½ Revision 1.18.2.20.4.1  2012/09/26 21:41:39  svanama
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ item label generation code added
 *ï¿½
 *ï¿½ Revision 1.18.2.20  2012/09/14 07:20:47  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ checking for null
 *ï¿½
 *ï¿½ Revision 1.18.2.19  2012/08/29 16:19:23  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Changed Prompt message.
 *ï¿½
 *ï¿½ Revision 1.18.2.18  2012/08/23 23:16:10  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Change of sentence which we are prompting at the time of UPC code update.
 *ï¿½
 *ï¿½ Revision 1.18.2.17  2012/08/22 14:48:04  schepuri
 *ï¿½ no message
 *ï¿½
 *ï¿½ Revision 1.18.2.16  2012/08/21 22:41:33  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Prompting user weather Change in UPC code is updated to item master or not
 *ï¿½
 *ï¿½ Revision 1.18.2.15  2012/08/03 13:20:07  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Validating recommended quantity
 *ï¿½
 *ï¿½ Revision 1.18.2.14  2012/06/19 07:13:59  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Issue related to creating same batch# for multiple Sku's.
 *ï¿½
 *ï¿½ Revision 1.18.2.13  2012/06/18 12:59:34  rrpulicherla
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ validation on location
 *ï¿½
 *ï¿½ Revision 1.18.2.12  2012/05/29 12:45:24  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ issue fix for vaidating qty
 *ï¿½
 *ï¿½ Revision 1.18.2.11  2012/05/21 13:04:16  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ validation on checkin once checkin already completed
 *ï¿½
 *ï¿½ Revision 1.18.2.10  2012/05/07 13:43:44  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Showing a popup window to scan serialitem# in putaway confirmation screen.
 *ï¿½
 *ï¿½ Revision 1.18.2.9  2012/04/26 07:14:43  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Removing unwanted alert Messages.
 *ï¿½
 *ï¿½ Revision 1.18.2.8  2012/04/25 15:41:15  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Validating entered Batch Item issue is resolved.
 *ï¿½
 *ï¿½ Revision 1.18.2.7  2012/04/20 12:26:36  schepuri
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ changing the Label of Batch #  field to Lot#
 *ï¿½
 *ï¿½ Revision 1.18.2.6  2012/04/06 17:11:24  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Unwanted alert Msg are removed.
 *ï¿½
 *ï¿½ Revision 1.18.2.5  2012/03/30 05:02:25  vrgurujala
 *ï¿½ t_NSWMS_LOG201121_91
 *ï¿½
 *ï¿½ Revision 1.23  2012/03/30 05:00:16  vrgurujala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½
 *ï¿½ Revision 1.22  2012/02/08 12:03:08  snimmakayala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Code Merge
 *ï¿½
 *ï¿½ Revision 1.21  2012/01/30 07:05:05  snimmakayala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½
 *ï¿½ Revision 1.20  2012/01/23 10:18:50  spendyala
 *ï¿½ CASE201112/CR201113/LOG201121
 *ï¿½ Added SearchColumn to fetch the record with highest UOMLevel from item dimensions.
 *ï¿½
 *
 ****************************************************************************/

/**
 * @author LN
 *@version
 *@date
 *@Description: This is a Client Script acting as a Library function to Check-In Screen line
 level LP validation
 */


function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function ValidateLine(type, name)
{	

	var poid = nlapiGetFieldValue('custpage_order');
	
	if(poid!=null && poid!='')
	{
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [2,6]));
		filters.push(new nlobjSearchFilter('custrecord_wmsse_act_end_date', null, 'isempty'));
		filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null, 'anyof',['@NONE@']));
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'isempty'));
		filters.push(new nlobjSearchFilter('tranid','custrecord_wmsse_order_no', 'is', poid));

		var opentaskSearchResults=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filters,null);


		if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0)
		{
			/*if(tempVar=='open putaways')
		{*/
			var result=confirm('There are Open Putaway Tasks against this PO, Do you still want to continue?');
			//alert('result'+result);
			if (result==true)
			{

				//nlapiSetFieldValue('custpage_tempnew','yes');
				nlapiSetFieldValue('custpage_tempnew',"yes");
				//alert('custpage_tempnew'+nlapiGetFieldValue('custpage_tempnew'));
				return true;
				
			}
			else
			{
				
				//nlapiSetFieldValue('custpage_tempnew','no');
				nlapiSetFieldValue('custpage_tempnew'," ");
				return true;
			}


			//}
		}
		else
		{
			return true;
		}
	}
	else
	{
		return true;
	}



}
//upto here

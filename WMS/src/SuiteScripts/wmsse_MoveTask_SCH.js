/**
 * Module Description
 * To move open pick tasks of shipped orders from open tasks to closed task. 
 * Version    Date            Author           Remarks
 * 1.00       27 Aug 2015     Ganesh
 *
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function MoveTaskToClosed(type) {
	nlapiLogExecution('ERROR','type',type); 

	var objOTDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openpickstomove',null, null);

	if(objOTDetails != null && objOTDetails != '')
	{
		for(var i=0;i<objOTDetails.length;i++)
		{
			nlapiLogExecution('ERROR','vOpenIntId',objOTDetails[i].getId());
			try
			{
			MoveTaskRecord(objOTDetails[i]);
			}
			catch(ex)
			{
				nlapiLogExecution('Debug', 'Exception: ', ex);
			}

		}	

	}	
}

/***
 * 
 * @param RecordID //Open task record object
 */
function MoveTaskRecord(objOTDetails){

	var wmsClosedRecord = nlapiCreateRecord('customrecord_wmsse_trn_closedtask');
	wmsClosedRecord.setFieldValue('name', objOTDetails.getValue('name'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_task_opentaskid_clt', objOTDetails.getId());
	if(objOTDetails.getValue('custrecord_wmsse_act_begin_date') != null && objOTDetails.getValue('custrecord_wmsse_act_begin_date') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_act_begin_date_clt', objOTDetails.getValue('custrecord_wmsse_act_begin_date'));
	if(objOTDetails.getValue('custrecord_wmsse_act_end_date') != null && objOTDetails.getValue('custrecord_wmsse_act_end_date') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_act_end_date_clt', objOTDetails.getValue('custrecord_wmsse_act_end_date'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_act_qty_clt', objOTDetails.getValue('custrecord_wmsse_act_qty'));
	if(objOTDetails.getValue('custrecord_wmsse_batch_no') != null && objOTDetails.getValue('custrecord_wmsse_batch_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_batch_no_clt', objOTDetails.getValue('custrecord_wmsse_batch_no'));
	if(objOTDetails.getValue('custrecord_wmsse_comp_id') != null && objOTDetails.getValue('custrecord_wmsse_comp_id') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_comp_id_clt', objOTDetails.getValue('custrecord_wmsse_comp_id'));
	if(objOTDetails.getValue('custrecord_wmsse_currentdate') != null && objOTDetails.getValue('custrecord_wmsse_currentdate') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_currentdate_clt', objOTDetails.getValue('custrecord_wmsse_currentdate'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_container_lp_no_clt', objOTDetails.getValue('custrecord_wmsse_container_lp_no'));
	if(objOTDetails.getValue('custrecord_wmsse_sku') != null && objOTDetails.getValue('custrecord_wmsse_sku') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_sku_clt', objOTDetails.getValue('custrecord_wmsse_sku'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_skudesc_clt', objOTDetails.getValue('custrecord_wmsse_skudesc'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_expe_qty_clt', objOTDetails.getValue('custrecord_wmsse_expe_qty'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_line_no_clt', objOTDetails.getValue('custrecord_wmsse_line_no'));
	if(objOTDetails.getValue('custrecord_wmsse_wms_status_flag') != null && objOTDetails.getValue('custrecord_wmsse_wms_status_flag') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_wms_status_flag_clt', objOTDetails.getValue('custrecord_wmsse_wms_status_flag'));
	if(objOTDetails.getValue('custrecord_wmsse_tasktype') != null && objOTDetails.getValue('custrecord_wmsse_tasktype') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_tasktype_clt', objOTDetails.getValue('custrecord_wmsse_tasktype'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_totalcube_clt', objOTDetails.getValue('custrecord_wmsse_totalcube'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_total_weight_clt', objOTDetails.getValue('custrecord_wmsse_total_weight'));
	if(objOTDetails.getValue('custrecord_wmsse_upd_user_no') != null && objOTDetails.getValue('custrecord_wmsse_upd_user_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_upd_user_no_clt', objOTDetails.getValue('custrecord_wmsse_upd_user_no'));
	if(objOTDetails.getValue('custrecord_wmsse_actbeginloc') != null && objOTDetails.getValue('custrecord_wmsse_actbeginloc') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_actbeginloc_clt', objOTDetails.getValue('custrecord_wmsse_actbeginloc'));
	if(objOTDetails.getValue('custrecord_wmsse_actendloc') != null && objOTDetails.getValue('custrecord_wmsse_actendloc') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_actendloc_clt', objOTDetails.getValue('custrecord_wmsse_actendloc'));
	if(objOTDetails.getValue('custrecord_wmsse_expirydate') != null && objOTDetails.getValue('custrecord_wmsse_expirydate') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_expirydate_clt', objOTDetails.getValue('custrecord_wmsse_expirydate'));
	if(objOTDetails.getValue('custrecord_wmsse_fifodate') != null && objOTDetails.getValue('custrecord_wmsse_fifodate') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_fifodate_clt', objOTDetails.getValue('custrecord_wmsse_fifodate'));
	if(objOTDetails.getValue('custrecord_wmsse_order_no') != null && objOTDetails.getValue('custrecord_wmsse_order_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_order_no_clt', objOTDetails.getValue('custrecord_wmsse_order_no'));
	if(objOTDetails.getValue('custrecord_wmsse_wms_location') != null && objOTDetails.getValue('custrecord_wmsse_wms_location') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_wms_location_clt', objOTDetails.getValue('custrecord_wmsse_wms_location'));
	if(objOTDetails.getValue('custrecord_wmsse_put_strategy') != null && objOTDetails.getValue('custrecord_wmsse_put_strategy') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_put_strategy_clt', objOTDetails.getValue('custrecord_wmsse_put_strategy'));
	if(objOTDetails.getValue('custrecord_wmsse_pick_strategy') != null && objOTDetails.getValue('custrecord_wmsse_pick_strategy') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_pick_strategy_clt', objOTDetails.getValue('custrecord_wmsse_pick_strategy'));
	if(objOTDetails.getValue('custrecord_wmsse_zone_no') != null && objOTDetails.getValue('custrecord_wmsse_zone_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_zone_no_clt', objOTDetails.getValue('custrecord_wmsse_zone_no'));
	if(objOTDetails.getValue('custrecord_wmsse_parent_sku_no') != null && objOTDetails.getValue('custrecord_wmsse_parent_sku_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_parent_sku_no_clt', objOTDetails.getValue('custrecord_wmsse_parent_sku_no'));
	if(objOTDetails.getValue('custrecord_wmsse_nsconfirm_ref_no') != null && objOTDetails.getValue('custrecord_wmsse_nsconfirm_ref_no') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no_clt', objOTDetails.getValue('custrecord_wmsse_nsconfirm_ref_no'));

	wmsClosedRecord.setFieldValue('custrecord_wmsse_report_no_clt', objOTDetails.getValue('custrecord_wmsse_report_no'));


	wmsClosedRecord.setFieldValue('custrecord_wmsse_container_size_clt', objOTDetails.getValue('custrecord_wmsse_container_size'));
	if(objOTDetails.getValue('custrecord_wmsse_containerweight') != null && objOTDetails.getValue('custrecord_wmsse_containerweight') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_containerweight_clt', objOTDetails.getValue('custrecord_wmsse_containerweight'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_device_upload_flag_clt', objOTDetails.getValue('custrecord_wmsse_device_upload_flag'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_serial_no_clt', objOTDetails.getValue('custrecord_wmsse_serial_no'));
	if(objOTDetails.getValue('custrecord_wmsse_customer') != null && objOTDetails.getValue('custrecord_wmsse_customer') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_customer_clt', objOTDetails.getValue('custrecord_wmsse_customer'));
	if(objOTDetails.getValue('custrecord_wmsse_actualbegintime') != null && objOTDetails.getValue('custrecord_wmsse_actualbegintime') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_actualbegintime_clt', objOTDetails.getValue('custrecord_wmsse_actualbegintime'));
	if(objOTDetails.getValue('custrecord_wmsse_actualendtime') != null && objOTDetails.getValue('custrecord_wmsse_actualendtime') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_actualendtime_clt', objOTDetails.getValue('custrecord_wmsse_actualendtime'));

	wmsClosedRecord.setFieldValue('custrecord_wmsse_hostid_clt', objOTDetails.getValue('custrecord_wmsse_hostid'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_batch_num_clt', objOTDetails.getValue('custrecord_wmsse_batch_num'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_compitm_expqty_clt', objOTDetails.getValue('custrecord_wmsse_compitm_expqty'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_compitm_actqty_clt', objOTDetails.getValue('custrecord_wmsse_compitm_actqty'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_kitflag_clt', objOTDetails.getValue('custrecord_wmsse_kitflag'));
	
	if(objOTDetails.getValue('custrecord_wmsse_act_wms_location') != null && objOTDetails.getValue('custrecord_wmsse_act_wms_location') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_act_wms_location_clt', objOTDetails.getValue('custrecord_wmsse_act_wms_location'));
	if(objOTDetails.getValue('custrecord_wmsse_pick_comp_date') != null && objOTDetails.getValue('custrecord_wmsse_pick_comp_date') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_pick_comp_date_clt', objOTDetails.getValue('custrecord_wmsse_pick_comp_date'));
	if(objOTDetails.getValue('custrecord_wmsse_pack_comp_date') != null && objOTDetails.getValue('custrecord_wmsse_pack_comp_date') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_pack_comp_date_clt', objOTDetails.getValue('custrecord_wmsse_pack_comp_date'));
	if(objOTDetails.getValue('custrecord_wmsse_ship_comp_date') != null && objOTDetails.getValue('custrecord_wmsse_ship_comp_date') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_ship_comp_date_clt', objOTDetails.getValue('custrecord_wmsse_ship_comp_date'));

	wmsClosedRecord.setFieldValue('custrecord_wmsse_multi_bins_clt', objOTDetails.getValue('custrecord_wmsse_multi_bins'));
	if(objOTDetails.getValue('custrecord_wmsse_shipmethod') != null && objOTDetails.getValue('custrecord_wmsse_shipmethod') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_shipmethod_clt', objOTDetails.getValue('custrecord_wmsse_shipmethod'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_pickreport_no_clt', objOTDetails.getValue('custrecord_wmsse_pickreport_no'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_uom_clt', objOTDetails.getValue('custrecord_wmsse_uom'));
	if(objOTDetails.getValue('custrecord_wmsse_conversionrate') != null && objOTDetails.getValue('custrecord_wmsse_conversionrate') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_conversionrate_clt', objOTDetails.getValue('custrecord_wmsse_conversionrate'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_orderindex_clt', objOTDetails.getValue('custrecord_wmsse_orderindex'));
	if(objOTDetails.getValue('custrecord_wmsse_task_assignedto') != null && objOTDetails.getValue('custrecord_wmsse_task_assignedto') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_task_assignedto_clt', objOTDetails.getValue('custrecord_wmsse_task_assignedto'));
	wmsClosedRecord.setFieldValue('custrecord_wmsse_task_opentaskid_clt', objOTDetails.getValue('custrecord_wmsse_task_opentaskid'));
	if(objOTDetails.getValue('lastmodified') != null && objOTDetails.getValue('lastmodified') != '')
		wmsClosedRecord.setFieldValue('custrecord_wmsse_lastmodified_clt', objOTDetails.getValue('lastmodified'));

	var recid = nlapiSubmitRecord(wmsClosedRecord);
	
	var id = nlapiDeleteRecord('customrecord_wmsse_trn_opentask', objOTDetails.getId());
}

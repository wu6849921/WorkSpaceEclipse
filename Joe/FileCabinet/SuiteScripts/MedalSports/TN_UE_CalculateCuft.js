/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search','N/format' ],

function(record, search,format) {
	  /**
		 * Function definition to be triggered before record is loaded.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.newRecord - New record
		 * @param {Record}
		 *            scriptContext.oldRecord - Old record
		 * @param {string}
		 *            scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
    function beforeSubmit(context) {
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;
				var ctnPackSize;
				var sizeArr=[];
				var piSearch = search
						.create({
							type : 'customrecord_tn_packinginfo',
							filters : [ [ 'custrecord_tn_parentrec', 'is',
									newRecord.id ] ],
							columns : [ 'internalid' ]
						});
				piSearch.run().each(function(result) {
					var piId = result.id;
					var piRec = record.load({
						type : 'customrecord_tn_packinginfo',
						id : piId
					});
					var packingType = piRec.getText({
						fieldId : 'custrecord_tn_packingtype'
					});
					var packSize = piRec.getValue({
						fieldId : 'custrecord_tn_pack_size'
					});	
					var lSize = piRec.getValue({
						fieldId : 'custrecord_tn_l'
					});
					var wSize = piRec.getValue({
						fieldId : 'custrecord_tn_w'
					});
					var hSize = piRec.getValue({
						fieldId : 'custrecord_tn_h'
					});
					if(packingType == 'Master Carton'){
						ctnPackSize = packSize;
					}
					if(packingType == 'Retail'){
// sizeArr = [lSize,wSize,hSize];
						sizeArr.push(lSize);
						sizeArr.push(wSize);
						sizeArr.push(hSize);
					}
					return true;
				});
				
				// 计算Pallet weight（Loading）
				var palletWeight = newRecord.getValue({
					fieldId : 'custitem_tn_pallet_weight'
				});
				var itemGrossWeight = newRecord.getValue({
					fieldId : 'custitem_tn_item_gross_weight'
				});
				if(ctnPackSize&&palletWeight&&itemGrossWeight){
					newRecord.setValue({
						fieldId : 'custitem_tn_pallet_weight_loading',
						value : palletWeight+itemGrossWeight*ctnPackSize
					});
				}
				
				// 计算是否选哟托盘pallet
				// 排序
				sizeArr = sortarr(sizeArr);
// for(var i=0;i<sizeArr.length;i++){
// for(var j = i + 1;j<sizeArr.length;j++){
// if(sizeArr[i]>sizeArr[j]){
// var tmp = sizeArr[i];
// sizeArr[i] = sizeArr[j];
// sizeArr[j] = tmp;
// }
// }
// }
				var maxGirth=(sizeArr[0]+sizeArr[1])*2+sizeArr[2];
				var maxWeight = itemGrossWeight;
				var longestSide=sizeArr[2];
				
// log.debug({
// title :maxWeight+'|'+maxGirth+'|'+longestSide
// });
				if(maxWeight>150 ||maxGirth>150 ||longestSide>108){
					newRecord.setValue({
						fieldId : 'custitem_tn_pallet',
						value : true
					});
				}else{
					newRecord.setValue({
						fieldId : 'custitem_tn_pallet',
						value : false
					});
				}
			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
		}
    }
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(context) {
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;
// var loadingWeight = newRecord.getValue({
// fieldId : 'custitem_tn_loading_weight'
// });
				
				// 设置item Compliance20180921
				search
				.create({
					type : 'customrecord_tn_itemcompliance',
					filters : [ [ 'custrecord_tn_ic_item', 'is',
							newRecord.id ] ]
				}).run().each(function(result) {
					var icId = result.id;
					var icRec = record.load({
						type : 'customrecord_tn_itemcompliance',
						id : icId
					});
					var soNum = icRec.getValue({
						fieldId : 'custrecord_tn_item_compliance_so'
					});
					var poNum = icRec.getValue({
						fieldId : 'custrecord_tn_item_compliance_po'
					});
					if (!soNum || !poNum) {
						return true;
					}
					var soRecord = record.load({
						type : record.Type.SALES_ORDER,
						id : soNum
					});
					var numLines = soRecord.getLineCount({
						sublistId : 'item'
					});
					var factor;
					var shipDates = [];
					for (var i = 0; i < numLines; i++) {
						var soItem = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : i
						});
						var soPoNum = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_line_customerpo',
							line : i
						});
						var earlyShipDate = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_esd',
							line : i
						});
						var vendorName = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_vendorshortname',
							line : i
						});
						if (soItem == newRecord.id && soPoNum == poNum) {
							factor = vendorName;
							if (shipDates.indexOf(earlyShipDate) == -1) {
								shipDates.push(earlyShipDate);
							}
						}
					}
					var shipDatesN = sortarr(shipDates);
					var earlyShipDate = shipDatesN[0];
					if (earlyShipDate) {
						icRec.setValue({
							fieldId : 'custrecord_tn_item_compliance_shipdate',
							value : earlyShipDate
						});
					}
					if (factor) {
						icRec.setValue({
							fieldId : 'custrecord_tn_item_compliance_factory',
							value : factor
						});
					}
					icRec.save();
					return true;
				});
				
				// 设置packingInfo
				var loadingPackSizes=[];
				var loadingCBMs=[];
				var loadingWeights=[];
				var piSearch = search
						.create({
							type : 'customrecord_tn_packinginfo',
							filters : [ [ 'custrecord_tn_parentrec', 'is',
									newRecord.id ] ],
							columns : [ 'internalid' ]
						});
				
				piSearch.run().each(function(result) {
					var piId = result.id;
					var piRec = record.load({
						type : 'customrecord_tn_packinginfo',
						id : piId
					});
					var lSize = piRec.getValue({
						fieldId : 'custrecord_tn_l'
					});
					var wSize = piRec.getValue({
						fieldId : 'custrecord_tn_w'
					});
					var hSize = piRec.getValue({
						fieldId : 'custrecord_tn_h'
					});
					var grossweight = piRec.getValue({
						fieldId : 'custrecord_tn_pif_grossweight'
					});
					var netweightkg = piRec.getValue({
						fieldId : 'custrecord_tn_pif_netweightkg'
					});
					
					var containerType = piRec.getValue({
						fieldId : 'custrecord_tn_packinfo_ct'
					});
					
					// 计算cuft,cbm
					if (lSize && wSize && hSize) { 
						piRec.setValue({
							fieldId : 'custrecord_tn_cuft',
							value : lSize * wSize * hSize / 1728
						});
						piRec.setValue({
							fieldId : 'custrecord_tn_cbm',
							value : lSize * wSize * hSize / 1728 / 35.315
						});
					}
					if (grossweight) {
						piRec.setValue({
							fieldId : 'custrecord_tn_pif_grossweightlb',
							value : grossweight*2.2
						});
					}
					if (netweightkg) {
						piRec.setValue({
							fieldId : 'custrecord_tn_pif_netweightlb',
							value : netweightkg*2.2
						});
					}
					piRec.save({
						ignoreMandatoryFields : true
					});
					
					var packingType = piRec.getText({
						fieldId : 'custrecord_tn_packingtype'
					});
					var packSize = piRec.getValue({
						fieldId : 'custrecord_tn_pack_size'
					});	
					var CBM = piRec.getValue({
						fieldId : 'custrecord_tn_cbm'
					});	
					// 取出loading CBM 取出loading packsize
					if(packingType == 'Loading'){
						loadingPackSizes.push([containerType,packSize]);
						loadingCBMs.push([containerType,CBM]);
						loadingWeights.push([containerType,grossweight]);
// loadingPackSize = packSize;
// loadingCBM = CBM;
					}
					return true;
				});
				
				// 设置Total CBM 及ContainerWeight
				var ciSearch = search.create({
					type : 'customrecord_tn_containerinfo',
					filters : [ [ 'custrecord_tn_parentrec2', 'is',
							newRecord.id ] ],
					columns : [ 'internalid' ]
				});
				ciSearch.run().each(function(result) {
					var ciId = result.id;
					var ciRec = record.load({
						type : 'customrecord_tn_containerinfo',
						id : ciId
					});
					var loadingQua = ciRec.getValue({
						fieldId : 'custrecord_tn_loadingquantity'
					});
					var containerType = ciRec.getValue({
						fieldId : 'custrecord_tn_containertype'
					});
					var loadingPackSize;
// log.debug({
// title : 'loadingPackSizes',
// details : loadingPackSizes
// });
					for (var i = 0; i < loadingPackSizes.length; i++) {
						if (loadingPackSizes[i][0]==containerType) {
							loadingPackSize=loadingPackSizes[i][1];
						}
					}
					var loadingCBM;
					for (var i = 0; i < loadingCBMs.length; i++) {
						if (loadingCBMs[i][0]==containerType) {
							loadingCBM=loadingCBMs[i][1];
						}
					}
					var loadingWeight;
					for (var i = 0; i < loadingWeights.length; i++) {
						if (loadingWeights[i][0]==containerType) {
							loadingWeight=loadingWeights[i][1];
						}
					}
					if(loadingQua&&loadingPackSize){
						if(loadingCBM){
							ciRec.setValue({
								fieldId : 'custrecord_tn_totalcbm',
								value : loadingQua/loadingPackSize*loadingCBM
							});
						}
						if(loadingWeight){
							ciRec.setValue({
								fieldId : 'custrecord_tn_containerweight',
								value : loadingQua/loadingPackSize*loadingWeight
							});
							ciRec.setValue({
								fieldId : 'custrecord_tn_containerweightlb',
								value : loadingQua/loadingPackSize*loadingWeight*2.2
							});
						}
					}
					ciRec.save({
						ignoreMandatoryFields : true
					});
					return true;
				});
				
				
				// 设置Factory History Cost valid to
				// 查询最后一条记录
				var lastCust;
				var lastFac;
				var lastId;
				var fhcSearch = search.create({
					type : 'customrecord_tn_factoryhistorycost',
					filters : [ [ 'custrecord_tn_item_fobitem', 'is',
							newRecord.id ] ],
					columns : [ 'custrecord_tn_item_cusname','custrecord_tn_item_factory' ]
				});
				fhcSearch.run().each(function(result) {
					lastCust = result.getValue({
						name:'custrecord_tn_item_cusname'
					});
					lastFac = result.getValue({
						name:'custrecord_tn_item_factory'
					});
					lastId = result.id;
					return true;
				});
				// 查询所有和最后一条同样条件的record
				var fhcIds=[];
				var fhcSearch1 = search.create({
					type : 'customrecord_tn_factoryhistorycost',
					filters : [ [ 'custrecord_tn_item_fobitem', 'is',
							newRecord.id ],'AND',[ 'custrecord_tn_item_cusname', 'is',
								lastCust ],'AND',[ 'custrecord_tn_item_factory', 'is',
									lastFac ] ]
				});
				fhcSearch1.run().each(function(result) {
					fhcIds.push(parseInt(result.id));
					return true;
				});
				// 找到上一条record
				// 排序
				fhcIds = sortarr(fhcIds);
				if (fhcIds.length<=1) {
					return;
				}
				var fhcRec = record.load({
					type : 'customrecord_tn_factoryhistorycost',
					id : fhcIds[fhcIds.length-2]
				});
				var validto = fhcRec.getValue({
					fieldId : 'custrecord_tn_cr_validto'
				});
				if (!validto) {
					fhcRec.setValue({
						fieldId : 'custrecord_tn_cr_validto',
						value : new Date()
					});
					fhcRec.save();
				}
				
			}
		} catch (e) {
			log.debug({
				title : 'afterSubmit',
				details : e
			});
		}
	}
	function sortarr(arr){
	    for(i=0;i<arr.length-1;i++){
	        for(j=0;j<arr.length-1-i;j++){
	            if(arr[j]>arr[j+1]){
	                var temp=arr[j];
	                arr[j]=arr[j+1];
	                arr[j+1]=temp;
	            }
	        }
	    }
	    return arr;
	}

	return {
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};

});

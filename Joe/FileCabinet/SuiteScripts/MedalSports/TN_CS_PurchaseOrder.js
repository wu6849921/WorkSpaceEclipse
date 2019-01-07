/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/search', 'N/record', 'N/currency', 'N/format' ], function(search,
		record, _currency, _format) {
	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		if (sublistName === 'item' && sublistFieldName === 'item') {
			setRate(currentRecord, search, record);
		}
	}

	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function validateLine(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		if (sublistName === 'item') {
			var ams = currentRecord.getValue({
				fieldId : 'custbody_tn_po_ams'
			});
			var cycutoff = currentRecord.getValue({
				fieldId : 'custbody_tn_po_cycutoff'
			});
			var etd = currentRecord.getValue({
				fieldId : 'custbody_tn_po_etd'
			});
			var eta = currentRecord.getValue({
				fieldId : 'custbody_tn_po_eta'
			});

			var lineAms = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_po_lineams'
			});
			if (ams && lineAms == '') {
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_lineams',
					value : ams
				});
			}

			var lineCycut = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_po_linecycut'
			});
			if (cycutoff && lineCycut == '') {
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_linecycut',
					value : cycutoff,
				});
			}

			var lineTd = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_po_linetd'
			});
			if (etd && lineTd == '') {
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_linetd',
					value : etd,
				});
			}

			var lineTa = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_po_lineta'
			});
			if (eta && lineTa == '') {
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_lineta',
					value : eta,
				});
			}

			// 设置rate
			setRate(currentRecord, search, record);
		}
		return true;
	}

	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function pageInit(context) {
		try {
			var currentRecord = context.currentRecord;
			// alert(context.mode);
			if (context.mode != 'create') {
				return;
			}
			var createdFrom = currentRecord.getValue({
				fieldId : 'createdfrom'
			});
			if (!createdFrom) {
				return;
			}
			var recType;
			var woRecId;
			search.create({
				type : search.Type.TRANSACTION,
				filters : [ [ 'internalid', 'is', createdFrom ] ]
			}).run().each(function(result) {
				recType = result.recordType;
				woRecId = result.id;
				return true;
			});
			if (!recType || recType != search.Type.WORK_ORDER) {
				return;
			}

			// 开始设置item值
			var woRec = record.load({
				type : record.Type.WORK_ORDER,
				id : woRecId
			});
			var createdFromSo = woRec.getValue({
				fieldId : 'createdfrom'
			});
			var assemblyitem = woRec.getValue({
				fieldId : 'assemblyitem'
			});
			// 先存放所有so上的数据
			var customerPO = [];
			var esdPO = [];
			var lsdPO = [];
			var itdPO = [];
			var finalDesPO = [];
			var soRecord = record.load({
				type : record.Type.SALES_ORDER,
				id : createdFromSo
			});
			var numLines = soRecord.getLineCount({
				sublistId : 'item'
			});

			for (var i = 0; i < numLines; i++) {
				var customerPOC = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_line_customerpo',
					line : i
				});
				var createwo = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'createwo',
					line : i
				});
				var esd = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_esd',
					line : i
				});
				var lsd = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_lsd',
					line : i
				});
				var itd = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_itd',
					line : i
				});
				var shipdes = soRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_shipdes',
					line : i
				});
				if (createwo) {
					customerPO.push(customerPOC);
					esdPO.push(esd);
					lsdPO.push(lsd);
					itdPO.push(itd);
					finalDesPO.push(shipdes);
					// break;
				}
			}
			var inLineTmp = 0;
			var inLine = 0;
			search.create({
				type : search.Type.WORK_ORDER,
				filters : [ [ 'createdfrom', 'is', createdFromSo ] ]
			}).run().each(function(result) {
				if (result.id == woRec.id) {
					inLine = inLineTmp;
				}
				inLineTmp++;
				return true;
			});
			var numLinesPo = currentRecord.getLineCount({
				sublistId : 'item'
			})
			for (var i = 0; i < numLinesPo; i++) {
				var lineNum = currentRecord.selectLine({
					sublistId : 'item',
					line : i
				});
				lineNum.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_esd',
					value : esdPO[inLine]
				});
				lineNum.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_lsd',
					value : lsdPO[inLine]
				});
				lineNum.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_po_itd',
					value : itdPO[inLine]
				});
				lineNum.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_line_customerpo',
					value : customerPO[inLine]
				});
				lineNum.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_shipdes',
					value : finalDesPO[inLine]
				});
				lineNum.commitLine({
					sublistId : 'item'
				});
			}
		} catch (ex) {
			alert(ex);
		}
	}

	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	// function lineInit(scriptContext) {
	// var currentRecord = scriptContext.currentRecord;
	// var sublistId = scriptContext.sublistId;
	// var currIndex = currentRecord.getCurrentSublistIndex({
	// sublistId : 'item'
	// });
	// alert(currIndex);
	// var rateField = currentRecord.getSublistField({
	// sublistId : 'item',
	// fieldId : 'rate',
	// line : currIndex
	// });
	// rateField.isDisabled = true;
	// }
	function setRate(currentRecord, search, record) {
		var currencyTarget = currentRecord.getValue({
			fieldId : 'currency'
		});
		// alert(currency);
		var factory = currentRecord.getValue({
			fieldId : 'entity'
		});
		var custId = currentRecord.getValue({
			fieldId : 'custbody_tn_po_custid'
		});
		var itemId = currentRecord.getCurrentSublistValue({
			sublistId : 'item',
			fieldId : 'item'
		});
		var quantity = currentRecord.getCurrentSublistValue({
			sublistId : 'item',
			fieldId : 'quantity'
		});
		var _date = currentRecord.getValue({
			fieldId : 'trandate'
		});
		// alert(_date);
		if (!itemId) {
			return;
		}
		var filters = [ [ 'custrecord_tn_item_fobitem', 'is', itemId ], 'AND',
				[ 'custrecord_tn_item_factory', 'anyof', factory ] ];
		if (custId) {
			filters.push('AND',
					[ 'custrecord_tn_item_cusname', 'anyof', custId ]);
		}
		var factoryCost;
		var currencySource;
		var fhcSearch = search
				.create({
					type : 'customrecord_tn_factoryhistorycost',
					filters : filters,
					columns : [ 'custrecord_tn_item_factorycost',
							'custrecord_tn_item_currency',
							'custrecord_tn_item_validfrom',
							'custrecord_tn_cr_validto' ]
				});
		fhcSearch.run().each(function(result) {
			var validfrom = result.getValue({
				name : 'custrecord_tn_item_validfrom'
			});
			var validto = result.getValue({
				name : 'custrecord_tn_cr_validto'
			});
			// var currencySource = result.getValue({
			// name : 'custrecord_tn_cr_validto'
			// });
			var validfromDate = _format.parse({
				value : validfrom,
				type : _format.Type.DATE
			})
			var validtoDate;
			if (validto) {
				validtoDate = _format.parse({
					value : validto,
					type : _format.Type.DATE
				})
			}
			// alert(validfromDate);
			if (validfromDate <= _date) {
				if (validtoDate) {
					if (validtoDate >= _date) {
						// alert(validfromDate);
						factoryCost = result.getValue({
							name : 'custrecord_tn_item_factorycost'
						});
						currencySource = result.getValue({
							name : 'custrecord_tn_item_currency'
						});
					}
				} else {
					factoryCost = result.getValue({
						name : 'custrecord_tn_item_factorycost'
					});
					currencySource = result.getValue({
						name : 'custrecord_tn_item_currency'
					});
				}
			}
			return true;
		});
		// alert(currencySource);
		// alert(factoryCost);
		if (!factoryCost) {
			// 如果factoryCost没有，则取item里面的值
			// alert(itemId);
			search.create({
				type : search.Type.ITEM,
				filters : [ [ 'internalid', 'is', itemId ] ]
			}).run().each(function(result) {
				var itemRec = record.load({
					type : result.recordType,
					id : result.id
				});
				currencySource = itemRec.getValue({
					fieldId : 'currency'
				});
				// 先查询itemvendor
				var numLines = itemRec.getLineCount({
					sublistId : 'itemvendor'
				});
				var vendorPrice;
				for (var i = 0; i < numLines; i++) {
					var purchaseprice = itemRec.getSublistValue({
						sublistId : 'itemvendor',
						fieldId : 'purchaseprice',
						line : i,
					});
					var vendor = itemRec.getSublistValue({
						sublistId : 'itemvendor',
						fieldId : 'vendor',
						line : i,
					});
					var currencyname = itemRec.getSublistValue({
						sublistId : 'itemvendor',
						fieldId : 'vendorcurrencyname',
						line : i,
					});
					if (factory == vendor) {
						vendorPrice = purchaseprice;
						// alert(currencyname);
						currencySource = currencyname;
					}
				}
				if (vendorPrice) {
					factoryCost = vendorPrice;
				} else {// 如果vendorprice没有，则取bodyprice
					var cost = itemRec.getValue({
						fieldId : 'cost'
					});
					var lastpurchaseprice = itemRec.getValue({
						fieldId : 'lastpurchaseprice'
					});
					if (cost) {
						factoryCost = cost;
					} else if (lastpurchaseprice) {
						factoryCost = lastpurchaseprice;
					}
				}
				return true;
			});
		}
		// alert(currencySource);
		// alert(currencyTarget);
		var exchangeRate = _currency.exchangeRate({
			source : currencySource,
			target : currencyTarget
		});
		factoryCost = factoryCost ? factoryCost : 0;
		currentRecord.setCurrentSublistValue({
			sublistId : 'item',
			fieldId : 'rate',
			value : factoryCost * exchangeRate
		});
		currentRecord.setCurrentSublistValue({
			sublistId : 'item',
			fieldId : 'amount',
			value : factoryCost * quantity * exchangeRate
		});
	}
	return {
		fieldChanged : fieldChanged,
		validateLine : validateLine,
		pageInit : pageInit
	// ,
	// lineInit : lineInit
	};
});
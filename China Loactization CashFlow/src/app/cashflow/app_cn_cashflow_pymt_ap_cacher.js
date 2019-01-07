/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ '../../lib/wrapper/ns_wrapper_search',
		'../../lib/wrapper/ns_wrapper_record' ], function(search, record) {

	var custorecordtype = 'customrecord_cn_cashflow_data_cacher';

	/*
	 * @desc check the param is too large or not . @param {object} [params] -
	 * cashflow_params. @return boolean the check result.
	 */
	function hasExceedMaxLimit(params) {
		var paramstr = JSON.stringify(params);
		if (paramstr.length >= 4000) {
			return true;
		} else {
			return false;
		}

	}

	/*
	 * @desc cache the param to customerecord . @param {object} [params] -
	 * params. @return number the internal id of the saved record.
	 */
	function cacheParamsToRecord(params) {
		var cacherecord = record.create({
			type : custorecordtype,
			isDynamic : true
		});
		cacherecord.setValue({
			fieldId : 'custrecord_cachedata',
			value : JSON.stringify(params)
		});

		return cacherecord.save();
	}

	/*
	 * @desc get the cache param from customerecord. @param {String} [id] -
	 * internal id. @return the cached param.
	 */
	function getCacheRecord(id) {
		var cacherecord = record.load({
			type : custorecordtype,
			id : id
		});
		var resultobjstr = cacherecord.getValue({
			fieldId : 'custrecord_cachedata'
		});
		return JSON.parse(resultobjstr);
	}

	/*
	 * @desc delete the useless cache record. @param {String} [id] - internal
	 * id. @return the result.
	 */
	function deleteCacheRecord(id) {
		try {
			record.remove({
				type : custorecordtype,
				id : id
			});
		} catch (ex) {
			log.error('deleteCacheRecord', 'Delete error: ' + ex.message);
			return false;
		}
		return true;
	}

	return {
		hasExceedMaxLimit : hasExceedMaxLimit,
		cacheParamsToRecord : cacheParamsToRecord,
		getCacheRecord : getCacheRecord,
		deleteCacheRecord : deleteCacheRecord
	};

});

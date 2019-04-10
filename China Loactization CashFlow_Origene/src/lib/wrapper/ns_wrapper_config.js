/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ 'N/config', '../../dao/cn_currency_dao',
		'../../lib/wrapper/ns_wrapper_runtime',
		'../../res/common/commonresource', '../../lib/commons' ], function(
		config, currencyDao, runtime, resource, commons) {
	function load(type) {
		return config.load(type);
	}

	function getCurrency(params) {
		var subsidiaryId = params.subsidiaryId;
		var countryCode = params.countryCode;
		var defaultValue = params.defaultValue;

		var results;

		if (runtime.isMultiCurrency()) {
			if (runtime.isOW()) {
				results = currencyDao.getCurrencyOfSubsidiary(subsidiaryId);
				if (!commons.makesure(results)) {
					results = currencyDao
							.fetchCurrencyById(getCompanyCurrency());
				}
			} else {
				results = currencyDao.fetchCurrencyById(getCompanyCurrency());
			}
		}
		if (commons.makesure(results)) {
			return results;
		}

		if (commons.makesure(countryCode)) {
			results = resource.load({
				name : resource.Name.Currencies,
				key : countryCode
			});
		}
		if (commons.makesure(results)) {
			return results;
		}

		if (commons.makesure(defaultValue)) {
			return defaultValue;
		}

		return getChinaCurrency();
	}

	function getChinaCurrency() {
		return resource.load({
			name : resource.Name.Currencies,
			key : 'CN',
			defaultValue : {
				"name" : "Yuan",
				"code" : "CNY"
			}
		});
	}

	function getCompanyCurrency() {
		var configRecObj = config.load({
			type : config.Type.COMPANY_INFORMATION
		});

		return configRecObj.getValue('basecurrency');
	}

	function getCompanyName() {
		var configRecObj = config.load({
			type : config.Type.COMPANY_INFORMATION
		});

		return configRecObj.getValue('companyname');
	}

	function getCountry() {
		var configRecObj = config.load({
			type : config.Type.COMPANY_INFORMATION
		});

		return configRecObj.getValue('country');
	}

	function getEmployerId() {
		var configRecObj = config.load({
			type : config.Type.COMPANY_INFORMATION
		});

		return configRecObj.getValue('employerid');
	}

	function getPreference(configType, fieldId) {
		var configObj = config.load({
			type : configType
		});
		return configObj.getValue(fieldId);
	}

	function setOnlyShowLastSubaccount(value) {
		var pref = load(config.Type.USER_PREFERENCES);
		pref.setValue({
			fieldId : 'ONLYSHOWLASTSUBACCT',
			value : value
		});
		pref.save();
	}

	function onlyShowLastSubaccount() {
		return getPreference(config.Type.USER_PREFERENCES,
				'ONLYSHOWLASTSUBACCT');
	}

	var wrapper = {
		load : load,
		getCurrency : getCurrency,
		getCompanyName : getCompanyName,
		getChinaCurrency : getChinaCurrency,
		getCompanyCurrency : getCompanyCurrency,
		getCountry : getCountry,
		getEmployerId : getEmployerId,
		getPreference : getPreference,
		onlyShowLastSubaccount : onlyShowLastSubaccount,
		setOnlyShowLastSubaccount : setOnlyShowLastSubaccount
	};

	Object.defineProperty(wrapper, 'Type', {
		enumerable : true,
		get : function() {
			return config.Type;
		}
	});

	return wrapper;
});

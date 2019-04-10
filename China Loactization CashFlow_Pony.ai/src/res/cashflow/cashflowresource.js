/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([ '../../lib/wrapper/ns_wrapper_file',
		'../../lib/wrapper/ns_wrapper_cache',
		'../../lib/wrapper/ns_wrapper_runtime', '../../lib/commons' ],
		function(file, cache, runtime, commons) {

			var names = {
				Labels : 'Labels'
			};

			// scope: cache bundle available
			function getCache() {
				return cache.getCache({
					name : cache.Name.CashFlow,
					scope : cache.Scope.PROTECTED
				});
			}

			function targetName(name) {
				if (runtime.getUserLanguage() === 'zh_CN') {
					return name + '_zh_CN';
				} else {
					return name + '_en_US';
				}
			}

			function load(params) {
				log.debug('cashflowresource.js: params', params);
				if (!commons.makesure(params)) {
					return;
				}

				var name = commons.isPrimitive(params) ? params : params.name;
				var key = commons.isPrimitive(params) ? null : params.key;
				var defaultValue = commons.isPrimitive(params) ? null
						: params.defaultValue;
				var contents;
				if (commons.makesure(params.language)) {
					// contents = getCache()
					// .get(
					// {
					// key : name + '_' + params.language,
					// loader : function() {
					// return file
					// .load(
					// {
					// path : 'src/res/cashflow/cashflow_'
					// + name
					// .toLowerCase()
					// + '_'
					// + params.language
					// + '.json'
					// }).getContents();
					// },
					// ttl : 1 * 60 * 60
					// // 1hr
					// });
					contents = file.load(
							{
								path : 'src/res/cashflow/cashflow_'
										+ name.toLowerCase() + '_'
										+ params.language + '.json'
							}).getContents();
				} else {
					// contents = getCache()
					// .get(
					// {
					// key : targetName(name),
					// loader : function() {
					// return file
					// .load(
					// {
					// path : 'src/res/cashflow/cashflow_'
					// + targetName(name
					// .toLowerCase())
					// + '.json'
					// }).getContents();
					// },
					// ttl : 1 * 60 * 60
					// // 1hr
					// });
					// 调试代码不要用缓存 会有问题
					contents = file.load(
							{
								path : 'src/res/cashflow/cashflow_'
										+ targetName(name.toLowerCase())
										+ '.json'
							}).getContents();
				}

				log.debug('cashflowresource.js: loading contents', contents);

				var jsonObject = JSON.parse(contents);
				if (name === names.Labels && !runtime.isOW()) {
					jsonObject.Subsidiary = jsonObject.Company;
				}
				if (commons.makesure(key)) {
					if (commons.makesureall(jsonObject, key)) {
						log.debug('cashflowresource.js: value of key',
								jsonObject[key]);
						return jsonObject[key];
					} else {
						log.audit('cashflowresource.js: value of key',
								'Unable to locate key, default value '
										+ defaultValue + ' returned.');
						return defaultValue;
					}
				}
				return jsonObject;
			}

			var resource = {
				load : load
			};

			Object.defineProperty(resource, 'Name', {
				enumerable : true,
				get : function() {
					return names;
				}
			});

			return resource;

		});

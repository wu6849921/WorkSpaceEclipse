/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([ '../../lib/wrapper/ns_wrapper_search',
		'../../lib/wrapper/ns_wrapper_runtime', '../../lib/commons' ],
		function(search, runtime, commons) {

			var SEARCH_RANGE_SIZE = 1000;

			// USED FOR search.Column
			function create() {
				var params = {
					name : this.name,
					join : this.join
				};
				if (commons.makesure(this.summary)) {
					params.summary = this.summary;
				}
				if (commons.makesure(this.sortValue)) {
					params.sort = this.sortValue;
				}
				return search.createColumn(params);
			}

			function reference(targetTable) {
				this.join = targetTable;
				return this;
			}

			function sort(value) {
				this.sortValue = value;
				return this;
			}

			function asc() {
				this.sort(search.Sort.ASC);
				return this;
			}

			function desc() {
				this.sort(search.Sort.DESC);
				return this;
			}

			function group() {
				this.summary = search.Summary.GROUP;
				return this;
			}

			function max() {
				this.summary = search.Summary.MAX;
				return this;
			}

			function sum() {
				this.summary = search.Summary.SUM;
				return this;
			}

			function column(name) {
				return {
					name : name,
					reference : reference,
					sort : sort,
					asc : asc,
					desc : desc,
					group : group,
					max : max,
					sum : sum,
					create : create
				};
			}
			// END

			// USED FOR search.Filter
			function is(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.IS,
					values : values
				});
			}
			function isnot(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.ISNOT,
					values : values
				});
			}

			function startswith(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.STARTSWITH,
					values : values
				});
			}

			function anyof(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.ANYOF,
					values : values
				});
			}
			function noneof(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.NONEOF,
					values : values
				});
			}

			function after(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.AFTER,
					values : values
				});
			}

			function onorafter(values) {
				return search.createFilter({
					name : this.name,
					join : this.join,
					operator : search.Operator.ONORAFTER,
					values : values
				});
			}

			function before(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.BEFORE,
					values : values
				});
			}

			function onorbefore(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.ONORBEFORE,
					values : values
				});
			}

			function on(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.ON,
					values : values
				});
			}

			function equalto(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.EQUALTO,
					values : values
				});
			}
			function notequalto(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.NOTEQUALTO,
					values : values
				});
			}
			function greaterthanorequalto(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.GREATERTHANOREQUALTO,
					values : values
				});
			}
			function lessthanorequalto(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.LESSTHANOREQUALTO,
					values : values
				});
			}
			function between(values) {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.BETWEEN,
					values : values
				});
			}
			function isnotempty() {
				return search.createFilter({
					join : this.join,
					name : this.name,
					operator : search.Operator.ISNOTEMPTY
				});
			}
			function filter(columnName) {
				return {
					name : columnName,
					reference : reference,
					is : is,
					isnot : isnot,
					anyof : anyof,
					noneof : noneof,
					after : after,
					onorafter : onorafter,
					before : before,
					onorbefore : onorbefore,
					on : on,
					startswith : startswith,
					equalto : equalto,
					notequalto : notequalto,
					greaterthanorequalto : greaterthanorequalto,
					lessthanorequalto : lessthanorequalto,
					between : between,
					isnotempty : isnotempty
				};
			}
			// END

			/*
			 * results.length = 10000 lines
			 *  | Options | Upper Limit | Governance | Time(seconds) | |
			 * ----------------- | ----------- | ---------- | ------------- | |
			 * run & getRange | NO | 100 | 47 | | runPaged & fetch | NO | 50 |
			 * 60 | | run & each | 4000 | N/A | N/A |
			 */
			function resultset(params) {
				var results = params;
				var start = 0;
				var end = null;
				if (commons.makesure(params.resultset)) {
					results = params.resultset;
					start = commons.toNormalizedNumber(params.start);
					end = params.end;
				}
				if (!commons.makesure(results) || start < 0
						|| commons.makesure(end) && start > end) {
					return null;
				}

				var startTime = runtime.clock();
				log.audit(
						'start getting results(' + start + '-' + end + ')...',
						startTime);

				var whole = [], slices = [];
				var from = start, t0 = start;
				do {
					from = t0;
					t0 = to({
						from : from,
						end : end
					});
					slices = results.getRange({
						start : from,
						end : t0
					});
					whole = whole.concat(slices);
				} while (!reach({
					from : from,
					to : t0,
					end : end,
					returnedSize : slices.length
				}));

				log.audit('time spent (ms): search and get results', runtime
						.clock()
						- startTime);

				return whole;
			}

			function to(params) {
				if (commons.makesure(params.end)
						&& params.from + SEARCH_RANGE_SIZE > params.end) {
					return params.end;
				} else {
					return params.from + SEARCH_RANGE_SIZE;
				}
			}

			function reach(params) {
				if (commons.makesure(params.end) && params.to === params.end) {
					// fetched all data
					return true;
				}
				if (params.returnedSize < params.to - params.from) {
					// no more data
					return true;
				}
				return false;
			}

			return {
				column : column,
				filter : filter,
				resultset : resultset
			};

		});

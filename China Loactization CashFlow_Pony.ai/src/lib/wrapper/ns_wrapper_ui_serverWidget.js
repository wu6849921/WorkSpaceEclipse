/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ 'N/ui/serverWidget' ], function(serverWidget) {

	function createForm(title, hideNavBar) {
		return serverWidget.createForm(title, hideNavBar);
	}

	function createList(title, hideNavBar) {
		return serverWidget.createList(title, hideNavBar);
	}

	var wrapper = {
		createForm : createForm,
		createList : createList
	};

	Object.defineProperty(wrapper, 'FieldType', {
		enumerable : true,
		get : function() {
			return serverWidget.FieldType;
		}
	});

	Object.defineProperty(wrapper, 'SublistType', {
		enumerable : true,
		get : function() {
			return serverWidget.SublistType;
		}
	});

	Object.defineProperty(wrapper, 'FieldDisplayType', {
		enumerable : true,
		get : function() {
			return serverWidget.FieldDisplayType;
		}
	});

	Object.defineProperty(wrapper, 'FieldLayoutType', {
		enumerable : true,
		get : function() {
			return serverWidget.FieldLayoutType;
		}
	});

	Object.defineProperty(wrapper, 'FieldBreakType', {
		enumerable : true,
		get : function() {
			return serverWidget.FieldBreakType;
		}
	});

	return wrapper;

});

/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ 'N/render', './ns_wrapper_runtime', '../commons' ], function(render,
		runtime, commons) {
	var templateRenderer;

	function getRenderer() {
		if (!templateRenderer) {
			templateRenderer = render.create();
		}
		return templateRenderer;
	}

	/**
	 * Using the string for setting the content
	 */
	function setTemplateContents(contents) {
		getRenderer().templateContent = contents;
	}

	function addRecord(label, record) {
		getRenderer().addRecord(label, record);
	}

	function addSearchResults(label, search) {
		getRenderer().addSearchResults(label, search);
	}

	function addDataSource(label, object) {
		var renderer = getRenderer();

		switch (typeof object) {
		case 'nlobjRecord':
			renderer.addRecord(label, object);
			break;
		case 'nlobjSearchResult':
			renderer.addSearchResults(label, object);
			break;
		default:
			break;
		}
	}

	function addCustomDataSource(label, format, object) {
		getRenderer().addCustomDataSource({
			alias : label,
			format : format,
			data : object
		});
	}

	function renderAsString() {
		return getRenderer().renderAsString();
	}

	function renderAsPdf() {
		return getRenderer().renderAsPdf();
	}

	function xmlToPdf(xml) {
		return render.xmlToPdf({
			xmlString : xml
		});
	}

	function renderTransactionAsPdf(tranid) {
		return render.transaction({
			entityId : commons.toNumber(tranid),
			printMode : render.PrintMode.PDF
		});
	}

	return {
		setTemplateContents : setTemplateContents,
		addRecord : addRecord,
		addSearchResults : addSearchResults,
		addDataSource : addDataSource,
		addCustomDataSource : addCustomDataSource,
		renderAsString : renderAsString,
		renderAsPdf : renderAsPdf,
		xmlToPdf : xmlToPdf,
		renderTransactionAsPdf : renderTransactionAsPdf,
		DataSource : render.DataSource
	};

});

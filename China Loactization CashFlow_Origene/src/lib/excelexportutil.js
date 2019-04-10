/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define(
		[],

		function() {
			/**
			 * @desc get export url.
			 * @param {number}
			 *            [tableId] - table id.
			 * @return {object} - export url.
			 */
			function getExportUrl(elementId) {
				var blob = getExportBlob(elementId);
				var url = window.URL.createObjectURL(blob);
				return url;
			}

			/**
			 * @desc get export url.
			 * @param {number}
			 *            [tableId] - table id.
			 * @return {object} - export url.
			 */
			function getExportCashFlowUrl(elementId) {
				var blob = getExportBlobForCashFlow(elementId);
				var url = window.URL.createObjectURL(blob);
				return url;
			}

			function getExportBlob(elementId) {
				var table = document.getElementById(elementId);
				var excelTemplateHeader = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Balance Sheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>';
				var excelTemplateFooter = '</table></body></html>';
				var excelFileContent = excelTemplateHeader + table.innerHTML
						+ excelTemplateFooter;
				var base64data = base64(excelFileContent);
				return b64toBlob(base64data, 'application/vnd.ms-excel');
			}

			/**
			 * @desc getExportBlobForCashFlow.
			 * @param {elementId}
			 *            div id.
			 * @return {object} - b64toBlob data.
			 */
			function getExportBlobForCashFlow(elementId) {
				var table = document.getElementById(elementId);
				log.debug('excelexportutil.js: table', table.innerHTML);
				var excelTemplateHeader = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Cash Flow Statement</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>';
				var excelTemplateFooter = '</table></body></html>';
				var excelFileContent = excelTemplateHeader + table.innerHTML
						+ excelTemplateFooter;
				var base64data = base64(excelFileContent);
				return b64toBlob(base64data, 'application/vnd.ms-excel');
			}

			function base64(s) {
				return window.btoa(window.unescape(encodeURIComponent(s)));
			}
			/**
			 * @desc base 64 to blob.
			 * @param {object}
			 *            [b64Data] - base 64 data.
			 * @param {string}
			 *            [contentType] - content type.
			 * @param {number}
			 *            [sliceSize] - slice size.
			 * @return {object} - blob data.
			 */
			function b64toBlob(b64Data, contentType, sliceSize) {
				contentType = contentType || '';
				sliceSize = sliceSize || 512;

				var byteCharacters = window.atob(b64Data);
				var byteArrays = [];

				var offset;
				for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
					var slice = byteCharacters
							.slice(offset, offset + sliceSize);

					var byteNumbers = [];
					var i;
					for (i = 0; i < slice.length; i = i + 1) {
						byteNumbers[i] = slice.charCodeAt(i);
					}

					var byteArray = new window.Uint8Array(byteNumbers);

					byteArrays.push(byteArray);
				}

				var blob = new window.Blob(byteArrays, {
					type : contentType
				});
				return blob;
			}

			return {
				getExportUrl : getExportUrl,
				getExportCashFlowUrl : getExportCashFlowUrl,
				b64toBlob : b64toBlob,
				getExportBlob : getExportBlob,
				getExportBlobForCashFlow : getExportBlobForCashFlow
			};

		});

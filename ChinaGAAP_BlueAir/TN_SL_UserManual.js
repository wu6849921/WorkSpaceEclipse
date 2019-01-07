/**
 * Uploads UserManual PDF file.
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jun 2016     Veronica
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function showUserManual(request, response){		
		try{
			var file = nlapiLoadFile('Images/Finanical Localization User Guide.pdf');
			response.setContentType('PDF', 'UserManual.pdf', 'inline');
			response.write(file.getValue());			
		}catch(ex){
			nlapiLogExecution('DEBUG', 'showUserManual', ex);
	        response.write(ex);
		}
}

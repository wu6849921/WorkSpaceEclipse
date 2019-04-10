function process(email) {
	// log all information in email
	var fromAddress = email.getFrom();
	nlapiLogExecution('DEBUG', 'from', fromAddress);
	var to = email.getTo();
	for ( var indexTo in to) {
		nlapiLogExecution('DEBUG', 'to', to[indexTo]);
	}
	var cc = email.getCc();
	for ( var indexCc in cc) {
		nlapiLogExecution('DEBUG', 'to', cc[indexCc]);
	}

	nlapiLogExecution('DEBUG', 'replyTo', email.getReplyTo());

	nlapiLogExecution('DEBUG', 'sent', email.getSentDate());
	// log('subject', email.getSubject());
	// log('text body', email.getTextBody());
	// log('html body', email.getHtmlBody());
	nlapiLogExecution('DEBUG', 'subject', email.getSubject());

//	var attachments = email.getAttachments();
//	for ( var indexAtt in attachments) {
//		logAttachment('att', attachments[indexAtt]);
//	}
}
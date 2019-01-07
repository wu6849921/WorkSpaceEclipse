function afterSubmit(type) {
	var a = '{"qw":[{"ad":"ad","ac":"ac"},{"ad":"ar","ac":"at"}],"ew":"2"}';
	var b = JSON.parse(a);
	nlapiLogExecution('DEBUG', 'b.qw', b.qw[0].ad);
}

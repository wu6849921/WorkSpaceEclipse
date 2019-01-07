define(
		[ 'N/currentRecord', 'N/url' ],
		function(currentRecord, url) {
			var suiteletPage = currentRecord.get();
			function login() {
				try {
					var loginName = suiteletPage.getValue({
						fieldId : 'custpage_loginname'
					})
					var loginPsw = suiteletPage.getValue({
						fieldId : 'custpage_loginpsw'
					})
					if (loginName != 'demo' && loginPsw != 'demo123') {
						alert('User name or password error!');
						return;
					}
					window.onbeforeunload = function() {
						return;
					};
					// window.location = 'http://www.baidu.com';
					window.location = 'https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=70&deploy=1&compid=TSTDRV1488036&h=dbf61991f34090ac17f7';
				} catch (e) {
					alert(e);
				}

			}
			return {
				login : login
			};
		});

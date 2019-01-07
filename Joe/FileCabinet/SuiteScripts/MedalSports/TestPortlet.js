/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 */
define(
		[],
		function() {
			function render(params) {
				params.portlet.title = 'My Portlet';
				// var content = "<!DOCTYPE html>\r\n"
				// + "<html >\r\n"
				// + "<head>\r\n"
				// + "<meta charset=\"UTF-8\">\r\n"
				// + "<title>CSS3实现漂亮的柱形图表DEMO演示</title>\r\n"
				// + "\r\n"
				// + "<link rel=\"stylesheet\"
				// href=\"https://system.netsuite.com/core/media/media.nl?id=36&c=3856102_SB1&h=82fcf58b69b376e6859f&_xt=.css\">\r\n"
				// + "\r\n"
				// + "</head>\r\n"
				// + "<body>\r\n"
				// + "\r\n"
				// + "<div id=\"bar-chart\">\r\n"
				// + " <div class=\"graph\">\r\n"
				// + " <ul class=\"x-axis\">\r\n"
				// + " <li><span>2010</span></li>\r\n"
				// + " <li><span>2012</span></li>\r\n"
				// + " <li><span>2013</span></li>\r\n"
				// + " <li><span>2014</span></li>\r\n"
				// + " <li><span>2015</span></li>\r\n"
				// + " </ul>\r\n"
				// + " <ul class=\"y-axis\">\r\n"
				// + " <li><span>20</span></li>\r\n"
				// + " <li><span>15</span></li>\r\n"
				// + " <li><span>10</span></li>\r\n"
				// + " <li><span>5</span></li>\r\n"
				// + " <li><span>0</span></li>\r\n"
				// + " </ul>\r\n"
				// + " <div class=\"bars\">\r\n"
				// + " <div class=\"bar-group\">\r\n"
				// + " <div class=\"bar bar-1 stat-1\" style=\"height: 51%;\">
				// \r\n"
				// + " <span>4080</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-2 stat-2\" style=\"height:
				// 71%;\">\r\n"
				// + " <span>5680</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-3 stat-3\" style=\"height:
				// 13%;\">\r\n"
				// + " <span>1040</span>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " \r\n"
				// + " <div class=\"bar-group\">\r\n"
				// + " <div class=\"bar bar-4 stat-1\" style=\"height:
				// 76%;\">\r\n"
				// + " <span>6080</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-5 stat-2\" style=\"height:
				// 86%;\">\r\n"
				// + " <span>6880</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-6 stat-3\" style=\"height:
				// 22%;\">\r\n"
				// + " <span>1760</span>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " \r\n"
				// + " <div class=\"bar-group\">\r\n"
				// + " <div class=\"bar bar-7 stat-1\" style=\"height:
				// 78%;\">\r\n"
				// + " <span>6240</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-8 stat-2\" style=\"height:
				// 72%;\">\r\n"
				// + " <span>5760</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-9 stat-3\" style=\"height:
				// 36%;\">\r\n"
				// + " <span>2880</span>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " \r\n"
				// + " <div class=\"bar-group\">\r\n"
				// + " <div class=\"bar bar-10 stat-1\" style=\"height:
				// 44%;\">\r\n"
				// + " <span>3520</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-11 stat-2\" style=\"height:
				// 64%;\">\r\n"
				// + " <span>5120</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-12 stat-3\" style=\"height:
				// 59%\">\r\n"
				// + " <span>4720</span>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " \r\n"
				// + " <div class=\"bar-group\">\r\n"
				// + " <div class=\"bar bar-13 stat-1\" style=\"height:
				// 28%;\">\r\n"
				// + " <span>2240</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-14 stat-2\" style=\"height:
				// 33%;\">\r\n"
				// + " <span>2640</span>\r\n"
				// + " </div>\r\n"
				// + " <div class=\"bar bar-15 stat-3\" style=\"height:
				// 94%;\">\r\n"
				// + " <span>7520</span>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + " </div>\r\n"
				// + "</div> \r\n"
				// + "\r\n"
				// + "<div style=\"text-align:center;clear:both\">\r\n"
				// + "<script src=\"/gg_bd_ad_720x90.js\"
				// type=\"text/javascript\"></script>\r\n"
				// + "<script src=\"/follow.js\"
				// type=\"text/javascript\"></script>\r\n"
				// + "</div>\r\n" + "\r\n" + "</body>\r\n" + "</html>\r\n"
				// + "\r\n" + "";
				var url = 'https://system.netsuite.com/app/accounting/transactions/salesord.nl?id=17&e=T&whence=';
				var content = '<iframe src="'
						+ url
						+ '" align="center" style="width: 100%; height:600px; margin:0; border:0; padding:0"></iframe>';
				params.portlet.html = content;
			}
			return {
				render : render
			};
		});
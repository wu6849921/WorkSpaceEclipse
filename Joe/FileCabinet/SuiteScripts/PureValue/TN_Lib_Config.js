/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 01 Jul 2016 Zed
 * 
 */

triggernamespace('trigger.config');
var common = new trigger.common();

trigger.config = function() {

	
	/*
	 * 用户名 密码 及 MD5 key
	 */
	var _username = '';
	var _password = '';
	var _md5key = '';
	
	/*
	 * 客户信息中包含的字段id及类型
	 */
	var _customerFields=[
	            {'id':'internalid','type':'text'},
	            {'id':'entityid','type':'text'},
	            {'id':'isperson','type':'text'},
	            {'id':'firstname','type':'text'},
	            {'id':'companyname','type':'text'},
                {'id':'custentity_tn_customer_rate','type':'text'},
                {'id':'subsidiary','type':'text'},
                {'id':'salesrep','type':'text'},
                {'id':'comments','type':'text'},
                {'id':'email','type':'text'},
                {'id':'phone','type':'text'},
                {'id':'vatregnumber','type':'text'},
                {'id':'custentity_tn_sheng','type':'text'},
                {'id':'custentity_tn_shi','type':'text'},
                {'id':'custentity_tn_xian','type':'text'},
                {'id':'custentity_tn_zhen','type':'text'},
                {'id':'custentity_tn_chun','type':'text'},
                {'id':'custentity_tn_cus_addr_longitude','type':'text'},
                {'id':'custentity_tn_cus_addr_latitude','type':'text'},
//                {'id':'address','type':'text'},
	            {'id':'companyname','type':'text'},
//	            {'id':'altname','type':'text'},
	            {'id':'custentity_tn_warehouse','type':'text'},
	            {'id':'custentity_tn_ownername','type':'text'},
	            {'id':'custentity_tn_customeraddress','type':'text'}
	            ];
	
	
	/*
	 * 产品信息中包含的字段id及类型
	 */
	var _itemFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'itemid','type':'text'},
	                          {'id':'custitem_tn_itemname','type':'text'},
	                          {'id':'custitem_tn_item_specification','type':'text'},
	                          {'id':'custitem_tn_item_barcode','type':'text'},
	                          {'id':'custitem_tn_huopinbianhao','type':'text'},
	                          {'id':'custitem_tn_item_category3','type':'text'},
	                          {'id':'unitstype','type':'select'},
	                          {'id':'stockunit','type':'select'},
	                          {'id':'Purchaseunit','type':'select'},
	                          {'id':'Saleunit','type':'select'},
	                          {'id':'custitem_tn_chang','type':'text'},
	                          {'id':'custitem_tn_kuan','type':'text'},
	                          {'id':'custitem_tn_gao','type':'text'},
	                          {'id':'weight','type':'text'},
	                          {'id':'custitem_tn_item_perboxquantity','type':'text'},
	                          {'id':'custitem_tn_item_expirationperiod','type':'text'},
	                          {'id':'custitem_tn_item_purchasetype','type':'select'},
	                          {'id':'custitem_tn_item_brand','type':'text'},
	                          {'id':'custitem_tn_item_origin','type':'text'},
	                          {'id':'custitem_tn_item_memo','type':'text'},
	                          {'id':'custitem_tn_item_consignment','type':'text'},
	                          {'id':'subsidiary','type':'multiselect'},
	                          {'id':'department','type':'text'},
	                          {'id':'class','type':'text'},
	                          {'id':'location','type':'text'},
	                          //{'id':'isinactive','type':'text'},
	                          {'id':'custitem_tn_wharehourse','type':'multiselect'}
	                          ];
	
	
	/*
	 * 仓库信息中包含的字段id及类型
	 */
	
	var _warehouseFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'name','type':'text'},
	                          {'id':'custrecord_tn_pricelevel','type':'text'}
	                          ];
	
	
	
	
	/*
	 * 产品库存信息中包含的字段id及类型
	 */
	
	var _itemInventoryFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'itemid','type':'text'},
	                          {'id':'displayname','type':'text'},
	                          {'id':'quantityavailable','type':'text'},
	                          {'id':'saleunit','type':'text'},
	                          {'id':'stockunit','type':'text'}
	                          ];
	
	

	/*
	 * 促销规则信息中包含的字段id及类型
	 */
	
	var _promotionlistFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'name','type':'text'},
	                          {'id':'custrecord_tn_chuxiaoguizhe','type':'text'},
	                          {'id':'custrecord_tn_goumaishangpin','type':'text'},
	                          {'id':'custrecord_tn_zhensongshangpin','type':'text'},
	                          {'id':'custrecord_tn_xiangshouzhekoushangpin','type':'text'},
	                          {'id':'custrecord_tn_totalamount','type':'text'},
	                          {'id':'custrecord_tn_jian','type':'text'},
	                          {'id':'custrecord_tn_description','type':'text'},
	                          {'id':'custrecord_tn_leibie1','type':'text'},
	                          {'id':'custrecord_tn_leibie2','type':'text'},
	                          {'id':'custrecord_tn_leibie3','type':'text'},
	                          {'id':'custrecord_tn_leibie4','type':'text'},
	                          {'id':'custrecord_tn_quantity1','type':'text'},
	                          {'id':'custrecord_tn_quantity2','type':'text'},
	                          {'id':'custrecord_tn_quantity3','type':'text'},
	                          {'id':'custrecord_tn_quantity4','type':'text'},
	                          {'id':'custrecord3','type':'text'},
	                          {'id':'custrecord_tn_startdate','type':'text'},
	                          {'id':'custrecord_tn_jiezhiriqi','type':'text'},
	                          {'id':'custrecord8','type':'text'},
	                          {'id':'custrecord9','type':'text'},
	                          {'id':'custrecord10','type':'text'},
	                          {'id':'custrecord11','type':'text'},
	                          {'id':'custrecord12','type':'text'},
	                          {'id':'custrecord13','type':'text'},
	                          {'id':'custrecord14','type':'text'},
	                          {'id':'custrecord15','type':'text'},
	                          {'id':'custrecord16','type':'text'},
	                          {'id':'custrecord_tn_item2','type':'text'},
	                          {'id':'custrecord_tn_item3','type':'text'},
	                          {'id':'custrecord_tn_chuxiaoquyu','type':'text'}
	                          
	                          ];
		

	/*
	 * 省市县村信息中包含的字段id及类型
	 */
	
	var _locationlistFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'name','type':'text'},
	                          {'id':'custrecord_tn_fuxiang','type':'text'},
	                          {'id':'custrecord_tn_no','type':'text'},
	                          {'id':'custrecord5','type':'text'}
	                          ];
	
	

	/*
	 * 货品分类信息中包含的字段id及类型
	 */
	
	var _itemcategoryFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'name','type':'text'},
	                          {'id':'custrecord_tn_cust_id','type':'text'},
	                          {'id':'custrecord_tn_cust','type':'text'},
//	                          {'id':'custrecord_tn_cust_categoryname','type':'text'},
	                          {'id':'custrecord_tn_level','type':'text'},
	                          {'id':'parent','type':'text'}
	                          ];
	
	/*
	 * 员工信息中包含的字段id及类型
	 */
	
	var _employeeFields=[
	                          {'id':'internalid','type':'text'},
	                          {'id':'entityid','type':'text'},
	                          {'id':'firstname','type':'text'},
	                          {'id':'middlename','type':'text'},
	                          {'id':'lastname','type':'text'},
	                          {'id':'title','type':'text'},
	                          {'id':'supervisor','type':'text'},
	                          {'id':'hiredate','type':'text'},
	                          {'id':'birthdate','type':'text'},
	                          {'id':'employeestatus','type':'text'},
	                          {'id':'employeetype','type':'text'},
	                          {'id':'gender','type':'text'},
	                          {'id':'comments','type':'text'},
	                          {'id':'email','type':'text'},
	                          {'id':'phone','type':'text'},
	                          {'id':'altphone','type':'text'},
	                          {'id':'custentity_tn_em_homeaddress','type':'text'},
	                          {'id':'custentity_tn_em_permanentaddress','type':'text'},
	                          {'id':'custentity_tn_em_workaddress','type':'text'},
	                          {'id':'subsidiary','type':'text'},
	                          {'id':'class','type':'text'},
	                          {'id':'department','type':'text'},
	                          {'id':'location','type':'text'},
	                          {'id':'custentity_tn_sheng','type':'text'},
	                          {'id':'custentity_tn_shi','type':'text'},
	                          {'id':'custentity_tn_xian','type':'text'},
	                          {'id':'custentity_tn_employee_idnumber','type':'text'},
	                          {'id':'custentity_tn_employee_nation','type':'text'},
	                          {'id':'issalesrep','type':'text'},
	                          ];

	
	/*
	 * 联系人信息中包含的字段id及类型
	 */
	
	var _contactFields=[
	                       {'id':'internalid','type':'text'},
	                       {'id':'entityid','type':'text'},
	                       {'id':'company','type':'text'},
	                       {'id':'title','type':'text'},
	                       {'id':'email','type':'text'},
	                       {'id':'phone','type':'text'},
	                       {'id':'altphone','type':'text'},
	                          ];
	
	/*
	 * 以下为基础功能请勿修改
	 */
	
	var _toBeUpdateFields={};
	
//	this.getSetToBeUpdateFields = function(type,val){
//		return _toBeUpdateFields[type];
//	};
	
	this.getUsername = function(val) {
		return common.convertValToString(_username);
	};
	
	this.getPassword = function() {
		return common.convertValToString(_password);
	};
	
	this.getMd5Key = function() {
		return common.convertValToString(_md5key);
	};
	
	this.getCustomerFields = function() {
		return _customerFields;
	};
	
	this.getItemFields = function(){
		return _itemFields;
	};
	
	this.getItemInventoryFields = function(){
		return _itemInventoryFields;
	};
	
	this.getPromotionlistFields=function(){
		return _promotionlistFields;
	};
	
	this.getLocationlistFields=function(){
		return _locationlistFields;
	};
	
	this.getItemcategoryFields=function(){
		return _itemcategoryFields;
	};
	
	this.getEmployeeFields=function(){
		return _employeeFields;
	};
	
	this.getContactFields=function(){
		return _contactFields;
	};
	
	this.getWarehouseFields=function(){
		return _warehouseFields;
	};
};
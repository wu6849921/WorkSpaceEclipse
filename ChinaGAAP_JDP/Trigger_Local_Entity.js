/**
 * Module Description: Localization entity class Version Date Author Remarks
 * 1.00 23 Oct 2014 Winson.Chen
 */

triggernamespace("trigger.local.entity");

/**
 * *********************************************general ledger
 * start**************************
 */
trigger.local.entity.LedgerSumByYear = {
	credit : 0,
	debit : 0
};
/**
 * *********************************************general ledger
 * end**************************
 */
/**
 * *********************************************sub ledger
 * start******************************
 */
/**
 * it could be ignore
 * 
 * @param sql
 * @param map
 */
trigger.local.entity.AccountDetail = {
	sql : "",
	map : ""
};
/**
 * *********************************************sub ledger
 * end******************************
 */
/**
 * *********************************************profit and loss
 * start*************************
 */

trigger.local.entity.ProfitAndLoss = {
	// 涓昏惀涓氬姟鏀跺叆
	monthincome : 0,
	income : 0,
	// 鍏跺畠涓氬姟鏀跺叆
	monthotherincome : 0,
	otherincome : 0,
	// 鍏跺畠涓氬姟鏀嚭
	monthothercost : 0,
	othercost : 0,
	// 涓昏惀涓氬姟鎴愭湰
	monthmaincost : 0,
	maincost : 0,
	// 涓昏惀涓氬姟绋庨噾鍙婇檮鍔�
	monthmaintax : 0,
	maintax : 0,
	// 涓昏惀涓氬姟鍒╂鼎
	monthallincome : 0,
	allincome : 0,
	// 钀ヤ笟鎴愭湰
	monthoperatingcost : 0,
	operatingcost : 0,
	// 閿�鍞垂鐢�
	monthsellcost : 0,
	sellcost : 0,
	// 绠＄悊璐圭敤
	monthmanagercost : 0,
	managercost : 0,
	// 璐㈠姟璐圭敤
	monthfinancialrcost : 0,
	financialrcost : 0,
	// 璧勪骇鍑忓�兼崯澶�
	assetsimpairmentloss : 0,
	monthassetsimpairmentloss : 0,
	// 鍏厑浠峰�煎彉鍔ㄦ敹鐩�
	gainsonthechanges : 0,
	monthgainsonthechanges : 0,
	// 缁忚惀鍒╂鼎
	monthearnprofit : 0,
	earnprofit : 0,
	// 钀ヤ笟鍒╂鼎
	monthoperatingprofit : 0,
	operatingprofit : 0,
	// 鍏跺畠涓氬姟鍒╂鼎
	monthotherprofit : 0,
	otherprofit : 0,
	// 鎶曡祫鏀剁泭
	monthinvestmentincome : 0,
	investmentincome : 0,
	// 钀ヤ笟澶栨敹鍏�
	monthoutsideincome : 0,
	outsideincome : 0,
	// 钀ヤ笟澶栨敮鍑�
	monthoutsidecost : 0,
	outsidecost : 0,
	// 鍒╂鼎鎬婚
	monthtotalprofit : 0,
	totalprofit : 0,
	// 鎵�寰楃◣
	tax : 0,
	monthtax : 0,
	// 鍑�鍒╂鼎
	monthnetprofit : 0,
	netprofit : 0,
	// 浠ュ墠骞村害鎹熺泭璋冩暣
	monthprofitandlossadjust : 0,
	profitandlossadjust : 0,
	// add 琛ヨ创鏀跺叆5203 by joe
	monthsubsidyincome : 0,
	subsidyincome : 0
};

/**
 * *********************************************profit and loss
 * end*************************
 */
/**
 * *********************************************profit and loss2
 * start*************************
 */

trigger.local.entity.ProfitAndLoss2 = {
	CNnetprofit : 0,
	Adjnetprofit : 0,
	USnetprofit : 0,
};

/**
 * *********************************************profit and loss2
 * end*************************
 */
/**
 * *********************************************balance sheet
 * start*************************
 */

trigger.local.entity.BalanceSheet = {
	// 璐у竵璧勯噾
	Cash : 0,
	CashEnd : 0,
	// 浜ゆ槗鎬ч噾铻嶈祫浜�
	TradingFinancialAssets : 0,
	TradingFinancialAssetsEnd : 0,
	// 鐭湡鎶曡祫 add by joe
	CurrentInvestment : 0,
	CurrentInvestmentEnd : 0,
	// 搴旀敹绁ㄦ嵁
	NotesReceivable : 0,
	NotesReceivableEnd : 0,
	// 搴旀敹璐︽
	NetReceivable : 0,
	NetReceivableEnd : 0,
	// 棰勪粯娆鹃」
	AccountsPrepaid : 0,
	AccountsPrepaidEnd : 0,
	// 搴旀敹鍒╂伅
	InterestReceivable : 0,
	InterestReceivableEnd : 0,
	// 搴旀敹鑲″埄
	DividendReceivable : 0,
	DividendReceivableEnd : 0,
	// 鍏朵粬搴旀敹娆�
	OtherReceivables : 0,
	OtherReceivablesEnd : 0,
	// 搴旀敹琛ヨ创娆� 1161 add by joe
	SubsidyReceivable : 0,
	SubsidyReceivableEnd : 0,
	// 瀛樿揣
	Inventories : 0,
	InventoriesEnd : 0,
	// 寰呮憡璐圭敤 1301 add by joe
	UnamortizedExpense : 0,
	UnamortizedExpenseEnd : 0,
	// // 涓�骞村唴鍒版湡鐨勯潪娴佸姩璧勪骇
	// NonCurrentAssetsMaturedWithinAYear : 0,
	// NonCurrentAssetsMaturedWithinAYearEnd : 0,

	// 寰呭鐞嗘祦鍔ㄨ祫浜у噣鎹熷け 缃�0 by joe
	UnsettledGLOnCurrentAssets : 0,
	UnsettledGLOnCurrentAssetsEnd : 0,
	// 涓�骞村唴鍒版湡鐨勯暱鏈熷�烘潈鎶曡祫 缃�0 by joe
	LongTermDebtInvestmentDueWithinOneYear : 0,
	LongTermDebtInvestmentDueWithinOneYearEnd : 0,

	// 鍏朵粬娴佸姩璧勪骇
	OtherCurrentAssets : 0,
	OtherCurrentAssetsEnd : 0,
	// 娴佸姩璧勪骇鍚堣
	TotalCurrentAssets : 0,
	TotalCurrentAssetsEnd : 0,
	// 鍙緵鍑哄敭閲戣瀺璧勪骇
	AvailableForSaleFinancialAssets : 0,
	AvailableForSaleFinancialAssetsEnd : 0,
	// 鎸佹湁鑷冲埌鏈熸姇璧�
	HeldToMaturityInvestment : 0,
	HeldToMaturityInvestmentEnd : 0,
	// 闀挎湡搴旀敹娆�
	LongTermReceivables : 0,
	LongTermReceivablesEnd : 0,
	// 闀挎湡鑲℃潈鎶曡祫
	longTermEquityInvestment : 0,
	longTermEquityInvestmentEnd : 0,
	// 闀挎湡鍊哄埜鎶曡祫 by joe
	longTermBondInvestment : 0,
	longTermBondInvestmentEnd : 0,
	// 鍚堝苟浠峰樊 joe 缃�0
	incorporatingPriceDifference : 0,
	incorporatingPriceDifferenceEnd : 0,
	// 闀挎湡鎶曡祫鍚堣 joe
	totalLongTermInvestment : 0,
	totalLongTermInvestmentEnd : 0,
	// 鎶曡祫鎬ф埧鍦颁骇
	InvestmentRealEstate : 0,
	InvestmentRealEstateEnd : 0,
	// 鍥哄畾璧勪骇鍘熶环 edit by joe
	FixedAssetsOriginal : 0,
	FixedAssetsOriginalEnd : 0,
	// 绱鎶樻棫 joe
	accumulatedDepreciation : 0,
	accumulatedDepreciationEnd : 0,
	// 鍥哄畾璧勪骇鍑�鍊� joe
	fixedAssetsNetValue : 0,
	fixedAssetsNetValueEnd : 0,
	// 鍥哄畾璧勪骇鍑忓�煎噯澶� joe
	fixedAssetsDepreciationReserve : 0,
	fixedAssetsDepreciationReserveEnd : 0,
	// 鍥哄畾璧勪骇鍑�棰� joe
	fixedAssetsAmount : 0,
	fixedAssetsAmountEnd : 0,
	// 鍦ㄥ缓宸ョ▼
	ConstructionInProgress : 0,
	ConstructionInProgressEnd : 0,
	// 宸ョ▼鐗╄祫
	ProjectMaterial : 0,
	ProjectMaterialEnd : 0,
	// 鍥哄畾璧勪骇娓呯悊
	FixedAssetsDiaposal : 0,
	FixedAssetsDiaposalEnd : 0,
	// 寰呭鐞嗗浐瀹氳祫浜у噣鎹熷け joe
	unsettled : 0,
	unsettledEnd : 0,
	// 鍥哄畾璧勪骇鎬昏 joe
	totalFixedAssets : 0,
	totalFixedAssetsEnd : 0,
	// 鐢熶骇鎬х敓鐗╄祫浜�
	ProductiveBiologicalAsset : 0,
	ProductiveBiologicalAssetEnd : 0,
	// 娌规皵璧勪骇
	OilAndGasAssets : 0,
	OilAndGasAssetsEnd : 0,
	// 鏃犲舰璧勪骇
	IntangibleAssets : 0,
	IntangibleAssetsEnd : 0,
	// 寮�鍙戞敮鍑�
	DevelopmentExpediture : 0,
	DevelopmentExpeditureEnd : 0,
	// 鍟嗚獕
	BusinessReputation : 0,
	BusinessReputationEnd : 0,
	// 闀挎湡寰呮憡璐圭敤
	LongTermUnamortizedExpenses : 0,
	LongTermUnamortizedExpensesEnd : 0,
	// 鍏朵粬闀挎湡璧勪骇 joe
	otherLongTermAssets : 0,
	otherLongTermAssetsEnd : 0,
	// 鏃犲舰璧勪骇鍚堣 joe
	totalIntangibleAssets : 0,
	totalIntangibleAssetsEnd : 0,
	// 閫掑欢鎵�寰楃◣璧勪骇
	DeferredIncomeTaxAssets : 0,
	DeferredIncomeTaxAssetsEnd : 0,
	// 鍏跺畠闈炴祦鍔ㄨ祫浜�
	OtherNonCurrentAssets : 0,
	OtherNonCurrentAssetsEnd : 0,
	// 闈炴祦鍔ㄨ祫浜у悎璁�
	TotalNonCurrentAssets : 0,
	TotalNonCurrentAssetsEnd : 0,
	// 璧勪骇鎬昏
	TotalAssets : 0,
	TotalAssetsEnd : 0,
	// 鐭湡鍊熸
	ShortTermLoans : 0,
	ShortTermLoansEnd : 0,
	// 浜ゆ槗鎬ч噾铻嶈礋鍊�
	TradingFinancialLiabilities : 0,
	TradingFinancialLiabilitiesEnd : 0,
	// 搴斾粯绁ㄦ嵁
	NotesPayable : 0,
	NotesPayableEnd : 0,
	// 搴斾粯璐︽
	AccountsPayable : 0,
	AccountsPayableEnd : 0,
	// 棰勬敹娆鹃」
	AdvancesFromCustomers : 0,
	AdvancesFromCustomersEnd : 0,
	// 搴斾粯鑱屽伐钖叕
	AccruedPayroll : 0,
	AccruedPayrollEnd : 0,
	// 搴斾粯绂忓埄璐� joe
	welfarePayable : 0,
	welfarePayableEnd : 0,
	// 搴斾氦绋庤垂
	TaxesPayable : 0,
	TaxesPayableEnd : 0,
	// 鍏朵粬搴斾氦娆� joe
	otherAccountsPayable : 0,
	otherAccountsPayableEnd : 0,
	// 搴斾粯鍒╂伅
	InterestPayable : 0,
	InterestPayableEnd : 0,
	// 搴斾粯鑲″埄
	DividendsPayable : 0,
	DividendsPayableEnd : 0,
	// 鍏朵粬搴斾粯娆�
	OtherCreditors : 0,
	OtherCreditorsEnd : 0,
	// 棰勬彁璐圭敤 21091 joe
	accruedExpenses : 0,
	accruedExpensesEnd : 0,
	// 涓�骞村唴鍒版湡鐨勯暱鏈熻礋鍊� 缃�0
	currentMaturitiesOfLongTermDebt : 0,
	currentMaturitiesOfLongTermDebtEnd : 0,
	// 鍏朵粬娴佸姩璐熷��
	OtherCurrentLiabilities : 0,
	OtherCurrentLiabilitiesEnd : 0,
	// 娴佸姩璐熷�哄悎璁�
	TotalCurrentLiabilities : 0,
	TotalCurrentLiabilitiesEnd : 0,
	// 闀挎湡鍊熸
	LongTermLoansPayable : 0,
	LongTermLoansPayableEnd : 0,
	// 搴斾粯鍊哄埜
	BondsPayable : 0,
	BondsPayableEnd : 0,
	// 闀挎湡搴斾粯娆�
	longTermAccountsPayable : 0,
	ongTermAccountsPayableEnd : 0,
	// 涓撻」搴斾粯娆�
	SpecialAccountsPayable : 0,
	SpecialAccountsPayableEnd : 0,
	// 鍏朵粬闀挎湡璐熷�� joe 缃�0
	otherLongTermDebt : 0,
	otherLongTermDebtEnd : 0,
	// 闀挎湡璐熷�哄悎璁� joe
	totalLongTermLiabilities : 0,
	totalLongTermLiabilitiesEnd : 0,
	// 棰勮璐熷��
	AccruedLiabilities : 0,
	AccruedLiabilitiesEnd : 0,
	// 閫掑欢鎵�寰楃◣璐熷��
	DeferredIncomeTaxLiabilities : 0,
	DeferredIncomeTaxLiabilitiesEnd : 0,
	// 灏戞暟鑲′笢鏉冪泭 joe
	minorityEquity : 0,
	minorityEquityEnd : 0,
	// 鍏朵粬闈炴祦鍔ㄨ礋鍊�
	OtherNonCurrentLiabilities : 0,
	OtherNonCurrentLiabilitiesEnd : 0,
	// 闈炴祦鍔ㄨ礋鍊哄悎璁�
	TotalNonCurrentLiabilities : 0,
	TotalNonCurrentLiabilitiesEnd : 0,
	// 闀挎湡璐熷�哄悎璁�
	TotalLongTermLiabilities : 0,
	TotalLongTermLiabilitiesEnd : 0,
	// 璐熷�哄悎璁� joe
	totalLiabilities : 0,
	totalLiabilitiesEnd : 0,
	// 瀹炴敹璧勬湰锛堟垨鑲℃湰锛�
	SubscribedCapital : 0,
	SubscribedCapitalEnd : 0,
	// 璧勬湰鍏Н
	CapitalSurplus : 0,
	CapitalSurplusEnd : 0,
	// 鍑忥細搴撳瓨鑲�
	SubtractionTreasuryStock : 0,
	SubtractionTreasuryStockEnd : 0,
	// 鐩堜綑鍏Н
	SurplusReserve : 0,
	SurplusReserveEnd : 0,

	// 鏈‘璁ょ殑鎶曡祫鎹熷け锛堜互鈥�-鈥濆彿濉垪锛�
	unaffirmedInvestmentLoss : 0,
	unaffirmedInvestmentLossEnd : 0,
	// 鏈垎閰嶅埄娑�
	RetainedEarnings : 0,
	RetainedEarningsEnd : 0,

	// 澶栧竵鎶ヨ〃鎶樼畻宸
	translationReserve : 0,
	translationReserveEnd : 0,
	// 鎵�鏈夎�呮潈鐩婏紙鎴栬偂涓滄潈鐩婏級鍚堣
	TotalShareholdersEquity : 0,
	TotalShareholdersEquityEnd : 0,
	// 璐熷�哄拰鎵�鏈夎�呮潈鐩婏紙鎴栬偂涓滄潈鐩婏級鎬昏
	TotalLiabilitiesEquity : 0,
	TotalLiabilitiesEquityEnd : 0
};
/**
 * *********************************************balance sheet
 * end*************************
 */

/**
 * ************************************trial balance
 * start************************************
 */
trigger.local.entity.TrialBalance = {
	name : "",
	beginCredit : 0,
	beginDebit : 0,
	currentCredit : 0,
	currentDebit : 0,
	endCredit : 0,
	endDebit : 0
};
/**
 * ************************************trial balance
 * end****************************************
 */

/**
 * ************************************中美差异表 joe
 * start************************************
 */
trigger.local.entity.TrialBalance1 = {
	cnAccountName : "",
	cnDebit : 0,
	cnCredit : 0,
	adjDebit : 0,
	adjCredit : 0,
	usDebit : 0,
	usCredit : 0,
	nsAccountName : ""
};
/**
 * ************************************中美差异表
 * end****************************************
 */

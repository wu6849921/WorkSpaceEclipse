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
	// 主营业务收入
	monthincome : 0,
	income : 0,
	// 其它业务收入
	monthotherincome : 0,
	otherincome : 0,
	// 其它业务支出
	monthothercost : 0,
	othercost : 0,
	// 主营业务成本
	monthmaincost : 0,
	maincost : 0,
	// 主营业务税金及附加
	monthmaintax : 0,
	maintax : 0,
	// 主营业务利润
	monthallincome : 0,
	allincome : 0,
	// 营业成本
	monthoperatingcost : 0,
	operatingcost : 0,
	// 销售费用
	monthsellcost : 0,
	sellcost : 0,
	// 管理费用
	monthmanagercost : 0,
	managercost : 0,
	// 财务费用
	monthfinancialrcost : 0,
	financialrcost : 0,
	// 资产减值损失
	assetsimpairmentloss : 0,
	monthassetsimpairmentloss : 0,
	// 公允价值变动收益
	gainsonthechanges : 0,
	monthgainsonthechanges : 0,
	// 经营利润
	monthearnprofit : 0,
	earnprofit : 0,
	// 营业利润
	monthoperatingprofit : 0,
	operatingprofit : 0,
	// 其它业务利润
	monthotherprofit : 0,
	otherprofit : 0,
	// 投资收益
	monthinvestmentincome : 0,
	investmentincome : 0,
	// 营业外收入
	monthoutsideincome : 0,
	outsideincome : 0,
	// 营业外支出
	monthoutsidecost : 0,
	outsidecost : 0,
	// 利润总额
	monthtotalprofit : 0,
	totalprofit : 0,
	// 所得税
	tax : 0,
	monthtax : 0,
	// 净利润
	monthnetprofit : 0,
	netprofit : 0,
	// 以前年度损益调整
	monthprofitandlossadjust : 0,
	profitandlossadjust : 0,
	// add 补贴收入5203 by joe
	monthsubsidyincome : 0,
	subsidyincome : 0
};

/**
 * *********************************************profit and loss
 * end*************************
 */
/**
 * *********************************************balance sheet
 * start*************************
 */

trigger.local.entity.BalanceSheet = {
	// 货币资金
	Cash : 0,
	CashEnd : 0,
	// 交易性金融资产
	TradingFinancialAssets : 0,
	TradingFinancialAssetsEnd : 0,
	// 短期投资 add by joe
	CurrentInvestment : 0,
	CurrentInvestmentEnd : 0,
	// 应收票据
	NotesReceivable : 0,
	NotesReceivableEnd : 0,
	// 应收账款
	NetReceivable : 0,
	NetReceivableEnd : 0,
	// 预付款项
	AccountsPrepaid : 0,
	AccountsPrepaidEnd : 0,
	// 应收利息
	InterestReceivable : 0,
	InterestReceivableEnd : 0,
	// 应收股利
	DividendReceivable : 0,
	DividendReceivableEnd : 0,
	// 其他应收款
	OtherReceivables : 0,
	OtherReceivablesEnd : 0,
	// 应收补贴款 1161 add by joe
	SubsidyReceivable : 0,
	SubsidyReceivableEnd : 0,
	// 存货
	Inventories : 0,
	InventoriesEnd : 0,
	// 待摊费用 1301 add by joe
	UnamortizedExpense : 0,
	UnamortizedExpenseEnd : 0,
	// // 一年内到期的非流动资产
	// NonCurrentAssetsMaturedWithinAYear : 0,
	// NonCurrentAssetsMaturedWithinAYearEnd : 0,

	// 待处理流动资产净损失 置0 by joe
	UnsettledGLOnCurrentAssets : 0,
	UnsettledGLOnCurrentAssetsEnd : 0,
	// 一年内到期的长期债权投资 置0 by joe
	LongTermDebtInvestmentDueWithinOneYear : 0,
	LongTermDebtInvestmentDueWithinOneYearEnd : 0,

	// 其他流动资产
	OtherCurrentAssets : 0,
	OtherCurrentAssetsEnd : 0,
	// 流动资产合计
	TotalCurrentAssets : 0,
	TotalCurrentAssetsEnd : 0,
	// 可供出售金融资产
	AvailableForSaleFinancialAssets : 0,
	AvailableForSaleFinancialAssetsEnd : 0,
	// 持有至到期投资
	HeldToMaturityInvestment : 0,
	HeldToMaturityInvestmentEnd : 0,
	// 长期应收款
	LongTermReceivables : 0,
	LongTermReceivablesEnd : 0,
	// 长期股权投资
	longTermEquityInvestment : 0,
	longTermEquityInvestmentEnd : 0,
	// 长期债券投资 by joe
	longTermBondInvestment : 0,
	longTermBondInvestmentEnd : 0,
	// 合并价差 joe 置0
	incorporatingPriceDifference : 0,
	incorporatingPriceDifferenceEnd : 0,
	// 长期投资合计 joe
	totalLongTermInvestment : 0,
	totalLongTermInvestmentEnd : 0,
	// 投资性房地产
	InvestmentRealEstate : 0,
	InvestmentRealEstateEnd : 0,
	// 固定资产原价 edit by joe
	FixedAssetsOriginal : 0,
	FixedAssetsOriginalEnd : 0,
	// 累计折旧 joe
	accumulatedDepreciation : 0,
	accumulatedDepreciationEnd : 0,
	// 固定资产净值 joe
	fixedAssetsNetValue : 0,
	fixedAssetsNetValueEnd : 0,
	// 固定资产减值准备 joe
	fixedAssetsDepreciationReserve : 0,
	fixedAssetsDepreciationReserveEnd : 0,
	// 固定资产净额 joe
	fixedAssetsAmount : 0,
	fixedAssetsAmountEnd : 0,
	// 在建工程
	ConstructionInProgress : 0,
	ConstructionInProgressEnd : 0,
	// 工程物资
	ProjectMaterial : 0,
	ProjectMaterialEnd : 0,
	// 固定资产清理
	FixedAssetsDiaposal : 0,
	FixedAssetsDiaposalEnd : 0,
	// 待处理固定资产净损失 joe
	unsettled : 0,
	unsettledEnd : 0,
	// 固定资产总计 joe
	totalFixedAssets : 0,
	totalFixedAssetsEnd : 0,
	// 生产性生物资产
	ProductiveBiologicalAsset : 0,
	ProductiveBiologicalAssetEnd : 0,
	// 油气资产
	OilAndGasAssets : 0,
	OilAndGasAssetsEnd : 0,
	// 无形资产
	IntangibleAssets : 0,
	IntangibleAssetsEnd : 0,
	// 开发支出
	DevelopmentExpediture : 0,
	DevelopmentExpeditureEnd : 0,
	// 商誉
	BusinessReputation : 0,
	BusinessReputationEnd : 0,
	// 长期待摊费用
	LongTermUnamortizedExpenses : 0,
	LongTermUnamortizedExpensesEnd : 0,
	// 其他长期资产 joe
	otherLongTermAssets : 0,
	otherLongTermAssetsEnd : 0,
	// 无形资产合计 joe
	totalIntangibleAssets : 0,
	totalIntangibleAssetsEnd : 0,
	// 递延所得税资产
	DeferredIncomeTaxAssets : 0,
	DeferredIncomeTaxAssetsEnd : 0,
	// 其它非流动资产
	OtherNonCurrentAssets : 0,
	OtherNonCurrentAssetsEnd : 0,
	// 非流动资产合计
	TotalNonCurrentAssets : 0,
	TotalNonCurrentAssetsEnd : 0,
	// 资产总计
	TotalAssets : 0,
	TotalAssetsEnd : 0,
	// 短期借款
	ShortTermLoans : 0,
	ShortTermLoansEnd : 0,
	// 交易性金融负债
	TradingFinancialLiabilities : 0,
	TradingFinancialLiabilitiesEnd : 0,
	// 应付票据
	NotesPayable : 0,
	NotesPayableEnd : 0,
	// 应付账款
	AccountsPayable : 0,
	AccountsPayableEnd : 0,
	// 预收款项
	AdvancesFromCustomers : 0,
	AdvancesFromCustomersEnd : 0,
	// 应付职工薪酬
	AccruedPayroll : 0,
	AccruedPayrollEnd : 0,
	// 应付福利费 joe
	welfarePayable : 0,
	welfarePayableEnd : 0,
	// 应交税费
	TaxesPayable : 0,
	TaxesPayableEnd : 0,
	// 其他应交款 joe
	otherAccountsPayable : 0,
	otherAccountsPayableEnd : 0,
	// 应付利息
	InterestPayable : 0,
	InterestPayableEnd : 0,
	// 应付股利
	DividendsPayable : 0,
	DividendsPayableEnd : 0,
	// 其他应付款
	OtherCreditors : 0,
	OtherCreditorsEnd : 0,
	// 预提费用 21091 joe
	accruedExpenses : 0,
	accruedExpensesEnd : 0,
	// 一年内到期的长期负债 置0
	currentMaturitiesOfLongTermDebt : 0,
	currentMaturitiesOfLongTermDebtEnd : 0,
	// 其他流动负债
	OtherCurrentLiabilities : 0,
	OtherCurrentLiabilitiesEnd : 0,
	// 流动负债合计
	TotalCurrentLiabilities : 0,
	TotalCurrentLiabilitiesEnd : 0,
	// 长期借款
	LongTermLoansPayable : 0,
	LongTermLoansPayableEnd : 0,
	// 应付债券
	BondsPayable : 0,
	BondsPayableEnd : 0,
	// 长期应付款
	longTermAccountsPayable : 0,
	ongTermAccountsPayableEnd : 0,
	// 专项应付款
	SpecialAccountsPayable : 0,
	SpecialAccountsPayableEnd : 0,
	//其他长期负债 joe 置0
	otherLongTermDebt:0,
	otherLongTermDebtEnd:0,
	//长期负债合计 joe
	totalLongTermLiabilities:0,
	totalLongTermLiabilitiesEnd:0,
	// 预计负债
	AccruedLiabilities : 0,
	AccruedLiabilitiesEnd : 0,
	// 递延所得税负债
	DeferredIncomeTaxLiabilities : 0,
	DeferredIncomeTaxLiabilitiesEnd : 0,
	//少数股东权益 joe
	minorityEquity:0,
	minorityEquityEnd:0,
	// 其他非流动负债
	OtherNonCurrentLiabilities : 0,
	OtherNonCurrentLiabilitiesEnd : 0,
	// 非流动负债合计
	TotalNonCurrentLiabilities : 0,
	TotalNonCurrentLiabilitiesEnd : 0,
	// 长期负债合计
	TotalLongTermLiabilities : 0,
	TotalLongTermLiabilitiesEnd : 0,
	// 负债合计 joe
	totalLiabilities : 0,
	totalLiabilitiesEnd : 0,
	// 实收资本（或股本）
	SubscribedCapital : 0,
	SubscribedCapitalEnd : 0,
	// 资本公积
	CapitalSurplus : 0,
	CapitalSurplusEnd : 0,
	// 减：库存股
	SubtractionTreasuryStock : 0,
	SubtractionTreasuryStockEnd : 0,
	// 盈余公积
	SurplusReserve : 0,
	SurplusReserveEnd : 0,
	
	//未确认的投资损失（以“-”号填列）
	unaffirmedInvestmentLoss:0,
	unaffirmedInvestmentLossEnd:0,
	// 未分配利润
	RetainedEarnings : 0,
	RetainedEarningsEnd : 0,
	
	//外币报表折算差额
	translationReserve:0,
	translationReserveEnd:0,
	// 所有者权益（或股东权益）合计
	TotalShareholdersEquity : 0,
	TotalShareholdersEquityEnd : 0,
	// 负债和所有者权益（或股东权益）总计
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

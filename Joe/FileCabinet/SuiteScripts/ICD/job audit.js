function pageInit(type, name) {
//alert('1');
	if (type == 'edit' && nlapiGetUser() != '24580') {
		try {
			nlapiDisableField('custentity42', true);
			nlapiDisableField('custentity43', true);
			nlapiDisableField('custentity44', true);
			nlapiDisableField('custentity45', true);
			HandoverTarget();
			// clientFieldChanged();

		} catch (ex) {
			// alert(ex.getDetails());
			nlapiLogExecution('debug', 'debug', ex);
		}
	}
}

function HandoverTarget() {

	var UserRoleId = nlapiGetRole();
	if (UserRoleId !== '3' && UserRoleId !== '1007' && UserRoleId !== '1080'
			&& UserRoleId !== '1056' && UserRoleId !== '1106'
			&& UserRoleId !== '1133' && UserRoleId !== '1318'
			&& UserRoleId !== '1158') {
		nlapiDisableField('custentity_target_handoverdate', true);
	} else {
		return true;
	}

}

function clientSaveRecord() {
//	alert(1);
	if (nlapiGetFieldValue('customform') == '155') {
		nlapiSetFieldValue('custentity147', 'T', false);
		smallprojectweight();
		nlapiSetFieldValue('custentity_fas',
				nlapiGetFieldValue('custentity_fs_s_sum'), false)
	} else {
		weightCalculate();
		nlapiLogExecution('debug', '33', 33);
		nlapiSetFieldValue('custentity_fas',
				nlapiGetFieldValue('custentity_final_score'), false)
		// nlapiSetFieldValue('custentity147', 'F', false);

	}
	return true;

}

function weightCalculate() {

	var preSub = nlapiGetFieldValue('custentity_cppackage') * 0.08
			+ nlapiGetFieldValue('custentity_accuracy') * 0.08
			+ nlapiGetFieldValue('custentity_soapplication') * 0.04;
	var EcommunicationSub = nlapiGetFieldValue('custentity_email_announcements')
			* 0.04
			+ nlapiGetFieldValue('custentity_weekly_update')
			* 0.2
			+ nlapiGetFieldValue('custentity_meeting_attendence') * 0.05;
	var IcommunicationSub = nlapiGetFieldValue('custentity_iho_arrangement')
			* 0.08 + nlapiGetFieldValue('custentity_equipment_delivery') * 0.05
			+ nlapiGetFieldValue('custentity_payment_collection') * 0.08;
	var implementationSub = nlapiGetFieldValue('custentity_pro_implementation') * 0.2;
	var overall = nlapiGetFieldValue('custentity_general_image') * 0.1;

	if (isNaN(preSub)) {
		nlapiSetFieldValue('custentity_pp_subtotal', '0', false);
	} else {
		nlapiSetFieldValue('custentity_pp_subtotal', preSub.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_pp_subtotal', preSub, false);
	if (isNaN(EcommunicationSub)) {
		nlapiSetFieldValue('custentity_external_commu', '0', false);
	} else {
		nlapiSetFieldValue('custentity_external_commu', EcommunicationSub
				.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_external_commu', EcommunicationSub,
	// false);
	if (isNaN(IcommunicationSub)) {
		nlapiSetFieldValue('custentity_internal_subtotal', '0', false);
	} else {
		nlapiSetFieldValue('custentity_internal_subtotal', IcommunicationSub
				.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_internal_subtotal', IcommunicationSub,
	// false);
	if (isNaN(implementationSub)) {
		nlapiSetFieldValue('custentity_pip_subtotal', '0', false);
	} else {
		nlapiSetFieldValue('custentity_pip_subtotal', implementationSub
				.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_pip_subtotal', implementationSub, false);
	if (isNaN(overall)) {
		nlapiSetFieldValue('custentity_overall_subtotal', '0', false);
	} else {
		nlapiSetFieldValue('custentity_overall_subtotal', overall.toFixed(2),
				false);
	}
	// nlapiSetFieldValue('custentity_overall_subtotal', overall, false);

	var projectManSum = (implementationSub + overall + IcommunicationSub
			+ preSub + EcommunicationSub) * 0.2;

	nlapiSetFieldValue('custentity_pro_management', projectManSum.toFixed(2),
			false);

	var Unavailable = new Array()

	Unavailable[0] = 'custentity_material_conduit';
	Unavailable[1] = 'custentity_position_conduit';
	Unavailable[2] = 'custentity_installation_fix';
	Unavailable[3] = 'custentity_material_cabling';
	Unavailable[4] = 'custentity_connection_installation';
	Unavailable[5] = 'custentity_labeling';
	Unavailable[6] = 'custentity_right_termination';
	Unavailable[7] = 'custentity_connection';
	Unavailable[8] = 'custentity_position_equipments';
	Unavailable[9] = 'custentity_strong_tight';
	Unavailable[10] = 'custentity_wiring_labeling';
	Unavailable[11] = 'custentity_internal_design';
	Unavailable[12] = 'custentity_installation_rack';
	Unavailable[13] = 'custentity_grounding_dvr';
	Unavailable[14] = 'custentity_equipments_cleaning';
	Unavailable[15] = 'custentity_surrounding';
	Unavailable[16] = 'custentity_site_diagrams';
	Unavailable[17] = 'custentity_studying_learning';
	Unavailable[18] = 'custentity_testing_products';
	Unavailable[19] = 'custentity_protectiong_onsite';
	Unavailable[20] = 'custentity_getting_datas';
	Unavailable[21] = 'custentity_programming_standards';
	Unavailable[22] = 'custentity_recording';
	Unavailable[23] = 'custentity_survey_checking';
	Unavailable[24] = 'custentity_coordination';
	Unavailable[25] = 'custentity_result';
	Unavailable[26] = 'custentity_accuracy_engineering';
	Unavailable[27] = 'custentity_ontime';
	Unavailable[28] = 'custentity_completion';
	Unavailable[29] = 'custentity_cost_control';
	Unavailable[30] = 'custentity_transportation';
	Unavailable[31] = 'custentity_cost_subcon';
	Unavailable[32] = 'custentity_misc_c';

	var checkbox = new Array();

	checkbox[0] = 'custentity_un_material';
	checkbox[1] = 'custentity_un_position';
	checkbox[2] = 'custentity_un_installation';
	checkbox[3] = 'custentity_un_cw_material';
	checkbox[4] = 'custentity_un_connection_installation';
	checkbox[5] = 'custentity_un_labeling';
	checkbox[6] = 'custentity_un_right_termination';
	checkbox[7] = 'custentity_un_termination_connection';
	checkbox[8] = 'custentity_un_strong';
	checkbox[9] = 'custentity_un_wiring_labelling';
	checkbox[10] = 'custentity_un_equip_position';
	checkbox[11] = 'custentity_un_interdesign';
	checkbox[12] = 'custentity_un_rt_installation';
	checkbox[13] = 'custentity_un_grounding';
	checkbox[14] = 'custentity_un_cleaning_equipments';
	checkbox[15] = 'custentity_un_cleaning_surrounding';
	checkbox[16] = 'custentity_un_site_diagrams';
	checkbox[17] = 'custentity_un_studying_learning';
	checkbox[18] = 'custentity_un_testing';
	checkbox[19] = 'custentity_un_protection_site';
	checkbox[20] = 'custentity_un_getting_setting_datas';
	checkbox[21] = 'custentity_un_programming_standards';
	checkbox[22] = 'custentity_un_record_backup';
	checkbox[23] = 'custentity_un_sitesurvey_checking';
	checkbox[24] = 'custentity_un_coordination';
	checkbox[25] = 'custentity_un_tc_result';
	checkbox[26] = 'custentity_un_accuracy';
	checkbox[27] = 'custentity_un_on_time';
	checkbox[28] = 'custentity_un_ep_completion';
	checkbox[29] = 'custentity_un_cost_control';
	checkbox[30] = 'custentity_un_transportation';
	checkbox[31] = 'custentity_un_subcontractor_cost';
	checkbox[32] = 'custentity_un_subcontractor_cost';

	var weight = new Array();

	weight[0] = 0.04;
	weight[1] = 0.08;
	weight[2] = 0.06;
	weight[3] = 0.04;
	weight[4] = 0.06;
	weight[5] = 0.06;
	weight[6] = 0.05;
	weight[7] = 0.05;
	weight[8] = 0.08;
	weight[9] = 0.06;
	weight[10] = 0.06;
	weight[11] = 0.05;
	weight[12] = 0.08;
	weight[13] = 0.05;
	weight[14] = 0.05;
	weight[15] = 0.05;
	weight[16] = 0.08;
	weight[17] = 0.10;
	weight[18] = 0.10;
	weight[19] = 0.08;
	weight[20] = 0.08;
	weight[21] = 0.10;
	weight[22] = 0.05;
	weight[23] = 0.08;
	weight[24] = 0.08;
	weight[25] = 0.10;
	weight[26] = 0.10;
	weight[27] = 0.05;
	weight[28] = 0.08;
	weight[29] = 0.30;
	weight[30] = 0.25;
	weight[31] = 0.35;
	weight[32] = 0.10;

	var weightvalue1 = 0;
	var weightvalue2 = 0;
	var weightvalue3 = 0;

	// for installation calculate

	for (var i = 0; i < 17; i++) {

		var CheckIf = nlapiGetFieldValue(checkbox[i]);
		if (CheckIf == 'T') {
			nlapiSetFieldValue(Unavailable[i], 0, false);
			nlapiDisableField(Unavailable[i], true);

			weightvalue1 = weightvalue1 + weight[i];

		} else {

			nlapiDisableField(Unavailable[i], false);
		}

	}
	var conduitSub = nlapiGetFieldValue('custentity_material_conduit') * 0.04
			+ nlapiGetFieldValue('custentity_position_conduit') * 0.08
			+ nlapiGetFieldValue('custentity_installation_fix') * 0.06;

	var cablingSub = nlapiGetFieldValue('custentity_material_cabling') * 0.04
			+ nlapiGetFieldValue('custentity_connection_installation') * 0.06
			+ nlapiGetFieldValue('custentity_labeling') * 0.06;

	var terminationSub = nlapiGetFieldValue('custentity_right_termination')
			* 0.05 + nlapiGetFieldValue('custentity_connection') * 0.05;

	var equipmentsSub = nlapiGetFieldValue('custentity_position_equipments')
			* 0.08 + nlapiGetFieldValue('custentity_strong_tight') * 0.06
			+ nlapiGetFieldValue('custentity_wiring_labeling') * 0.06;

	var racktavleSub = nlapiGetFieldValue('custentity_internal_design') * 0.05
			+ nlapiGetFieldValue('custentity_installation_rack') * 0.08
			+ nlapiGetFieldValue('custentity_grounding_dvr') * 0.05;

	var cleaningSub = nlapiGetFieldValue('custentity_equipments_cleaning')
			* 0.05 + nlapiGetFieldValue('custentity_surrounding') * 0.05
			+ nlapiGetFieldValue('custentity_site_diagrams') * 0.08;

	if (isNaN(conduitSub)) {
		nlapiSetFieldValue('custentity_cw_subtotal', '0', false);
		conduitSub = 0;
	} else {
		nlapiSetFieldValue('custentity_cw_subtotal', conduitSub.toFixed(2),
				false);
	}
	// nlapiSetFieldValue('custentity_cw_subtotal', conduitSub, false);

	if (isNaN(cablingSub)) {
		nlapiSetFieldValue('custentity_cablingwork_sub', '0', false);
		cablingSub = 0;
	} else {
		nlapiSetFieldValue('custentity_cablingwork_sub', cablingSub.toFixed(2),
				false);
	}
	// nlapiSetFieldValue('custentity_cablingwork_sub', cablingSub, false);

	if (isNaN(terminationSub)) {
		nlapiSetFieldValue('custentity_termination_sub', '0', false);
		terminationSub = 0;
	} else {
		nlapiSetFieldValue('custentity_termination_sub', terminationSub
				.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_termination_sub', terminationSub, false);

	if (isNaN(equipmentsSub)) {
		nlapiSetFieldValue('custentity_equipments_sub', '0', false);
		equipmentsSub = 0;
	} else {
		nlapiSetFieldValue('custentity_equipments_sub', equipmentsSub
				.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_equipments_sub', equipmentsSub, false);

	if (isNaN(racktavleSub)) {
		nlapiSetFieldValue('custentity_rat_sub', '0', false);
		racktavleSub = 0;
	} else {
		nlapiSetFieldValue('custentity_rat_sub', racktavleSub.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_rat_sub', racktavleSub, false);

	if (isNaN(cleaningSub)) {
		nlapiSetFieldValue('custentity_cleaning_sub', '0', false);
		cleaningSub = 0;
	} else {
		nlapiSetFieldValue('custentity_cleaning_sub', cleaningSub.toFixed(2),
				false);
	}
	// nlapiSetFieldValue('custentity_cleaning_sub', cleaningSub, false);

	var installationscore = (conduitSub + cablingSub + terminationSub
			+ equipmentsSub + racktavleSub + cleaningSub) / 5;

	var denominator1 = (1 - weightvalue1);

	var Finsscore = installationscore * (1 / denominator1);

	nlapiSetFieldValue('custentity_installation_sum', Finsscore.toFixed(2),
			false);

	// for engineering calculate.

	for (var i = 17; i < 29; i++) {

		var CheckIf = nlapiGetFieldValue(checkbox[i]);
		if (CheckIf == 'T') {
			nlapiSetFieldValue(Unavailable[i], 0, false);
			nlapiDisableField(Unavailable[i], true);

			weightvalue2 = weightvalue2 + weight[i];

		} else {

			nlapiDisableField(Unavailable[i], false);
		}

	}

	var productSub = nlapiGetFieldValue('custentity_studying_learning') * 0.1
			+ nlapiGetFieldValue('custentity_testing_products') * 0.1
			+ nlapiGetFieldValue('custentity_protectiong_onsite') * 0.08;

	var softwareSub = nlapiGetFieldValue('custentity_getting_datas') * 0.08
			+ nlapiGetFieldValue('custentity_programming_standards') * 0.1
			+ nlapiGetFieldValue('custentity_recording') * 0.05;

	var testingSub = nlapiGetFieldValue('custentity_survey_checking') * 0.08
			+ nlapiGetFieldValue('custentity_coordination') * 0.08
			+ nlapiGetFieldValue('custentity_result') * 0.1;

	var handoverSub = nlapiGetFieldValue('custentity_general_image') * 0.1
			+ nlapiGetFieldValue('custentity_ontime') * 0.05
			+ nlapiGetFieldValue('custentity_completion') * 0.08;

	if (isNaN(productSub)) {
		nlapiSetFieldValue('custentity_products_sub', '0', false);
		productSub = 0;
	} else {
		nlapiSetFieldValue('custentity_products_sub', productSub.toFixed(2),
				false);
	}
	// nlapiSetFieldValue('custentity_products_sub', productSub, false);

	if (isNaN(softwareSub)) {
		nlapiSetFieldValue('custentity_sp_sub', '0', false);
		softwareSub = 0;
	} else {
		nlapiSetFieldValue('custentity_sp_sub', softwareSub.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_sp_sub', softwareSub, false);

	if (isNaN(testingSub)) {
		nlapiSetFieldValue('custentity_tc_sub', '0', false);
		testingSub = 0;
	} else {
		nlapiSetFieldValue('custentity_tc_sub', testingSub.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_tc_sub', testingSub, false);

	if (isNaN(handoverSub)) {
		nlapiSetFieldValue('custentity_hp_sub', '0', false);
		handoverSub = 0;
	} else {
		nlapiSetFieldValue('custentity_hp_sub', handoverSub.toFixed(2), false);
	}
	// nlapiSetFieldValue('custentity_hp_sub', handoverSub, false);

	var engineeringscore = (productSub + softwareSub + testingSub + handoverSub) * 0.25;

	var denominator2 = (1 - weightvalue2);
	var Fengineeringscore = engineeringscore * (1 / denominator2);

	nlapiSetFieldValue('custentity_engineer_sum', Fengineeringscore.toFixed(2),
			false);

	// for budget calculate

	for (var i = 29; i < 33; i++) {

		var CheckIf = nlapiGetFieldValue(checkbox[i]);
		if (CheckIf == 'T') {
			nlapiSetFieldValue(Unavailable[i], 0, false);
			nlapiDisableField(Unavailable[i], true);

			weightvalue3 = weightvalue3 + weight[i];

		} else {

			nlapiDisableField(Unavailable[i], false);
		}

	}
	var budgetscore = nlapiGetFieldValue('custentity_cost_control') / 4
			+ nlapiGetFieldValue('custentity_transportation') / 4
			+ nlapiGetFieldValue('custentity_cost_subcon') / 4
			+ nlapiGetFieldValue('custentity_misc_c') / 4;

	if (isNaN(budgetscore)) {
		// nlapiSetFieldValue('custentity_expense_sum', '0', false);
		budgetscore = 0;
	}

	var denominator3 = (1 - weightvalue3);
	var Fbudgetscore = budgetscore * (1 / denominator3) * 0.25;

	nlapiSetFieldValue('custentity_expense_sum', Fbudgetscore.toFixed(2), false);

	// for EHS
	var ehsSum = (nlapiGetFieldValue('custentity_personal_protec') * 0.5 + nlapiGetFieldValue('custentity_electrical_safety') * 0.5) * 0.1;

	if (isNaN(ehsSum)) {
		// ehsSum=0;
		nlapiSetFieldValue('custentity_ehs_sum', '0', false);
	} else {
		nlapiSetFieldValue('custentity_ehs_sum', ehsSum.toFixed(2), false);
	}

	// for Final score
	var a = parseFloat(nlapiGetFieldValue('custentity_pro_management'));
	var b = parseFloat(nlapiGetFieldValue('custentity_installation_sum'));
	var c = parseFloat(nlapiGetFieldValue('custentity_engineer_sum'));
	var d = parseFloat(nlapiGetFieldValue('custentity_expense_sum'));
	var e = parseFloat(nlapiGetFieldValue('custentity_ehs_sum'));
	var g = parseFloat(nlapiGetFieldText('custentity_job_add_on'));
	// alert(g);
	var finalScore = a + b + c + d + e + g;
	// alert(finalScore);
	nlapiSetFieldValue('custentity_final_score', finalScore.toFixed(2), false);
	nlapiLogExecution('debug', '22', 22);
}

function smallprojectweight() {

	var SUnavailable = new Array()

	SUnavailable[0] = 'custentityconduit_work_s';
	SUnavailable[1] = 'custentitycabling_work_s';
	SUnavailable[2] = 'custentitytermination_s';
	SUnavailable[3] = 'custentityequipments_s';
	SUnavailable[4] = 'custentityrack_tables_s';
	SUnavailable[5] = 'custentitycleaning_s';
	SUnavailable[6] = 'custentityproducts_s';
	SUnavailable[7] = 'custentitysoftware_programming_s';
	SUnavailable[8] = 'custentitytesting_commissioning_s';
	SUnavailable[9] = 'custentityengineering_package_s';
	SUnavailable[10] = 'custentitycost_control_s';
	SUnavailable[11] = 'custentitytransportation_s';
	SUnavailable[12] = 'custentitysubcontractor_cost_s';
	SUnavailable[13] = 'custentity_s_misc_c';

	var Scheckbox = new Array();

	Scheckbox[0] = 'custentity_un_s_conduit_work';
	Scheckbox[1] = 'custentity_un_s_cabling_work';
	Scheckbox[2] = 'custentity_un_s_termination';
	Scheckbox[3] = 'custentity_un_s_equipments';
	Scheckbox[4] = 'custentity_un_s_rack_tables';
	Scheckbox[5] = 'custentity_un_s_cleaning';
	Scheckbox[6] = 'custentity_un_s_products';
	Scheckbox[7] = 'custentity_un_s_software_programming';
	Scheckbox[8] = 'custentity_un_s_testing_commissioning';
	Scheckbox[9] = 'custentity_un_s_engineering_package';
	Scheckbox[10] = 'custentity_un_s_cost_control';
	Scheckbox[11] = 'custentity_un_s_transportation';
	Scheckbox[12] = 'custentity_un_s_subcontractor_cost';
	Scheckbox[13] = 'custentity_un_s_misccost';

	for (var k = 0; k < Scheckbox.length; k++) {

		var CheckIf = nlapiGetFieldValue(Scheckbox[k]);
		if (CheckIf == 'T') {
			nlapiSetFieldValue(SUnavailable[k], 10, false);
			nlapiDisableField(SUnavailable[k], true);

		} else {

			nlapiDisableField(SUnavailable[k], false);
		}
	}
	// for PROJECT MANAGEMENT SUM(S)
//	alert(2);
	var projectmanSSum = (parseFloat(nlapiGetFieldValue('custentityproject_preparation_s'))
			+ parseFloat(nlapiGetFieldValue('custentityexternal_communication_s'))
			+ parseFloat(nlapiGetFieldValue('custentityinternal_communication_s'))
			+ parseFloat(nlapiGetFieldValue('custentitypip_s')) + parseFloat(nlapiGetFieldValue('custentityover_all_s'))) * 0.2 * 0.2;
	if (isNaN(projectmanSSum)) {
		nlapiSetFieldValue('custentity_pm_s_sum', '0', false);
	} else {
		nlapiSetFieldValue('custentity_pm_s_sum', projectmanSSum.toFixed(2),
				false);
	}
	// for INSTALLATION SUM(S)
	var installationSSum = (parseFloat(nlapiGetFieldValue('custentityconduit_work_s'))
			+ parseFloat(nlapiGetFieldValue('custentitycabling_work_s'))
			+ parseFloat(nlapiGetFieldValue('custentitytermination_s'))
			+ parseFloat(nlapiGetFieldValue('custentityequipments_s'))
			+ parseFloat(nlapiGetFieldValue('custentityrack_tables_s')) + parseFloat(nlapiGetFieldValue('custentitycleaning_s'))) * 0.167 * 0.25;
	if (isNaN(installationSSum)) {
		nlapiSetFieldValue('custentity_installation_s_sum', '0', false);
	} else {
		nlapiSetFieldValue('custentity_installation_s_sum', installationSSum
				.toFixed(2), false);
	}
	// for ENGINEERING SUM(S)
	var engineeringSSum = (parseFloat(nlapiGetFieldValue('custentityproducts_s'))
			+ parseFloat(nlapiGetFieldValue('custentitysoftware_programming_s'))
			+ parseFloat(nlapiGetFieldValue('custentitytesting_commissioning_s')) + parseFloat(nlapiGetFieldValue('custentityengineering_package_s'))) * 0.25 * 0.2;
	if (isNaN(engineeringSSum)) {
		nlapiSetFieldValue('custentity_engineering_s_sum', '0', false);
	} else {
		nlapiSetFieldValue('custentity_engineering_s_sum', engineeringSSum
				.toFixed(2), false);
	}
	// for BUDGET CONTROL SUM(S)
	var expenseSSum = (parseFloat(nlapiGetFieldValue('custentitycost_control_s'))
			+ parseFloat(nlapiGetFieldValue('custentity_s_misc_c'))
			+ parseFloat(nlapiGetFieldValue('custentitytransportation_s')) + parseFloat(nlapiGetFieldValue('custentitysubcontractor_cost_s'))) * 0.25 * 0.25;
	if (isNaN(expenseSSum)) {
		nlapiSetFieldValue('custentity_expense_s_sum', ' 0', false);
	} else {
		nlapiSetFieldValue('custentity_expense_s_sum', expenseSSum.toFixed(2),
				false);
	}
	// for EHS SUM(S)
	var EHSSSum = (parseFloat(nlapiGetFieldValue('custentityppe_s')) + parseFloat(nlapiGetFieldValue('custentityelectrical_safety_s'))) * 0.5 * 0.1;
	if (isNaN(EHSSSum)) {
		nlapiSetFieldValue('custentity_ehs_s_sum', '0', false);
	} else {
		nlapiSetFieldValue('custentity_ehs_s_sum', EHSSSum.toFixed(2), false);
	}
	// for final score small project
	var finalSSum = parseFloat(nlapiGetFieldValue('custentity_pm_s_sum'))
			+ parseFloat(nlapiGetFieldValue('custentity_installation_s_sum'))
			+ parseFloat(nlapiGetFieldValue('custentity_engineering_s_sum'))
			+ parseFloat(nlapiGetFieldValue('custentity_expense_s_sum'))
			+ parseFloat(nlapiGetFieldValue('custentity_ehs_s_sum'))
			+ parseFloat(nlapiGetFieldText('custentity_job_add_on'));
	nlapiSetFieldValue('custentity_fs_s_sum', finalSSum.toFixed(2), false);
}
/*
 * function clientFieldChanged() {
 * 
 * try {
 * 
 * if (nlapiGetFieldValue('customform') == '155') { //
 * alert(nlapiGetFieldValue('customform'));
 * 
 * smallprojectweight(); SPstagecontrol(); } else { /* if(name
 * =='custentity_cppackage'||name == 'custentity_accuracy'||name ==
 * 'custentity_soapplication'){
 * nlapiSetFieldValue('custentity_pp_subtotal',nlapiGetFieldValue('custentity_cppackage')*0.08+nlapiGetFieldValue('custentity_accuracy')*0.08+nlapiGetFieldValue('custentity_soapplication')*0.04,false); }
 */
/*
 * weightCalculate(); stagecontrol(); } // return true; } catch (ex) {
 * nlapiLogExecution('debug', 'debug', ex); } }
 */
// 5 project stages controlling.
function stagecontrol() {
	var currentUser = nlapiGetUser();
	if (currentUser != '24580') {
		// control DESIGN & PREPARATION stage.
		if (!nlapiGetFieldValue('custentity_email_announcements')
				|| nlapiGetFieldValue('custentity_email_announcements') == 0) {
			nlapiDisableField('custentity41', false);
		} else {
			nlapiDisableField('custentity41', true);
		}

		// control Cabling stage.

		if (nlapiGetFieldValue('custentity_cppackage') != ''
				&& nlapiGetFieldValue('custentity_accuracy') != ''
				&& nlapiGetFieldValue('custentity_material_conduit') != ''
				&& nlapiGetFieldValue('custentity_position_conduit') != ''
				&& nlapiGetFieldValue('custentity_installation_fix') != ''
				&& nlapiGetFieldValue('custentity41') == '2') {

			nlapiDisableField('custentity42', false);
		} else {
			nlapiDisableField('custentity42', true);
		}
		// installation
		if (nlapiGetFieldValue('custentity_material_cabling') != ''
				&& nlapiGetFieldValue('custentity_studying_learning') != ''
				&& nlapiGetFieldValue('custentity_testing_products') != ''
				&& nlapiGetFieldValue('custentity42') == '2') {

			nlapiDisableField('custentity43', false);
		} else {
			nlapiDisableField('custentity43', true);
		}

		// control T&C stage.

		if (nlapiGetFieldValue('custentity_soapplication') != ''
				&& nlapiGetFieldValue('custentity_meeting_attendence') != ''
				&& nlapiGetFieldValue('custentity_equipment_delivery') != ''
				&& nlapiGetFieldValue('custentity_connection_installation') != ''
				&& nlapiGetFieldValue('custentity_labeling') != ''
				&& nlapiGetFieldValue('custentity_right_termination') != ''
				&& nlapiGetFieldValue('custentity_connection') !== ''
				&& nlapiGetFieldValue('custentity_position_equipments') != ''
				&& nlapiGetFieldValue('custentity_wiring_labeling') != ''
				&& nlapiGetFieldValue('custentity_strong_tight') != ''
				&& nlapiGetFieldValue('custentity_internal_design') != ''
				&& nlapiGetFieldValue('custentity_installation_rack') != ''
				&& nlapiGetFieldValue('custentity_grounding_dvr') !== ''
				&& nlapiGetFieldValue('custentity_equipments_cleaning') != ''
				&& nlapiGetFieldValue('custentity_surrounding') != ''
				&& nlapiGetFieldValue('custentity_site_diagrams') != ''
				&& nlapiGetFieldValue('custentity_protectiong_onsite') != ''
				&& nlapiGetFieldValue('custentity_getting_datas') !== ''
				&& nlapiGetFieldValue('custentity_programming_standards') !== ''
				&& nlapiGetFieldValue('custentity_survey_checking') != ''
				&& nlapiGetFieldValue('custentity_accuracy_engineering') != ''
				&& nlapiGetFieldValue('custentity_ontime') != ''
				&& nlapiGetFieldValue('custentity_recording') != ''
				&& nlapiGetFieldValue('custentity43') == '2') {

			nlapiDisableField('custentity44', false);
		} else {
			nlapiDisableField('custentity44', true);
		}

		// control HANDOVER stage.

		if (nlapiGetFieldValue('custentity_weekly_update') != ''
				&& nlapiGetFieldValue('custentity_iho_arrangement') != ''
				&& nlapiGetFieldValue('custentity_payment_collection') != ''
				&& nlapiGetFieldValue('custentity_pro_implementation') != ''
				&& nlapiGetFieldValue('custentity_general_image') != ''
				&& nlapiGetFieldValue('custentity_coordination') != ''
				&& nlapiGetFieldValue('custentity_result') != ''
				&& nlapiGetFieldValue('custentity_completion') != ''
				&& nlapiGetFieldValue('custentity_cost_control') != ''
				&& nlapiGetFieldValue('custentity_transportation') != ''
				&& nlapiGetFieldValue('custentity_cost_subcon') != ''
				&& nlapiGetFieldValue('custentity_misc_c') != ''
				&& nlapiGetFieldValue('custentity44') == '2') {

			nlapiDisableField('custentity45', false);
		} else {
			nlapiDisableField('custentity45', true);
		}
	} else
		return true;
}

function SPstagecontrol() {
	if (nlapiGetUser() != '24580') {
		// CABLING
		if (nlapiGetFieldValue('custentityproject_preparation_s') != ''
				&& nlapiGetFieldValue('custentityconduit_work_s') != ''
				&& nlapiGetFieldValue('custentity41') == '2') {

			nlapiDisableField('custentity42', false);
		} else {
			nlapiDisableField('custentity42', true);
		}
		// INS
		if (nlapiGetFieldValue('custentitycabling_work_s') != ''
				&& nlapiGetFieldValue('custentity42') == '2') {

			nlapiDisableField('custentity43', false);
		} else {
			nlapiDisableField('custentity43', true);
		}
		// TC
		if (nlapiGetFieldValue('custentitytermination_s') != ''
				&& nlapiGetFieldValue('custentityequipments_s') != ''
				&& nlapiGetFieldValue('custentityrack_tables_s') != ''
				&& nlapiGetFieldValue('custentitycleaning_s') != ''
				&& nlapiGetFieldValue('custentityproducts_s') != ''
				&& nlapiGetFieldValue('custentitysoftware_programming_s') != ''
				&& nlapiGetFieldValue('custentitytesting_commissioning_s') != ''
				&& nlapiGetFieldValue('custentityengineering_package_s') != ''
				&& nlapiGetFieldValue('custentity43') == '2') {

			nlapiDisableField('custentity44', false);
		} else {
			nlapiDisableField('custentity44', true);
		}
		// HANDOVER
		if (nlapiGetFieldValue('custentitycost_control_s') != ''
				&& nlapiGetFieldValue('custentitytransportation_s') != ''
				&& nlapiGetFieldValue('custentitysubcontractor_cost_s') != ''
				&& nlapiGetFieldValue('custentity_s_misc_c') != ''
				&& nlapiGetFieldValue('custentity44') == '2') {

			nlapiDisableField('custentity45', false);
		} else {
			nlapiDisableField('custentity45', true);
		}
	} else
		return true;
}
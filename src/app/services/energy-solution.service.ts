import { Injectable } from '@angular/core';

@Injectable()
export class EnergySolutionService {

    constructor() { }

	public getRentalFee(product_item, customer_type, order_ptd) {
		let chargeRate					= 0;
		let periodEndDate 				= new Date();
		let days_prior_paid_end_date 	= periodEndDate.setDate(periodEndDate.getDate() - 15);

		if (product_item.type === 'Inventory Item'
		 && !product_item.date_returned
		 && product_item.date_issued) {
								
			let item_paid_to_date 	= product_item.paid_to_date? product_item.paid_to_date.getTime(): 0;
			let item_issued_date 	= product_item.date_issued? product_item.date_issued.getTime(): 0;

			if ((item_paid_to_date < days_prior_paid_end_date)
			 || (!item_paid_to_date && (!item_issued_date || item_issued_date < days_prior_paid_end_date))) {
				
				if (!item_paid_to_date) {
					item_paid_to_date = item_issued_date;
				}

				// add a month
				product_item['pre_paid_to_date'] = new Date(item_paid_to_date);
				item_paid_to_date = this.getNextPaidToDate(product_item['pre_paid_to_date']);

				product_item.paid_to_date = item_paid_to_date;

				// do nothing if customer is external
				if (customer_type != '2') {				// compute non external rate
					chargeRate = this.getNonExternalRate(item_issued_date, periodEndDate, product_item.rate);
				} else {
					chargeRate = product_item.rate;
				}
			} else if (!item_paid_to_date && item_issued_date > days_prior_paid_end_date) {
				product_item.paid_to_date = item_issued_date;
			}
		}

		return chargeRate;
	}

	public getRentalFeeWithEndDate(product_item, customer_type, order_type=null) {
		// if (order_type != '1') {
		// 	return ;
		// }

		if (product_item.type != 'Inventory Item') {
			return 0;
		}

		let stItemDateReturned 	= product_item.date_returned;
		if (!stItemDateReturned) {
			return 0;
		}

		if (!product_item.paid_to_date) {
			let stItemDateIssued = product_item.date_issued;
			if (stItemDateIssued) {
				product_item.paid_to_date = stItemDateIssued;
			} else {
				return 0;
			}
		}

		if (!(product_item.paid_to_date instanceof Date)) {
			product_item.paid_to_date = new Date(product_item.paid_to_date);
		}

		let chargeRate = product_item.rate;
		let itemDateReturned_UTime 	= stItemDateReturned.getTime();
		let itemPaid2Date_UTime		= product_item.paid_to_date.getTime();
		let itemCompleted 			= product_item.completed;
		if ((itemPaid2Date_UTime < itemDateReturned_UTime) && (!itemCompleted || itemCompleted == 'F')) {

			let itemDateDiff = (itemDateReturned_UTime - itemPaid2Date_UTime) / 86400000;
			let itemPriceLevel = 0;

			if (itemDateDiff >= 1 && itemDateDiff <= 8) 
			{
				itemPriceLevel = (customer_type == 2) ? 11 : 10;
			}
			else if (itemDateDiff >= 9 && itemDateDiff <= 15) 
			{
				itemPriceLevel = (customer_type == 2) ? 12 : 3;
			}
			else if (itemDateDiff >= 16 && itemDateDiff <= 33) 
			{
				itemPriceLevel = (customer_type == 2) ? 1 : 2;
			}
			else if (itemDateDiff >= 34 && itemDateDiff <= 40) 
			{
				itemPriceLevel = (customer_type == 2) ? 19 : 18;
			}
			else if (itemDateDiff >= 41 && itemDateDiff <= 47) 
			{
				itemPriceLevel = (customer_type == 2) ? 20 : 21;
			}
			else if (itemDateDiff > 47) 
			{
				itemPriceLevel = (customer_type == 2) ? 22 : 23;
			}

			product_item.completed = 'T';

			return chargeRate * (100 - itemPriceLevel) / 100;
		} else {
			return chargeRate;	
		}
	}

	private getNextPaidToDate(date) {
		let new_paid_date = new Date(date.getTime());
		let last_month = date.getMonth();
		let addDays = new Date(date.getFullYear(), last_month + 1, 0).getDate();

		new_paid_date = new Date(new_paid_date.setDate(new_paid_date.getDate() + addDays));
		// while (new_paid_date.getMonth() - last_month > 1) {
		// 	// minus 1 day til difference is only a month
		// 	new_paid_date = new Date(new_paid_date.setDate(new_paid_date.getDate() - 1));
		// }

		return new_paid_date;
	}

	private getNonExternalRate(stIssuedDt, stReturnedDt, itemRate) {
		let daysBetween    = this.timeBetween(stReturnedDt,stIssuedDt,'D');

		if(daysBetween >= 1 && daysBetween <=90)
		{
			itemRate = itemRate* 0.8;
		}
		else if(daysBetween > 90 && daysBetween <=181)
		{
			itemRate = itemRate * 0.65;
		}
		else if(daysBetween > 181 && daysBetween <=273)
		{
			itemRate = itemRate * 0.55;
		}
		else if(daysBetween > 273 && daysBetween <=365)
		{
			itemRate = itemRate * 0.45;
		}
		else if(daysBetween > 365 && daysBetween <=548)
		{
			itemRate = itemRate * 0.35;
		}
		else if(daysBetween > 548 && daysBetween <=730)
		{
			itemRate = itemRate * 0.25;
		}
		else
		{
			itemRate = itemRate * 0.20;
		}

		return itemRate;
	}

	private timeBetween(date1, date2, stTime) {
		let intOneTimeUnit = 1;

		switch (stTime)
		{
			case 'D':
				intOneTimeUnit *= 24;
			case 'HR':
				intOneTimeUnit *= 60;
			case 'MI':
				intOneTimeUnit *= 60;
			case 'SS':
				intOneTimeUnit *= 1000;
		}

		// Calculate the difference in milliseconds
		let intDifference = Math.abs(date1 - date2);

		// Convert back to time units and return
		return Math.round(intDifference / intOneTimeUnit);
	}

	// function scheduled_calcRentalFee() 
	// {
	// 	var PL3 = '23';
	// 	var logger = new Logger();
	// 	logger.enableDebug();
	// 	logger.debug('Log', '-------------- Start --------------');

	// 	//var usageThreshold = 30; // Usage Point

		
	// 	//var stPeriodEndDate = '11/15/2008';
	// 	var stPeriodEndDate = nlapiGetContext().getSetting('script', 'custscript_period_end_date');

	// 	if (isEmpty(stPeriodEndDate)) 
	// 	{
	// 		logger.debug('Log', 'No Period End Date (Script Parameter) Specified');
	// 		return true;
	// 	}
		
	// 	logger.debug('Log', 'stPeriodEndDate: '+stPeriodEndDate);
	// 	var periodEndDate = nlapiStringToDate(stPeriodEndDate);
	// 	logger.debug('Log', 'periodEndDate: '+periodEndDate);

	// 	var d15daysPriorPEndDate = nlapiAddDays(periodEndDate,'-15');
	// 	logger.debug('Log', '15DaysPriorPEndDate: '+d15daysPriorPEndDate);

	// 	var d15daysPriorPEndDate_UTime = d15daysPriorPEndDate.getTime();
	// 	logger.debug('Log', '15DaysPriorPEndDate: '+d15daysPriorPEndDate_UTime);

	//    var columns = [new nlobjSearchColumn('internalid',null,'group')];
	// 	/* added by Gerrom 03/20/2012 - do not include work orders that have been processed. Custom field Processed indicates
	// 	* if the record has been processed. For when the scheduled script is rescheduled
	// 	*/
	//    //var filters = [new nlobjSearchFilter('custbody_es_ss_processed', null, 'is','F')];
	//    var results = nlapiSearchRecord('salesorder','customsearch_calc_rental_fee_wo_ss', null, columns);
		
	//    if (results) 
	//    {
	// 		logger.debug('Log', 'Work Order Found: '+results.length);
	// 		for (var i=0; i<results.length; i++) 
	// 		{
	// 			/*
	// 			 * Added by Gerrom Infante 03/20/2012 - checks if the script has reached the usage threshold (USAGE_LIMIT_THRESHOLD)
	// 			 * If it does, reschedule the script
	// 			 * */
	// 			var bRescheduled = rescheduleProcessing();

	// 			if (bRescheduled)   {
	// 				logger.debug('Log', 'Rescheduling script!');
	// 				return;
	// 			}

	// 			 var soId = results[i].getValue('internalid',null,'group');
	// 			logger.debug('Log', '('+i+') So Id: '+soId);

	// 			var bUpdateSO = false;

	// /*            try
	// 			{
	// 				var usageRemaining = nlapiGetContext().getRemainingUsage();
	// 				logger.debug('Log', 'Remaining Usage Points: '+ usageRemaining);
	// 				if (usageRemaining > usageThreshold) 
	// 				{*/
	// 					// load so
	// 					var soRec = nlapiLoadRecord('salesorder',soId, {recordmode:'dynamic'});
	// 				   //var soRec = nlapiLoadRecord('salesorder',soId);
	// 					logger.debug('Log', '('+i+') soRec: '+soRec);

	// 				   /*
	// 				   * Added by Gerrom Infante 03/20/2012 - get the customer type
	// 				   * */
	// 				   var strCustomerCategory = soRec.getFieldValue('custbody2');
	// 				   logger.debug('Log', '('+i+') Customer Category: '+strCustomerCategory);


	// 				   var itemCount = soRec.getLineItemCount('item');
	// 					logger.debug('Log', '('+i+') SO Item Count: '+itemCount);

	// 					var newLineNum = itemCount;
						
	// 					for (var j=1; j<=itemCount; j++) 
	// 					{
	// 						var soItemId = soRec.getLineItemValue('item','item',j);
	// 						logger.debug('Log', '('+i+') SO Item Line '+j+': soItemId: '+soItemId);
	// 						var soItemType = soRec.getLineItemValue('item','custcol_item_type',j);
	// 						logger.debug('Log', '('+i+') SO Item Line '+j+': soItemType: '+soItemType);
	// 						var soItemDateReturned = soRec.getLineItemValue('item','custcol_date_returned',j);
	// 						logger.debug('Log', '('+i+') SO Item Line '+j+': soItemDateReturned: '+soItemDateReturned);
	// 						var soItemDateIssued = soRec.getLineItemValue('item','custcol_date_issued',j);
	// 						logger.debug('Log', '('+i+') SO Item Line '+j+': soItemDateIssued: '+soItemDateIssued);
								
	// 						if (soItemType == 'Inventory Item' && isEmpty(soItemDateReturned) && !isEmpty(soItemDateIssued)) 
	// 						{
								
	// 							var soItemPaid2Date = soRec.getLineItemValue('item','custcol_paid_to_date',j);
	// 							logger.debug('Log', '('+i+') SO Item Line '+j+': soItemPaid2Date: '+soItemPaid2Date);                        

								
	// 							if (soItemPaid2Date) 
	// 							{
	// 								var soItemPaid2Date_UTime = nlapiStringToDate(soItemPaid2Date).getTime();
	// 								logger.debug('Log', '('+i+') SO Item Line '+j+': soItemPaid2Date_UTime: '+soItemPaid2Date_UTime);
	// 							}
	// 							else 
	// 							{
	// 								var soItemPaid2Date_UTime = 0;  
	// 							}
								
	// 							if (soItemDateIssued) 
	// 							{
	// 								var soItemDateIssued_UTime = nlapiStringToDate(soItemDateIssued).getTime();
	// 								logger.debug('Log', '('+i+') SO Item Line '+j+': soItemDateIssued_UTime: '+soItemDateIssued_UTime);                             
	// 							}
	// 							else 
	// 							{
	// 								var soItemDateIssued_UTime = 0;
	// 							}
							   
	// 							//if ((soItemPaid2Date_UTime > d15daysPriorPEndDate_UTime) || (isEmpty(soItemPaid2Date) && (soItemDateIssued_UTime > d15daysPriorPEndDate_UTime))) 
	// 						if ((soItemPaid2Date_UTime < d15daysPriorPEndDate_UTime) || (isEmpty(soItemPaid2Date) && (soItemDateIssued_UTime < d15daysPriorPEndDate_UTime)))
	// 							{
	// 								// get rental service item column
									
	// 								var soItemRentalItem = soRec.getLineItemValue('item','custcol_rental_service_item',j);
	// 								logger.debug('Log', '('+i+') SO Item Line '+j+': soItemRentalItem: '+soItemRentalItem);
									
									
	// 								if (!isEmpty(soItemPaid2Date)) 
	// 								{
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': Paid To Date is Not Blank');
	// 									var soNewItemPaid2Date = nlapiDateToString(nlapiAddMonths(nlapiStringToDate(soItemPaid2Date),1));
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': custcol_paid_to_date: '+soNewItemPaid2Date);
	// 									soRec.setLineItemValue("item", "custcol_paid_to_date",j,soNewItemPaid2Date);
	// 								}

	// 								else if (isEmpty(soItemPaid2Date)) 
	// 								{
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': Paid To Date is Blank');
	// 									var soNewItemDateIssued = nlapiDateToString(nlapiAddMonths(nlapiStringToDate(soItemDateIssued),1));
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': custcol_paid_to_date: '+soNewItemDateIssued);
	// 									soRec.setLineItemValue("item", "custcol_paid_to_date",j,soNewItemDateIssued);
	// 								}

	// 								// add line
	// 								newLineNum++;
	// 								logger.debug('Log', '('+i+') SO Item New Line: '+newLineNum);
	// 								//soRec.insertLineItem("item",newLineNum);
	// 							   soRec.selectNewLineItem('item');
	// 								//soRec.setLineItemValue("item", "item", newLineNum,soItemRentalItem);
	// 								soRec.setCurrentLineItemValue('item', 'item', soItemRentalItem);
	// 								//soRec.setLineItemValue("item", "quantity", newLineNum,'1');
	// 								soRec.setCurrentLineItemValue("item", "quantity", '1');
	// 						//soRec.setLineItemValue("item", "custcol_date_issued", newLineNum, soRec.getLineItemValue("item", "custcol_paid_to_date", j));
	// 								soRec.setCurrentLineItemValue("item", "custcol_date_issued", soRec.getLineItemValue("item", "custcol_paid_to_date", j));

	// 								// added 2009/01/14
	// 								//soRec.setLineItemValue("item", "custcol_paid_to_date", newLineNum, soRec.getLineItemValue("item", "custcol_paid_to_date", j));
	// 								soRec.setCurrentLineItemValue("item", "custcol_paid_to_date", soRec.getLineItemValue("item", "custcol_paid_to_date", j));
	// 								//soRec.setLineItemValue("item", "custcol1", newLineNum, soItemPaid2Date); // Set Prev PTD
	// 								soRec.setCurrentLineItemValue("item", "custcol1", soItemPaid2Date); // Set Prev PTD
	// 								//MD - Inv Item field name has changed (3/3/09)
	// 							//soRec.setLineItemValue("item", "custcol_rental_item", newLineNum, soItemId); // Set Inventory item
	// 							//soRec.setLineItemValue("item", "custcol_related_rental_item", newLineNum, soItemId); // Set Inventory item
	// 								soRec.setCurrentLineItemValue("item", "custcol_related_rental_item", soItemId); // Set Inventory item
	// 								/*
	// 								* Added by Gerrom - 03/20/2012: Added new logic based on Nick Thompson's email
	// 								* */
	// 							// do nothing if customer is external
	// 								if (strCustomerCategory !='2') {
	// 									// set price level to PL3 (internal id = 23)
	// 									//soRec.setLineItemValue('item', 'price', newLineNum, '23');
	// 									//soRec.setCurrentLineItemValue('item', 'price', '23'); 1/17/2013 - Nick changed this to Price Level internal id 1 which is the External Monthly Rate
	// 									soRec.setCurrentLineItemValue('item', 'price', '1');

	// 									// get the rate
	// 									//var strRate = soRec.getLineItemValue('item', 'rate', newLineNum);
	// 									var strRate = soRec.getCurrentLineItemValue('item', 'rate');
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': Rate: '+ strRate);
	// 								// compute non external rate
	// 									var itemNewRate = getNonExternalRate(soItemDateIssued,stPeriodEndDate,strRate);
	// 									logger.debug('Log', '('+i+') SO Item Line '+j+': New Item Rate: '+ itemNewRate);

	// 									// set new rate
	// 									//soRec.setLineItemValue('item', 'rate', newLineNum, itemNewRate);
	// 									soRec.setCurrentLineItemValue('item', 'rate', itemNewRate);

	// 								}
	// 								soRec.commitLineItem('item');
	// 								 bUpdateSO = true;
	// 							}
	// 							//else if (isEmpty(soItemPaid2Date) && (soItemDateIssued_UTime < d15daysPriorPEndDate_UTime)) 
	// 							else if (isEmpty(soItemPaid2Date) && (soItemDateIssued_UTime > d15daysPriorPEndDate_UTime)) 
	// 							{
	// 								logger.debug('Log', '('+i+') SO Item Line '+j+': Paid To Date is Blank and Issued Date is more than 15 days prior to Period End Date');
	// 								logger.debug('Log', '('+i+') SO Item Line '+j+': custcol_paid_to_date: '+soItemDateIssued);
	// 								soRec.setLineItemValue("item", "custcol_paid_to_date",j,soItemDateIssued);
	// 								bUpdateSO = true;
	// 							}
	// 						}
	// 					}
						
						
	// 					// save so
	// 					// added by Nick to ensure that we don't process this Work Order again. This field is a filtered in our saved search to exclude previously processed Work Orders.
	// 					var dateToday = nlapiDateToString(new Date());
	// 					logger.debug('Log', '('+i+') Last Processed Date = ' + dateToday);
	// 					soRec.setFieldValue('custbody_script_processed_on',dateToday);
	// 					var soUpdatedId = nlapiSubmitRecord(soRec,true); // submit the soRec
	// 					logger.debug('Log', 'Updating SO: '+soUpdatedId);
						





	// /* 
						
	// 					// save so
	// 					if (bUpdateSO) 
	// 					{    // added by Gerrom Infante - 03/20/2012 : mark the SO as processed so script wont pick it up again
	// 						//soRec.setFieldValue('custbody_es_ss_processed', 'T');
	// 						// added by Nick to ensure that we don't process this Work Order again. This field is a filtered in our saved search to exclude previously processed Work Orders.
	// 						var dateToday = nlapiDateToString(new Date());
	// 						logger.debug('Log', '('+i+') Last Processed Date = ' + dateToday);
	// 						soRec.setFieldValue('custbody_script_processed_on',dateToday);
	// 						var soUpdatedId = nlapiSubmitRecord(soRec,true); // submit the soRec
	// 						logger.debug('Log', '('+i+') Updating SO: '+soUpdatedId);
	// 					}				
	// 			   }
	// 				else 
	// 				{
	// 					throw nlapiCreateError('USAGE_LIMIT_EXCEEDED', 'Error in Creating Record: Ran into Usage Limit');
	// 				}*/
	// /*            }
	// 			catch (ex) 
	// 			{
	// 				throw ex;
	// 				logger.debug('Log', '('+i+') Updating SO: (Unable To Update): '+soRec.getId());
	// 			}
	// 			*/
	// 		}   
	//    }

	//    logger.debug('Log', '--------------- End ---------------');
	// }

	// function rescheduleProcessing() {

	// 	var REMAINING_USAGE_POINTS = checkRemainingUsage();
	// 	nlapiLogExecution('DEBUG', 'rescheduleProcessing', "REMAINING_USAGE_POINTS = "+ REMAINING_USAGE_POINTS);

	// 	var bReScheduled = false;
	// 	if (REMAINING_USAGE_POINTS < USAGE_LIMIT_THRESHOLD) {
	// 		var STATUS = nlapiScheduleScript("customscript_calc_rental_fee", "customdeploy_calc_rental_fee");

	// 		if (STATUS == "QUEUED") {
	// 			bReScheduled = true;
	// 			nlapiLogExecution('DEBUG', 'rescheduleProcessing', "Successfully Re-Scheduled Script Processing.");
	// 			return bReScheduled;
	// 		}
	// 	}

	// 	return bReScheduled;
	// }

	// function checkRemainingUsage() {
		
	// 	var REMAINING_USAGE = parseInt(nlapiGetContext().getRemainingUsage(), 10);
		
	// 	nlapiLogExecution('DEBUG', "checkRemainingUsage", "REMAINING_USAGE_POINTS = "+ REMAINING_USAGE);

	// 	return REMAINING_USAGE;
	// }

	// function getNonExternalRate(stIssuedDt, stReturnedDt, itemRate) {
	// 	//var objCurrentDate = new Date();
	// 	var objReturnDate  = new Date(stReturnedDt);
	// 	var objIssuedDate  = new Date(stIssuedDt);
	// 	var daysBetween    = Math.floor((objReturnDate - objIssuedDate) / (1000 * 60 * 60 * 24));//timeBetween(objReturnDate,objIssuedDate,'D');

	// 	if(daysBetween >= 1 && daysBetween <=90)
	// 	{
	// 		itemRate = itemRate* 0.8;
	// 	}
	// 	else if(daysBetween > 90 && daysBetween <=181)
	// 	{
	// 		itemRate = itemRate * 0.65;
	// 	}
	// 	else if(daysBetween > 181 && daysBetween <=273)
	// 	{
	// 		itemRate = itemRate * 0.55;
	// 	}
	// 	else if(daysBetween > 273 && daysBetween <=365)
	// 	{
	// 		itemRate = itemRate * 0.45;
	// 	}
	// 	else if(daysBetween > 365 && daysBetween <=548)
	// 	{
	// 		itemRate = itemRate * 0.35;
	// 	}
	// 	else if(daysBetween > 548 && daysBetween <=730)
	// 	{
	// 		itemRate = itemRate * 0.25;
	// 	}
	// 	else
	// 	{
	// 		itemRate = itemRate * 0.20;
	// 	}

	// 	return itemRate;
	// }

	// function timeBetween(date1, date2, stTime) {
	// 	var intOneTimeUnit = 1

	// 	switch (stTime)
	// 	{
	// 		case 'D':
	// 			intOneTimeUnit *= 24;
	// 		case 'HR':
	// 			intOneTimeUnit *= 60;
	// 		case 'MI':
	// 			intOneTimeUnit *= 60;
	// 		case 'SS':
	// 			intOneTimeUnit *= 1000;
	// 	}

	// 	// Convert both dates to milliseconds
	// 	var intDate1 = date1.getTime()
	// 	var intDate2 = date2.getTime()

	// 	// Calculate the difference in milliseconds
	// 	var intDifference = Math.abs(intDate1 - intDate2)

	// 	// Convert back to time units and return
	// 	return Math.round(intDifference / intOneTimeUnit)
	// }

	// function saveRecord_calcResidualRentalFee() 
	// {
	// 	try 
	// 	{
	// 		var logger = new Logger();
	// 		//logger.enableDebug();
	// 		logger.forceClientSide();
	// 		logger.debug('Log', '-------------- Start --------------');
			
	// 		var workOrderType = nlapiGetFieldValue('custbody_work_order_type');
	// 		logger.debug('Log', 'workOrderType: '+workOrderType);

	// 		var customerCategory = nlapiGetFieldValue('custbody2');
	// 		logger.debug('Log', 'customerCategory: '+customerCategory);

	// 		if (workOrderType != '1')  // 1 = Rental
	// 		{
	// 			logger.debug('Log', 'workOrderType is not Rental');
	// 			return true;
	// 		}

	// 		var itemCount = nlapiGetLineItemCount('item');
	// 		logger.debug('Log', 'itemCount: '+itemCount);

	// 		if (itemCount > 0) 
	// 		{
	// 			for (var i=1; i<=itemCount; i++) 
	// 			{
	// 				var itemType = nlapiGetLineItemValue('item','custcol_item_type',i);
	// 				logger.debug('Log', '('+i+') itemType: '+itemType);

	// 				var itemCompleted = nlapiGetLineItemValue('item','custcol_completed',i);
	// 				logger.debug('Log', '('+i+') itemCompleted: '+itemCompleted);

	// 				if (itemType != 'Inventory Item') 
	// 				{
	// 					logger.debug('Log', '('+i+') Skipped Line');
	// 					continue;
	// 				}


	// 				logger.debug('Log', '('+i+') Item is Inventory');

	// 				var stItemId = nlapiGetLineItemValue('item','item',i);
	// 				logger.debug('Log', '('+i+') stItemId: '+stItemId);

	// 				var stItemDateReturned = nlapiGetLineItemValue('item','custcol_date_returned',i);
	// 				logger.debug('Log', '('+i+') stItemDateReturned: '+stItemDateReturned);

	// //                if (isEmpty(stItemDateReturned)) 
	// //                {
	// //                    logger.debug('Log', '('+i+') Date Returned is Empty');
	// //                    continue;
	// //                }

	// 				var stItemPaid2Date = nlapiGetLineItemValue('item','custcol_paid_to_date',i);
	// 				logger.debug('Log', '('+i+') stItemPaid2Date: '+stItemPaid2Date);

	// 				if (isEmpty(stItemPaid2Date)) 
	// 				{
	// 					logger.debug('Log', '('+i+') Paid To Date is Empty');
	// 					var stItemDateIssued = nlapiGetLineItemValue('item','custcol_date_issued',i);
	// 					logger.debug('Log', '('+i+') stItemDateIssued: '+stItemDateIssued);

	// 					if (!isEmpty(stItemDateIssued)) 
	// 					{
	// 						stItemPaid2Date = stItemDateIssued;   
	// 						nlapiSetLineItemValue('item','custcol_paid_to_date', i, stItemPaid2Date);
	// 					}
	// 					else 
	// 					{
	// 						logger.debug('Log', '('+i+') Date Issued is Empty');
	// 						continue;
	// 					}
	// 				}

	// 				if (isEmpty(stItemDateReturned)) 
	// 				{
	// 					logger.debug('Log', '('+i+') Date Returned is Empty');
	// 					continue;
	// 				}

	// 				var itemDateReturned_UTime = nlapiStringToDate(stItemDateReturned).getTime();
	// 				logger.debug('Log', '('+i+') itemDateReturned_UTime: '+itemDateReturned_UTime);
	// 				var itemPaid2Date_UTime = nlapiStringToDate(stItemPaid2Date).getTime();
	// 				logger.debug('Log', '('+i+') itemPaid2Date_UTime: '+itemPaid2Date_UTime);
					
	// 				if (itemPaid2Date_UTime >= itemDateReturned_UTime) 
	// 				{
	// 					logger.debug('Log', '('+i+') Paid To Date is on or after Date Returned ');

	// 				}
	// 				else if ((itemPaid2Date_UTime < itemDateReturned_UTime) && (itemCompleted == 'F' || isEmpty(itemCompleted))) 
	// 				{
	// 					var stItemRentalItem = nlapiGetLineItemValue('item','custcol_rental_service_item',i);
	// 					logger.debug('Log', '('+i+') stItemRentalItem: '+stItemRentalItem);

	// 					if (isEmpty(stItemRentalItem)) 
	// 					{
	// 						alert('No Rental Service Item for Item Line: '+i);
	// 						return false;
	// 					}

	// 					// add new item to sales order
	// 					nlapiInsertLineItem('item');
	// 					//var currentLineIndex = nlapiGetCurrentLineItemIndex('item');
	// 					nlapiSetCurrentLineItemValue('item','item',stItemRentalItem,true,true);
	// 					nlapiSetCurrentLineItemValue('item','quantity','1',true,true);

	// 					// set Prev PTD to the PTD of the inventory item
	// 					nlapiSetCurrentLineItemValue('item','custcol1',stItemPaid2Date,true,true);

	// 					// set PTD to the Date Returned of the inventory item
	// 					nlapiSetCurrentLineItemValue('item','custcol_paid_to_date',stItemDateReturned,true,true);

	// 					// set Rental Item to the inventory item
	// 					//MD - Inv Item field ID has changed (3/3/09)
	// 					//nlapiSetCurrentLineItemValue('item','custcol_rental_item',stItemId,true,true);
	// 					nlapiSetCurrentLineItemValue('item','custcol_related_rental_item',stItemId,true,true);
						
	// 					var itemDateDiff = (itemDateReturned_UTime - itemPaid2Date_UTime) / 86400000;
	// 					logger.debug('Log', '('+i+') Item Date Difference: '+itemDateDiff);

	// 					var itemPriceLevel = '';
			
	// 					if (itemDateDiff >= 1 && itemDateDiff <= 8) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 11 : 10;
	// 					}
	// 					else if (itemDateDiff >= 9 && itemDateDiff <= 15) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 12 : 3;
	// 					}
	// 					else if (itemDateDiff >= 16 && itemDateDiff <= 33) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 1 : 2;
	// 					}
	// 					else if (itemDateDiff >= 34 && itemDateDiff <= 40) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 19 : 18;
	// 					}
	// 					else if (itemDateDiff >= 41 && itemDateDiff <= 47) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 20 : 21;
	// 					}
	// 					else if (itemDateDiff > 47) 
	// 					{
	// 						itemPriceLevel = (customerCategory == 2) ? 22 : 23;
	// 					}
						
	// 					logger.debug('Log', '('+i+') Rental Item Price Level: '+itemPriceLevel);
	// 					nlapiSetCurrentLineItemValue('item','price',itemPriceLevel,true,true);
	// 					nlapiCommitLineItem('item');
	// 					logger.debug('Log', '('+i+') Updating Original Line: Complete Field');
	// 					nlapiSetLineItemValue('item','custcol_completed',i,'T');
	// 				}
	// 			}
	// 		}

	// 		logger.debug('Log', '--------------- End ---------------');
	// 		return true;
			
	// 	}
	// 	catch (e) 
	// 	{
	// 		alert('Script Error: '+e.description);
	// 		return false;
	// 	}

	// 	return true;
	// }
}
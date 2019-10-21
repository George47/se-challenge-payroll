import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConnectionService } from '../../../services/connection.service';
import { DialogService } from '../../../common/notification/dialog/dialog.service';

@Component({
  selector: 'view-reports-detail',
  templateUrl: './view-reports-detail.component.html',
  styleUrls: ['./view-reports-detail.component.css']
})
export class ViewReportsDetailComponent implements OnInit {
  	isDoingPayment				: boolean = false;
	isShippingAddressAvailable	: boolean = false;
	is_tax_apply				: boolean = false;
	is_refresh_products			: boolean = false;
	products					: any = [];

	columns: any = [{
		name: 'employee_id',
		type: 'any',
		header: 'Employee ID',
		value_name: 'employee_id'
	},
	{
		name: 'pay_period',
		type: 'text',
		header: 'Pay Period',
		value_name: 'pay_period'
	},
	{
		name: 'amount_paid',
		type: 'text',
		header: 'Amount Paid',
		value_name: 'amount_paid'
	}

];

	reportDetails: any;

	@Input() report				: any = [];
	@Output() remove			: EventEmitter<any> = new EventEmitter();

	constructor(
		private connectionService: ConnectionService,
		private dialog: DialogService
	) { }

	ngOnInit() {
		this.reportDetails = [];
		let tmpLst = []
		for (let i = 0; i < this.report.length - 1; i++)
		{
			const temp = {
				'report_id': this.report[i].report_id,
				'employee_id': this.report[i].employee_id,
				'pay_period': this.report[i].pay_period,
				'amount_paid': this.report[i].amount_paid,
			}
			if (temp.amount_paid) {
				tmpLst.push(temp);	
			}
		}
		this.reportDetails = tmpLst;
	}

}

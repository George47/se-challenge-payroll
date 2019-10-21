import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RowPaginatorComponent } from './row-paginator/row-paginator.component';
import { ConnectionService } from '../../services/connection.service';

declare var window: any;

@Component({
	selector: 'view-reports',
	templateUrl: './view-reports.component.html',
	styleUrls: ['./view-reports.component.css'],
	encapsulation: ViewEncapsulation.None,	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
			state('expanded', style({ height: '*', visibility: 'visible' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	]
})
export class ViewReportsComponent implements OnChanges {
	@Input() total: number = 1;
	@Input() per_page: number = 25;
	@Input() pageIndex: number = 0;
	@Input() tax_percentage: number = 0;
	@Input() top_pagination: boolean = false;
	@Input() contained: boolean = false;
	@Input() filter: string = "";
	@Input() page_size: any = [5, 10, 25, 50];
	@Input() columns: any = [];
	@Input() bulkOptions: any = [];
	@Input() priceMapping: any = {};

	@Output() bulkOptionChange: EventEmitter<any> = new EventEmitter();
	@Output() searchChange: EventEmitter<any> = new EventEmitter();
	@Output() refreshOrderList: EventEmitter<any> = new EventEmitter();
	@Output() exportFile: EventEmitter<any> = new EventEmitter();

	dbConnected: boolean = true;

	isExpansionDetailRow = (i: number, row: Object) => {
		return row.hasOwnProperty('detailRow');
	}

	data: any = [];
	data_rows: any = [];
	displayData: any = [];
	initialSelection: any = [];
	allowMultiSelect: boolean = true;
	displayedColumns: any = false;

	selection = new SelectionModel<any>(this.allowMultiSelect, this.initialSelection);
	dataSource = new MatTableDataSource();

	@ViewChild(RowPaginatorComponent) customPaginator: RowPaginatorComponent;

	constructor(
		private connection: ConnectionService
	) { }

	ngOnChanges() {
		this.dataSource.paginator = this.customPaginator;

		this.columns = [
			{
				name: 'actions', type: 'actions', header: 'actions', actions: [
					// { icon: 'add', action: 'open' },
					// { icon: 'remove', action: 'close' }
					{ icon: '+', action: 'open' },
					{ icon: '-', action: 'close' }
				]
			},
			{ name: 'report_id', type: 'text', header: 'Report ID', value_name: 'report_id' },
			{ name: 'pay_period', type: 'text', header: 'Pay Period', value_name: 'pay_period' },
			{ name: 'pay_amount', type: 'text', header: 'Pay Amount', value_name: 'pay_amount' },
			{ name: 'upload_date', type: 'text', header: 'Upload Date', value_name: 'upload_date' }
		];

		let cols = [];
		this.columns.forEach(col => {
			cols.push(col.name);
		});

		this.displayedColumns = cols;
		this.getList().subscribe(list => {

		});
	}


	getList(): Observable<any> {
		return new Observable(observer => {

			this.selection.clear();

			this.data_rows = [];

			const url = window.report_api_endpoint;
			this.connection.get(url).subscribe(reports => {
				for (let i = 0; i < reports.length; i++)
				{
					let data = {
						'report_id': reports[i].report_id,
						'pay_period': reports[i].pay_period,
						'pay_amount': '$' + parseFloat(reports[i].pay_amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
						'employee_id': reports[i].report_id,
						'upload_date': reports[i].upload_date,
						'report': JSON.parse(reports[i].data),
						'show': 'close'
					}

					this.data_rows.push(data); 

				}

				this.buildDisplayList();
		
					if (this.data) {
						observer.next(true);
						observer.complete();
					}

			},
			
			err => {
				this.dbConnected = false;
			})

		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected == numRows;
	}

	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

	runAction(action, col) {
		this[action](col);
	}

	export() {
		this.exportFile.emit();
	}

	switchPage($event) {
		this.per_page = $event.pageSize;
		this.pageIndex = $event.pageIndex;
		this.getList().subscribe(list => { });
	}

	toggleRow(row) {
		let foundOrderDetail = this.dataSource.data.find(report => report['expand'] !== undefined && report['expand'][report['expand'].length - 1].report_id === row.report_id);
		let index = this.dataSource.data.indexOf(foundOrderDetail);
		let parentIndex = index - 1;
		if (parentIndex >= 0) {
			if (this.dataSource.data[parentIndex]['show'] == 'open') {
				this.dataSource.data[parentIndex]['show'] = 'close';
			} else {
				this.dataSource.data[parentIndex]['show'] = 'open';
			}
		}
		this.dataSource.data[index]['expand'].show = !this.dataSource.data[index]['expand'].show;
	}

	open(row) {
		this.toggleRow(row);
	}

	close(row) {
		this.toggleRow(row);
	}


	filterItems(query) {
		let reg = new RegExp(query, 'gi');
		this.buildDisplayList(
			this.data_rows.filter(report => report.employee_id.toString().match(reg))
		);
	}

	buildDisplayList(rows = null) {
		if (!rows) {
			rows = this.data_rows;
		}
		let tmp = [];
		for (var i = 0; i < rows.length; ++i) {
			let report = rows[i];
			let displayReport = {};

			for (let key in report) {
				if (key === 'report') {
					continue;
				}

				displayReport[key] = report[key];
			}
			let tmpReport = report.report.report;
			tmpReport.push({"report_id" : report.report_id})
			tmp.push(displayReport, { detailRow: true, 'expand': tmpReport});
		}

		this.data = tmp;
		this.dataSource.data = this.data;
		this.total = this.data.length;
	}

}
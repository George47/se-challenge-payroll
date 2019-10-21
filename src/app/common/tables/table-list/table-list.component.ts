import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnChanges} from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { ConnectionService } from '../../../services/connection.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableListComponent implements OnInit, OnChanges {
	@Input() total: number = 1;
    @Input() per_page: number = 25;
    @Input() page_size: any = [5,10,25,50];
    @Input() pageIndex: number = 0;
    @Input() list_url: any = false;
    @Input() data: any = false;
    @Input() top_pagination: boolean = false;
    @Input() contained: boolean = false;

    @Input() filter: string = "";
    @Output() doAction: EventEmitter<any> = new EventEmitter();

    initialSelection: any = [];
    allowMultiSelect:boolean = true;
    selection = new SelectionModel<any>(this.allowMultiSelect, this.initialSelection);
	displayedColumns:any = false;
	@Input() columns: any = [];
    dataSource = new MatTableDataSource();

	constructor(
		private connection: ConnectionService,
	) { }

	ngOnInit() {
		let columns = [];
		this.columns.forEach(col => {
			columns.push(col.name);
		});
		this.displayedColumns = columns;
		this.getList().subscribe(list => {

		});
	}

	ngOnChanges() {
		this.getList().subscribe(list => {

		});
	}

	getList(): Observable<any> {
		return new Observable(observer => {
			this.selection.clear();

			if (this.list_url) {
				let url = this.list_url;
				if (!this.contained) {
					url = url.indexOf('?') > -1 ? url + '&page=' + this.pageIndex + '&limit=' + this.per_page : url + '?page=' + this.pageIndex + '&limit=' + this.per_page;
				}
				this.connection.get(url).subscribe(list => {
					if (list.data) {
						this.dataSource.data = list.data;
					}

					if(list.meta) {
						this.total = list.meta.total;
					} else {
						this.total = list.length;

						const start = this.pageIndex * this.per_page;
						this.dataSource.data = list.slice(start, (start + this.per_page));
					}

					observer.next(true);
					observer.complete();
				});
			}
			else if (this.data) {
				this.dataSource.data = this.data;
				this.total = this.data.length;

				observer.next(true);
				observer.complete();
			}
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

    runAction(action, col, event=null) {
    	if (action) {
	    	let item_action = {action: action, col: col};
	    	if (event) {
	    		item_action['event'] = event;
	    	}

			this.doAction.emit(item_action);
    	}
    }

	switchPage($event) {
		this.per_page = $event.pageSize;
	    this.pageIndex = $event.pageIndex;
		this.getList().subscribe(list => {
	        
		});
	}
	
	isArray(value) {
		return (value instanceof Array);
	}
}

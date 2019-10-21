import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'action-bar',
	templateUrl: './action-bar.component.html',
	styleUrls: ['./action-bar.component.css']
})
export class ActionBarComponent implements OnInit {
	//define inputs
	@Input() bulkOptions: Array<any>;
	@Output() bulkOptionChange:EventEmitter<any> = new EventEmitter();
	@Output() filterItems:EventEmitter<any> = new EventEmitter();
	@Output() clearSearchEmitter:EventEmitter<any> = new EventEmitter();

	constructor(
	) { }

	ngOnInit() {
	}

	actionModel = "All Status";
	query = "";

	confirmBulkEdit() {
		this.bulkOptionChange.emit(this.actionModel);
	}

	clearSearchFunction() {
		this.clearSearchEmitter.emit();
	}

	filter() {
		this.filterItems.emit(this.query);
	}

	searchResult(event) {
		// if(event.which === 13
		// || this.query === '') {
			this.filter();
		// }
	}
}

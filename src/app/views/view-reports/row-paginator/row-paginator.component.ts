import { FormControl, FormGroup } from '@angular/forms';
import { Component, Input, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-row-paginator',
  templateUrl: './row-paginator.component.html',
  styleUrls: ['./row-paginator.component.css']
})
export class RowPaginatorComponent extends MatPaginator implements AfterViewInit  {

  selector = new FormControl();
	selectorGroup = new FormGroup({
		  selector: this.selector
	});
  
	ngAfterViewInit(): void {
		let initSize = this.pageSize;
		this.setInitialValues(this.pageSize);


		setTimeout(() => {
			this.selector.setValue(this.pageSize + '');
		});
		
		this.selectorGroup.valueChanges.subscribe(data => this.selectChanged(data.selector));
	}

	lastIndex: number;
	initialPageSize = this.pageSize;

	setInitialValues(value) {
		setTimeout(() => {
			if (this.length !== 0) {
				this.selectChanged(value);
			} else {
				this.setInitialValues(value);
			}
		}, 100);
	}

	selectChanged(value) {
		const startIndex = this.pageIndex * this.pageSize;
		this.pageSize = value * 2;
		this.pageIndex = Math.floor(startIndex / this.pageSize);
		this.lastIndex = Math.ceil((this.length / this.pageSize));
		this.fireEvent();
	}

	getRangeLabel(page: number, pageSize: number, length: number) {
		if (length !== 0) {
			this.lastIndex = this.length / this.pageSize;
			if (length == 0 || pageSize == 0) {
				return `0 of ${length}`;
			}
			length = Math.max(length, 0);
			const startIndex = page * pageSize;
			const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
			return `${startIndex / 2 + 1} - ${endIndex / 2} of ${length / 2}`;
		}
	}

	getArrowColor(value) {
		if (this.pageIndex === 0 && value === "left") {
			return "black"; // grayish color
		} else if (value === "right" && this.pageIndex + 1 === Math.ceil(this.lastIndex)) {
			return "black"; // grayish color
		} else {
			return "#adadad";
		}
	}

	previousPage() {

		if (this.pageIndex !== 0) {
			--this.pageIndex;
			this.fireEvent();
		}
	}

	fireEvent() {
		this.page.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize, length: this.length });
		// console.log("Fired event: " + JSON.stringify({ pageIndex: this.pageIndex, pageSize: this.pageSize, length: this.length }));
	}

	nextPage() {
		if (this.pageIndex + 1 !== Math.ceil(this.lastIndex)) {
			++this.pageIndex;
			this.fireEvent();
		}
	}

	getCursorStyle(value) {
		if (value === "left" && this.pageIndex === 0) {
			return "context-menu";
		} else if (value === "right") {

			if (Math.ceil(this.lastIndex) === this.pageIndex + 1) {
				return "context-menu";
			}
		} else {
			return "pointer";
		}
	}
}

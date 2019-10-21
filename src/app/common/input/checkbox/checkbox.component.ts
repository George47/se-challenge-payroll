import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'checkbox',
	templateUrl: './checkbox.component.html',
	styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {
	//defind inputs
	checkbox = false;
	@Output() checkboxChange: EventEmitter<any> = new EventEmitter();
	@Input()
	get check() {
		return this.checkbox;
	}

	set check(val) {
		this.checkbox = val;
		this.checkboxChange.emit(val);
	}

	constructor() { }

	ngOnInit() {
	}

	changeCheck(): void {
		this.check = !this.check;
  }

}

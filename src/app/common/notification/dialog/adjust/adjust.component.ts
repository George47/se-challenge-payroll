import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'adjust',
	templateUrl: './adjust.component.html',
	styleUrls: ['./adjust.component.css']
})
export class AdjustComponent implements OnInit {
	product: any;
	adjustValue = 0;

	constructor(
		@Inject (MAT_DIALOG_DATA) public data: any
	) {
		this.product = data.product;
	}

	ngOnInit() {

	}

	updateAdjust() {
		if (this.adjustValue > 100) {
			this.adjustValue = 100;
		}
		this.product.adjust = this.adjustValue;
	}
}
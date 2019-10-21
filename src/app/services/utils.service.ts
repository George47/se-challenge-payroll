import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

    constructor() { }

	cloneObject(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || 'object' != typeof obj) return obj;

		// Handle Date
		if (obj instanceof Date) {
			let copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			let copy = [];
			for (let i = 0, len = obj.length; i < len; i++) {
				copy[i] = this.cloneObject(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			let copy = {};
			for (let attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = this.cloneObject(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	dateFormat(date) {
		if (date) {

			let year 	= date.getUTCFullYear();
			let month 	= date.getUTCMonth() + 1;
			let day 	= date.getUTCDate();
		
			return  (month > 9? month	: '0' + month) + '/' +
					(day   > 9? day		: '0' + day) + '/' +
					 year;
		}

		return null;
	}
}
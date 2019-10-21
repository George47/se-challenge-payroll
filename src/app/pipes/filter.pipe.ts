import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(items: any, search: any, fields: any, sub_array?: any, sub_array_fields?: any): any {
        if (!items || items.length === 0) 
            return [];

        if (!search)
        	search = "";

        if (search == "" && !sub_array)
            return items;
        
        search = search.toLowerCase();
        let filtered = [];

        for(let i = 0; i < items.length; i++) {
            const item = items[i];

            let valid = false;
            for(let f = 0; f < fields.length; f++) {
                const field = fields[f];
                if (item[field] && item[field].toString().toLowerCase().indexOf(search) > -1 && search != '') {
                    valid = true;
                    break;
                }
            }
			
			if (sub_array_fields) {
	            for(let f = 0; f < sub_array_fields.length; f++) {
	            	const field = sub_array_fields[f];

	            	for(let sf = 0; sf < fields.length; sf++) {
	                	const sub_field = fields[sf];

	                	sub_array.forEach(sub_item => {
	                		// console.log('sub_array', item[field], sub_item, sub_field, field, item[field].contructor === Array);
	                		if (item[field].constructor === Array) {
	                			for(let i = 0; i < item[field].length; i++) {
	                				let si = item[field][i];
									
									let sub_valid = true;
	                				for(let cf in sub_item) {
										if (si[cf] !== sub_item[cf]) {
											sub_valid = false;
										}
	                				}
									
									// console.log("subvalid", sub_valid);
	                				if (sub_valid) {
	                					valid = true;
	                					break;
	                				}
	                			}
	                		} else {
	                			if (item[field].indexOf(sub_item[sub_field]) > -1) {
		                			valid = true;
		                		}
	                		}
	                	});

	                	if (sub_array.length === 0) {
	                		valid = true;
	                	}
	                }
	            }
	        }

            if (valid) {
                filtered.push(item);
            }
        }

        return filtered;
    }

}

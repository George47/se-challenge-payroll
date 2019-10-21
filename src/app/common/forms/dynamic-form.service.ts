import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class DynamicFormService {
    inputs: any = {};
    values: any = false;
    form: FormGroup;
    existingform: any = false;
    multiform: any = false;
    multiformName: any = false;
    constructor(
        private fb: FormBuilder,
    ) { }

    setValue(s, value) {
        this[s] = value;
    }

    createForm(fields, values) {
        let inputs = {};

        if (values) {
            for(let v = 0; v < fields.length; v++) {
                let val = fields[v];
                for(let i in values) {
                    if (i == val.field) {
                        val.value = values[i];
                    }
                }
            }
        }

        for(let f = 0; f < fields.length; f++) {
            let value = '';
            if (fields[f].value) {
                value = fields[f].value;
            }

            if (fields[f].validator) {
                inputs[fields[f].field] = [value, fields[f].validator];
            } else {
                inputs[fields[f].field] = [value];
            }
        }

        return this.fb.group(inputs);
    }

    createMultiform(formName, values, multiform) {
        let fields = multiform[formName];
        let inputs = {};
        let first = true;

        if (values) {
            for(let v = 0; v < fields.length; v++) {
                let val = fields[v];
                for(let i in values) {
                    if (i == val.field) {
                        val.value = values[i];
                    }
                }
            }
        }

        for(let f = 0; f < fields.length; f++) {
            let value = '';
            if (fields[f].value) {
                value = fields[f].value;
            }

            if (fields[f].fgroup) {
                inputs[fields[f].field] = this.fb.array([]);

                if (values[fields[f].fgroupValues]) {
                    for(let s = 0; s < values[fields[f].fgroupValues].length; s++) {
                        let sub = values[fields[f].fgroupValues][s];
                        
                        inputs[fields[f].field].push(this.createMultiform(fields[f].fgroup, sub, multiform));
                    }
                }
            } else {
                if (fields[f].validator) {
                    inputs[fields[f].field] = [value, fields[f].validator];
                } else {
                    inputs[fields[f].field] = [value, Validators.required];
                }
            }
        }

        return this.fb.group(inputs);
    }

}

import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormService } from '../dynamic-form.service';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DynamicFormComponent implements OnInit {
    @Input() inputs: any = {};
    @Input() values: any = false;
    form: FormGroup;
    @Output('form') formChange:EventEmitter<any> = new EventEmitter();
    @Input() existingform: any = false;
    @Input() multiform: any = false;
    @Input() multiformName: any = false;
    @Input() selectOptions: any = {};
    constructor(
        private fb: FormBuilder,
        private dfs: DynamicFormService
    ) { }

    ngOnInit() {        
        if (this.existingform) {
            this.form = this.existingform;
        } else {
            if (this.multiform) {
                this.form = this.dfs.createMultiform(this.multiformName, this.values, this.multiform);
            } else {
                this.form = this.dfs.createForm(this.inputs, this.values);
            }

            this.form.valueChanges.subscribe(form => {
                this.formChange.emit(form);
            })
        }

        this.formChange.emit(this.form);
    }

    checkDepend(field) {
        this.formChange.emit(this.form);
    }

}

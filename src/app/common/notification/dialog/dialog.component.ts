import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    title: any = 'Notification!';
    message: any = '';
    yes: any = "Ok";
    no: any = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<DialogComponent>
    ) { 
        this.title = this.data.title;
        this.message = this.data.message;
        if (this.data.yes)
            this.yes =this.data.yes;

        if (this.data.no)
            this.no = this.data.no;
    }

    ngOnInit() {
    }

    close(response) {
        this.dialogRef.close(response);
    }

}

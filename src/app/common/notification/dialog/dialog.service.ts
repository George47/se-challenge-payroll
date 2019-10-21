import { Injectable } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Injectable()
export class DialogService {

    constructor(
        private dialog: MatDialog,
    ) {}

    showDialogSuccess(title, message) {
        let dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                message: message
            }
        });

        return dialogRef.afterClosed();
    }

    showDialogError(title, message) {
        let dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                message: message,
                yes: false,
                no: false
            }
        });
    }

    showConfirmationdialog(title, message, yes?, no?) {
        let dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                message: message,
                yes: yes,
                no: no
            }
        });

        return dialogRef.afterClosed();
    }

    customDialog(component, data) {
      
        let dialogRef = this.dialog.open(component, {
            data: data
        });

        return dialogRef.afterClosed();
    }
}

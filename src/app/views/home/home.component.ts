import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { DialogService } from '../../common/notification/dialog/dialog.service';

import { ConnectionService } from '../../services/connection.service';
import { ViewReportsComponent} from '../view-reports/view-reports.component';
declare var window: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    actionbar: boolean = false;
    loading: boolean = false;
    index: number = 0;
    query: string = '';
    sortdirection: string = 'asc';
    page: number = 1;
    maxpages: number = 1;
    limit: number = 10;

    columns: any = [{
            name: 'employee_id',
            type: 'text',
            header: 'Employee ID',
            value_name: 'employee_id'
        },
        {
            name: 'pay_period',
            type: 'text',
            header: 'Pay Period',
            value_name: 'pay_period'
        },
        {
            name: 'amount_paid',
            type: 'text',
            header: 'Amount Paid',
            value_name: 'amount_paid'
        },
    ];

    file: any;

    csvFile: any;
    report: any;
    reportID: any;
    arrayBuffer: any;
    showReport: boolean = false;
    payPeriodStart: any;
    payPeriodEnd: any;
    totalPay: number = 0;
    bulkOptions: any;

    constructor(
        private elRef: ElementRef,
        private dialog: DialogService,
        private connection: ConnectionService
    ) {}

    @ViewChild(ViewReportsComponent) private viewReportsComponent: ViewReportsComponent;

    ngOnInit() {
        const url = window.report_api_endpoint;
        this.connection.get(url).subscribe(reports => {});
    }

    saveReport() {
        this.dialog.showConfirmationdialog("Save Report?", "Are you sure you want to save this report?", "Save", "Cancel").subscribe(res => {
            if (res) {
                // @TODO: setup db connection
                let tmpList = [];
                tmpList.push(this.report);

                let postDataReportDetails = {
                    "report_id": this.reportID,
                    "report": this.report
                }

                let postData = {
                    "report_id": this.reportID,
                    "pay_period": this.payPeriodStart + ' - ' + this.payPeriodEnd,
                    "pay_amount": this.totalPay,
                    "report": JSON.stringify(postDataReportDetails)
                }

                const url = window.report_api_endpoint;
                this.connection.post(url, postData).subscribe(res => {
                        if (res.affectedRows > 0) {
                            this.dialog.showDialogSuccess("", "Report Saved Successfully").subscribe(end => {
                                this.showReport = false;
                                this.report = [];
                                this.totalPay = 0;
                            })
                        }
                    },
                    err => {
                        this.dialog.showDialogError("", "Something went wrong, " + err.statusText)
                    });
            }
        });
    }

    /*
    *   uploading file from csv data
    *
    */
    uploadFile($event) {
        // read csv to text
        this.file = $event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(this.file);

        reader.onload = () => {
            const scope = this;
            const rawData = reader.result;
            const data = ( < string > rawData).split('\n')

            this.reportID = data[data.length - 2].split(',')[1];

            var dataSorted = this.sortDataList(data, scope);
            var tmpList = [];
            var reportData = {};

            // loop through sorted data list
            for (let i = 0; i < dataSorted.length; i++) {

                var employeeData = dataSorted[i];
                var employeeID = parseInt(employeeData[2]);

                var paymentAmount = this.calculatePayAmount(employeeData[3], employeeData[1]);

                this.totalPay += paymentAmount;

                // parse the date into wanted fromat
                var paymentDate = this.stringToDate(employeeData[0], 'dd/mm/yyyy', '/');
                if (paymentDate.getDate() < 16) {
                    var dateRange: string = '1/' + (paymentDate.getMonth() + 1) +
                        '/' + paymentDate.getFullYear() +
                        ' - ' +
                        '15/' + (paymentDate.getMonth() + 1) +
                        '/' + paymentDate.getFullYear();

                } else {
                    const endOfMonth = new Date(paymentDate.getFullYear(), (paymentDate.getMonth() + 1) == 0 ? 1 : (paymentDate.getMonth() + 1), 0);

                    var dateRange: string = '16/' + (paymentDate.getMonth() + 1) +
                        '/' + paymentDate.getFullYear() +
                        ' - ' +
                        this.dateToString(endOfMonth);

                }

                var dateRangeSplit = dateRange.split('-');

                // if the current date range is in object, add payment value to existing amount
                if (reportData[dateRange]) {
                    if (employeeID in reportData[dateRange]) {
                        reportData[dateRange][employeeID] += paymentAmount;
                    } else {
                        this.assign(reportData, [dateRange, employeeID], paymentAmount);
                    }
                // else assign it and make payment amount the only value
                } else {
                    this.assign(reportData, [dateRange, employeeID], paymentAmount);
                }

                // add report to view data
                var tmpList = []
                for (let data in reportData) {
                    for (let employee in reportData[data]) {

                        const tmp = {
                            'employee_id': employee,
                            'pay_period': data,
                            'amount_paid': '$' + reportData[data][employee].toFixed(2)
                        }
                        tmpList.push(tmp);

                    }
                }
            }

            // assign value
            this.report = tmpList;
            this.showReport = true;

            this.payPeriodStart = this.report[0].pay_period.split('-')[0].trim();
            this.payPeriodEnd = this.report[this.report.length - 1].pay_period.split('-')[1].trim();

        };

    }

    // sort the data list by date first, so dates are in order to be processed
    sortDataList(data, scope) {
        let dataSorted = data.map(function(log) {
            return log.split(',');
        });

        dataSorted = dataSorted.slice(1, -2)

        dataSorted.sort(function(a, b) {
            var keyA = scope.stringToDate(a[0], 'dd/mm/yyyy', '/');
            var keyB = scope.stringToDate(b[0], 'dd/mm/yyyy', '/');
            // Compare the 2 dates
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        return dataSorted;
    }

    assign(obj, keyPath, value) {
        let lastKeyIndex = keyPath.length - 1;
        for (var i = 0; i < lastKeyIndex; ++i) {
            let key = keyPath[i];
            if (!(key in obj)) {
                obj[key] = {}
            }
            obj = obj[key];
        }
        obj[keyPath[lastKeyIndex]] = value;
    }

    // format date to string
    dateToString(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        return day + '/' + month + '/' + year;
    }

    // format string to date
    stringToDate(date, format, delimiter) {
        var formatLowerCase = format.toLowerCase();
        var formatItems = formatLowerCase.split(delimiter);

        var dateItems = date.split(delimiter);
        
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        
        var month = parseInt(dateItems[monthIndex]) - 1;
        var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
        
        return formatedDate;
    }

    // calculate payment amount
    calculatePayAmount(group, hour) {
        var hourWage = 0;
        switch (group.toString().trim()) {
            case 'A': {
                hourWage = 20;
                break;
            }
            case 'B': {
                hourWage = 30;
                break;
            }
        }

        return hourWage * parseFloat(hour);
    }

    cancelReport() {
        this.report = [];
        this.showReport = false;
        this.totalPay = 0;
    }

    tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        let index = tabChangeEvent.index;
        this.index = tabChangeEvent.index;

        if (index === 1) {
            this.viewReportsComponent.getList().subscribe(res => {});
        }

    }

}
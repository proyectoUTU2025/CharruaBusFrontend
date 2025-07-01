import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf } from '@angular/common';

import { BusDetailComponent } from '../bus-detail/bus-detail.component';
import { OmnibusHistoryComponent } from '../bus-detail/omnibus-history/omnibus-history.component';

@Component({
    selector: 'app-bus-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatTabsModule,
        NgIf,
        BusDetailComponent,
        OmnibusHistoryComponent,
    ],
    templateUrl: './bus-dialog.component.html',
    styleUrls: ['./bus-dialog.component.scss']
})
export class BusDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { busId: number },
        public dialogRef: MatDialogRef<BusDialogComponent>
    ) { }
}

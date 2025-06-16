import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { SharedModule } from '../shared.module';
import { MaterialModule } from '../material.module';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'app-generic-list',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule
    ],
    templateUrl: './generic-list.component.html',
    styleUrls: ['./generic-list.component.scss']
})
export class GenericListComponent implements OnChanges {
    @Input() columns: string[] = [];

    @Input() data: any[] = [];

    @Input() totalElements = 0;

    @Input() pageIndex = 0;

    @Input() pageSize = 10;

    @Input() pageSizeOptions = [5, 10, 25];

    @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();


    @Output() action = new EventEmitter<{ row: any; action: string }>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.paginator) {
            this.paginator.firstPage();
        }
    }

    onPageChange(ev: PageEvent) {
        this.pageChange.emit({ pageIndex: ev.pageIndex, pageSize: ev.pageSize });
    }

    onAction(row: any, actionType: string) {
        this.action.emit({ row, action: actionType });
    }
}

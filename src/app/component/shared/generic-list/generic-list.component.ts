import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'app-generic-list',
    templateUrl: './generic-list.component.html',
    styleUrls: ['./generic-list.component.scss']
})
export class GenericListComponent {
    @Input() columns: { field: string; header: string }[] = [];
    @Input() data: any[] = [];
    @Input() totalElements = 0;
    @Input() pageSize = 20;
    @Input() pageIndex = 0;

    @Output() pageChange = new EventEmitter<number>();
    @Output() action = new EventEmitter<number>();
    @Output() refund = new EventEmitter<number>();

    get totalPages(): number {
        return Math.ceil(this.totalElements / this.pageSize);
    }

    changePage(page: number) {
        if (page < 0 || page >= this.totalPages) return;
        this.pageChange.emit(page);
    }
}

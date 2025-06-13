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
    /** Nombre de columnas en el orden que deben mostrarse */
    @Input() columns: string[] = [];

    /** Array de datos a mostrar */
    @Input() data: any[] = [];

    /** Total de elementos, para el paginador */
    @Input() totalElements = 0;

    /** Página actual (0-based) */
    @Input() pageIndex = 0;

    /** Nº de ítems por página */
    @Input() pageSize = 10;

    /** Opciones de tamaño de página */
    @Input() pageSizeOptions = [5, 10, 25];

    /** Evento disparado al cambiar de página */
    @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

    /** Evento disparado para acciones especiales (p.ej. botones de fila) */
    @Output() action = new EventEmitter<{ row: any; action: string }>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnChanges(changes: SimpleChanges) {
        // Si cambian los datos, resetear el paginador al inicio
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

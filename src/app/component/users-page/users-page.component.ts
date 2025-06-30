import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { UserService } from '../../services/user.service';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './dialogs/edit-user-dialog/edit-user-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { BulkUploadDialogComponent } from './dialogs/bulk-upload-dialog/bulk-upload-dialog.component';
import { UsuarioDto, TipoRol, FiltroBusquedaUsuarioDto } from '../../models';
import { SharedModule } from '../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [SharedModule, LoadingSpinnerComponent],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit {
  isLoading = false;
  columns: string[] = ['id', 'nombre', 'apellido', 'fechaNacimiento', 'email', 'documento', 'rol', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioDto>();
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  filterForm: FormGroup;
  bulkErrors: string[] = [];
  hasSearched = false;

  roles = Object.values(TipoRol) 
    .map(value => ({ value, viewValue: value }));
    
  estados = [
    { value: 'todos', viewValue: 'TODOS' },
    { value: 'activos', viewValue: 'ACTIVOS' },
    { value: 'inactivos', viewValue: 'INACTIVOS' }
  ];

  private paginator!: MatPaginator;
  private sort!: MatSort;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (mp) {
      this.paginator = mp;
      this.paginator.page.subscribe((event: PageEvent) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadUsers();
      });
    }
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (ms) {
      this.sort = ms; // mantenemos el sort solo para capturar eventos, sin aplicar orden local

      // Al cambiar el orden, recargar desde el backend con la dirección correcta
      this.sort.sortChange.subscribe((event: Sort) => {
        console.log('SortChange event', event);
        this.pageIndex = 0;
        this.loadUsers(event);
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private materialUtils: MaterialUtilsService
  ) {
    this.filterForm = this.fb.group({
      nombre: [''],
      apellido: [''],
      email: [''],
      documento: [''],
      rol: [null],
      estado: ['todos']
    });

    // Configurar acceso de datos para ordenamiento personalizado
    this.dataSource.sortingDataAccessor = (item: UsuarioDto, property: string): string | number => {
      const value: any = (item as any)[property];
      if (value === null || value === undefined) {
        return '';
      }
      if (property === 'fechaNacimiento') {
        return new Date(value).getTime();
      }
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      return value as string | number;
    };
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(sortEvent?: Sort): Promise<void> {
    // Solo mostrar spinner si no viene de un cambio de orden
    const isSortRequest = !!sortEvent;
    if (!isSortRequest) {
      this.isLoading = true;
    }
    this.hasSearched = true;
    const { nombre, apellido, email, documento, rol, estado } = this.filterForm.value;

    const filtro: FiltroBusquedaUsuarioDto = {
      nombre: nombre || undefined,
      apellido: apellido || undefined,
      email: email || undefined,
      documento: documento || undefined,
      roles: rol ? [rol] : undefined,
      activo: estado === 'todos' ? undefined : estado === 'activos'
    };
    
    let sortParam = 'nombre,asc';
    // Si recibimos evento, usarlo; si no, usar sort actual
    const activeField = sortEvent?.active || this.sort?.active;
    const direction = sortEvent?.direction || this.sort?.direction;
    if (activeField && direction) {
      sortParam = `${activeField},${direction.toUpperCase()}`;
    }

    console.log('Sort param enviado al backend:', sortParam);

    try {
      const page = await this.userService.getAll(filtro, this.pageIndex, this.pageSize, sortParam);
      this.dataSource.data = page.content;
      this.totalElements = page.page.totalElements;
    } catch (err) {
      console.error("Error loading users", err);
      this.materialUtils.showError('Error al cargar la lista de usuarios.');
    } finally {
      if (!isSortRequest) {
        this.isLoading = false;
      }
    }
  }

  onSearch() {
    this.pageIndex = 0;
    if(this.paginator) {
      this.paginator.firstPage();
    }
    this.loadUsers();
  }

  onClear() {
    this.filterForm.reset({ nombre: '', apellido: '', email: '', documento: '', rol: null, estado: 'todos' });
    this.onSearch();
  }

  add() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); 
      }
    });
  }

  edit(user: UsuarioDto) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { userId: user.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  remove(user: UsuarioDto) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de que desea eliminar al usuario ${user.nombre} ${user.apellido}?`
      }
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        try {
          await this.userService.delete(user.id);
          this.materialUtils.showSuccess('Usuario eliminado correctamente.');
          this.loadUsers();
        } catch (err: any) {
          this.materialUtils.showError(err.error?.message || 'Error al eliminar el usuario.');
        }
      }
    });
  }
  
  openBulkUpload() {
    const dialogRef = this.dialog.open(BulkUploadDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  getRoleChipClass(role: string): string {
    switch(role) {
      case 'ADMIN': return 'chip-admin';
      case 'VENDEDOR': return 'chip-vendedor';
      default: return 'chip-cliente';
    }
  }

  getRoleChipText(role: string): string {
    const roleLower = role.toLowerCase();
    return roleLower.charAt(0).toUpperCase() + roleLower.slice(1);
  }
}

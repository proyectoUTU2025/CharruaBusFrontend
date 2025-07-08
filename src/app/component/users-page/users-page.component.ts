import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

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
export class UsersPageComponent implements OnInit, AfterViewInit {
  isLoading = true;
  columns: string[] = ['id', 'nombre', 'apellido', 'fechaNacimiento', 'email', 'documento', 'rol', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioDto>();
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadUsers())
      )
      .subscribe();

    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading = true;
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

    const sortActive = this.sort?.active || 'nombre';
    const sortDirection = this.sort?.direction || 'asc';
    const sortParam = `${sortActive},${sortDirection}`;

    const pageIndex = this.paginator?.pageIndex || 0;
    const pageSize = this.paginator?.pageSize || 10;

    try {
      const page = await this.userService.getAll(filtro, pageIndex, pageSize, sortParam);
      this.dataSource.data = page.content;
      this.totalElements = page.page.totalElements;
    } catch (err) {
      console.error("Error loading users", err);
      this.materialUtils.showError('Error al cargar la lista de usuarios.');
      this.dataSource.data = [];
      this.totalElements = 0;
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    this.paginator.pageIndex = 0;
    this.loadUsers();
  }

  onClear() {
    this.filterForm.reset({ nombre: '', apellido: '', email: '', documento: '', rol: null, estado: 'todos' });
    this.paginator.pageIndex = 0;
    this.sort.active = 'nombre';
    this.sort.direction = 'asc';
    this.loadUsers();
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

  toggleUserStatus(user: UsuarioDto) {
    const action = user.activo ? 'desactivar' : 'activar';
    const actionPast = user.activo ? 'desactivado' : 'activado';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar ${action}`,
        message: `¿Está seguro de que desea ${action} al usuario ${user.nombre} ${user.apellido}?`
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        try {
          await this.userService.cambiarEstado(user.id);
          this.materialUtils.showSuccess(`Usuario ${actionPast} correctamente.`);
          this.loadUsers();
        } catch (err: any) {
          this.materialUtils.showError(err.error?.message || `Error al ${action} el usuario.`);
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

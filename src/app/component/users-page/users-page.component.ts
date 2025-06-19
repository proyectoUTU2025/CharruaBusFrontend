import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UsuarioDto, AltaUsuarioDto, FiltroBusquedaUsuarioDto, Page } from '../../models';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { UserService } from '../../services/user.service';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './dialogs/edit-user-dialog/edit-user-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { BulkUploadDialogComponent } from './dialogs/bulk-upload-dialog/bulk-upload-dialog.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AddUserDialogComponent,
    EditUserDialogComponent,
    ConfirmDialogComponent,
    BulkUploadDialogComponent,
    MatCardModule
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  usuarios: UsuarioDto[] = [];
  totalElements = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columns = [
    'id', 'nombre', 'apellido', 'email', 'documento',
    'tipoDocumento', 'rol', 'fechaNacimiento', 'activo', 'acciones'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      nombre: [''],
      apellido: [''],
      email: [''],
      documento: [''],
      rol: [''],
      activo: [null]
    });
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadUsers());
    this.loadUsers();
  }

  private loadUsers() {
    const rawFiltro = this.filterForm.value;
    const filtro: FiltroBusquedaUsuarioDto = {
      nombre: rawFiltro.nombre,
      apellido: rawFiltro.apellido,
      email: rawFiltro.email,
      documento: rawFiltro.documento,
      roles: rawFiltro.rol ? [rawFiltro.rol] : undefined,
      activo: rawFiltro.activo
    };
    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 5;
    this.userService.getAll(filtro, page, size)
      .then((resp: Page<UsuarioDto>) => {
        this.usuarios = resp.content;
        this.totalElements = resp.totalElements;
      })
      .catch(console.error);
  }

  onSearch() {
    this.paginator.firstPage();
    this.loadUsers();
  }

  onClear() {
    this.filterForm.reset({ nombre: '', apellido: '', email: '', documento: '', rol: '', activo: null });
    this.onSearch();
  }

  bulkErrors: string[] = [];

  openBulkUpload() {
    this.dialog.open(BulkUploadDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe((file: File | undefined) => {
        if (file) {
          this.userService.bulkUpload(file)
            .then((resp: BulkResponseDto) => {
              const errores = resp.results.filter((r: BulkLineResult) => !r.creado);
              this.bulkErrors = errores.length > 0
                ? errores.map((e: BulkLineResult) => `Fila ${e.fila}: ${e.mensaje}`)
                : ['Archivo procesado exitosamente sin errores.'];
              this.loadUsers();
            })
            .catch(console.error);
        }
      });
  }

  add() {
    this.dialog.open(AddUserDialogComponent, { width: '450px', maxHeight: '95vh' })
      .afterClosed()
      .subscribe((alta: AltaUsuarioDto) => {
        if (alta) {
          this.userService.create(alta)
            .then(() => this.onSearch())
            .catch(console.error);
        }
      });
  }

  edit(u: UsuarioDto) {
    this.dialog.open(EditUserDialogComponent, { width: '400px', data: u })
      .afterClosed()
      .subscribe((updated: UsuarioDto) => {
        if (updated) {
          this.userService.update(updated)
            .then(() => this.onSearch())
            .catch(console.error);
        }
      });
  }

  remove(u: UsuarioDto) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirmar eliminación', message: `¿Eliminar a ${u.nombre}?` }
    })
      .afterClosed()
      .subscribe(ok => {
        if (ok) {
          this.userService.delete(u.id)
            .then(() => this.onSearch())
            .catch(console.error);
        }
      });
  }
}

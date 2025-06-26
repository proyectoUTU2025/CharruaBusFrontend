import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { UsuarioDto, AltaUsuarioDto, FiltroBusquedaUsuarioDto, Page } from '../../models';
import { BulkResponseDto } from '../../models/bulk/bulk-response.dto';
import { BulkLineResult } from '../../models/bulk/bulk-line-result.dto';
import { UserService } from '../../services/user.service';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './dialogs/edit-user-dialog/edit-user-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { BulkUploadDialogComponent } from './dialogs/bulk-upload-dialog/bulk-upload-dialog.component';

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
    MatCardModule,
    AddUserDialogComponent,
    EditUserDialogComponent,
    ConfirmDialogComponent,
    BulkUploadDialogComponent
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<UsuarioDto>();
  totalElements = 0;
  pageIndex = 0;
  pageSize = 5;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columns = [
    'id', 'nombre', 'apellido', 'email', 'documento',
    'tipoDocumento', 'rol', 'fechaNacimiento', 'activo', 'acciones'
  ];
  bulkErrors: string[] = [];

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
    this.loadUsers();
  }

  private loadUsers() {
    const raw = this.filterForm.value;
    const filtro: FiltroBusquedaUsuarioDto = {
      nombre: raw.nombre,
      apellido: raw.apellido,
      email: raw.email,
      documento: raw.documento,
      roles: raw.rol ? [raw.rol] : undefined,
      activo: raw.activo
    };

    this.userService.getAll(filtro, this.pageIndex, this.pageSize)
      .then((res: Page<UsuarioDto>) => {
        this.dataSource.data = res.content;
        this.totalElements    = res.page.totalElements;
        this.pageIndex        = res.page.number;
        this.pageSize         = res.page.size;
      })
      .catch(console.error);
  }

  onSearch() {
    this.pageIndex = 0;
    this.loadUsers();
  }

  onClear() {
    this.filterForm.reset({ nombre: '', apellido: '', email: '', documento: '', rol: '', activo: null });
    this.onSearch();
  }

  onPaginate(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize  = e.pageSize;
    this.loadUsers();
  }

  openBulkUpload() {
    this.dialog.open(BulkUploadDialogComponent, { width: '600px' })
      .afterClosed()
      .subscribe((file: File | undefined) => {
        if (!file) return;
        this.userService.bulkUpload(file)
          .then((resp: BulkResponseDto) => {
            const errs = resp.results.filter((r: BulkLineResult) => !r.creado);
            this.bulkErrors = errs.length
              ? errs.map(e => `Fila ${e.fila}: ${e.mensaje}`)
              : ['Archivo procesado exitosamente sin errores.'];
            this.loadUsers();
          })
          .catch(console.error);
      });
  }

  add() {
    this.dialog.open(AddUserDialogComponent, {
      width: '450px', maxHeight: '95vh'
    })
    .afterClosed()
    .subscribe((alta: AltaUsuarioDto) => {
      if (alta) this.userService.create(alta)
        .then(() => this.onSearch())
        .catch(console.error);
    });
  }

  edit(u: UsuarioDto) {
    this.dialog.open(EditUserDialogComponent, {
      width: '400px', data: u
    })
    .afterClosed()
    .subscribe((updated: UsuarioDto) => {
      if (updated) this.userService.update(updated)
        .then(() => this.onSearch())
        .catch(console.error);
    });
  }

  remove(u: UsuarioDto) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirmar eliminación', message: `¿Eliminar a ${u.nombre}?` }
    })
    .afterClosed()
    .subscribe(ok => {
      if (ok) this.userService.delete(u.id)
        .then(() => this.onSearch())
        .catch(console.error);
    });
  }
}

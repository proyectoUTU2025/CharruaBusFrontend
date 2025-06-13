import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { GenericListComponent } from '../../../shared/generic-list/generic-list.component';
import {
  AddUserDialogComponent
} from './dialogs/add-user-dialog/add-user-dialog.component';
import {
  EditUserDialogComponent
} from './dialogs/edit-user-dialog/edit-user-dialog.component';
import {
  ConfirmDialogComponent
} from './dialogs/confirm-dialog/confirm-dialog.component';
import {
  BulkUploadDialogComponent
} from './dialogs/bulk-upload-dialog/bulk-upload-dialog.component';
import { UserService } from '../../../services/user.service';
import {
  AltaUsuarioDto,
  FiltroBusquedaUsuarioDto,
  Page,
  UsuarioDto
} from '../../../models';
import {
  BulkResponseDto
} from '../../../models/bulk/bulk-response.dto';
import {
  BulkLineResult
} from '../../../models/bulk/bulk-line-result.dto';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    GenericListComponent,
    AddUserDialogComponent,
    EditUserDialogComponent,
    ConfirmDialogComponent,
    BulkUploadDialogComponent
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit {
  filterForm: FormGroup;
  usuarios: UsuarioDto[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 5;
  /** Defino solo las columnas de datos; la de acciones la manejo aparte */
  columns = [
    'id',
    'nombre',
    'apellido',
    'email',
    'documento',
    'tipoDocumento',
    'rol',
    'fechaNacimiento',
    'activo'
  ];
  bulkErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService
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

  ngOnInit() {
    this.loadUsers(this.pageIndex, this.pageSize);
  }

  loadUsers(pageIndex: number, pageSize: number) {
    const raw = this.filterForm.value;
    const filtro: FiltroBusquedaUsuarioDto = {
      nombre: raw.nombre,
      apellido: raw.apellido,
      email: raw.email,
      documento: raw.documento,
      roles: raw.rol ? [raw.rol] : undefined,
      activo: raw.activo
    };

    this.userService.getAll(filtro, pageIndex, pageSize)
      .then((resp: Page<UsuarioDto>) => {
        this.usuarios = resp.content;
        this.totalElements = resp.totalElements;
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
      })
      .catch(console.error);
  }

  onSearch() {
    this.pageIndex = 0;
    this.loadUsers(0, this.pageSize);
  }

  onClear() {
    this.filterForm.reset({
      nombre: '', apellido: '', email: '', documento: '', rol: '', activo: null
    });
    this.onSearch();
  }

  /** Acciones externas al listado */
  add() {
    // ...
  }
  edit(u: UsuarioDto) {
    // ...
  }
  remove(u: UsuarioDto) {
    // ...
  }
  openBulkUpload() {
    // ...
  }
}

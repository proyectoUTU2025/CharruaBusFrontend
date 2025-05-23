import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../../services/user.service';
import { User } from '../../models/users';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './dialogs/edit-user-dialog/edit-user-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { BulkUploadDialogComponent } from './dialogs/bulk-upload-dialog/bulk-upload-dialog.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    AddUserDialogComponent,
    EditUserDialogComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit {
  columns = [
    'id',
    'nombre',
    'correo',
    'documento',
    'rol',
    'fechaRegistro',
    'ultimoAcceso',
    'activo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<User>();
  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    this.loadUsers();
  }
  private loadUsers() {
    this.userService.getAll().subscribe(users => {
      this.dataSource.data = users;
    });
  }
  openBulkUpload() {
    this.dialog.open(BulkUploadDialogComponent, { width: '600px' });
  } 
  
  add() {
    this.dialog.open(AddUserDialogComponent, { width: '450px', maxHeight: '95vh' })
      .afterClosed()
      .subscribe((user: User) => {
        if (user) {
          this.userService.create(user).subscribe(() => this.loadUsers());
        }
      });
  }
  edit(user: User) {
    this.dialog.open(EditUserDialogComponent, { width: '400px', maxHeight: '100vh', data: user })
      .afterClosed()
      .subscribe((updated: User) => {
        if (updated) {
          this.userService.update(updated).subscribe(() => this.loadUsers());
        }
      });
  }
  remove(user: User) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirmar eliminación', message: `¿Eliminar a ${user.nombre}?` }
    })
      .afterClosed()
      .subscribe(ok => {
        if (ok) {
          this.userService.delete(user.id).subscribe(() => this.loadUsers());
        }
      });
  }
}

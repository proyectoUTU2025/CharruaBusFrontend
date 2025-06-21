import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { EditarUsuarioRequestDto } from '../../../../models/users/editar-usuario-request.dto';
import { TipoCategoriaCliente } from '../../../../models/users/tipo-categoria-cliente.enum';
import { TipoDocumento } from '../../../../models/users/tipo-documento.enum';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-edit-user-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  tiposDocumento = Object.values(TipoDocumento).map(value => ({
    value,
    label: value.charAt(0) + value.slice(1).toLowerCase()
  }));

  situacionesLaborales = Object.values(TipoCategoriaCliente).map(v => ({
    value: v,
    label: v.charAt(0) + v.slice(1).toLowerCase()
  }));

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<EditUserDialogComponent>);

  ngOnInit(): void {
    const id = this.auth.userId!;
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      documento: ['', Validators.required],
      situacionLaboral: ['']
    });

    this.loading = true;
    this.userService.getById(id)
      .then(user => {
        this.form.patchValue({
          nombre: user.nombre,
          apellido: user.apellido,
          fechaNacimiento: user.fechaNacimiento,
          tipoDocumento: user.tipoDocumento,
          documento: user.documento,
          situacionLaboral: (user as any).situacionLaboral || ''
        });
      })
      .catch(() => this.error = 'Error al cargar datos')
      .finally(() => this.loading = false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const id = this.auth.userId!;
    const dto: EditarUsuarioRequestDto = this.form.value;
    this.userService.editProfile(id, dto)
      .then(() => this.dialogRef.close(true))
      .catch(err => this.error = err.error?.message || 'Error al guardar')
      .finally(() => this.loading = false);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

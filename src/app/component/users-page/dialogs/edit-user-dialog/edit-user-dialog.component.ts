import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
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
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioDto } from '../../../../models/users/usuario.dto.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  user!: UsuarioDto;
  private userId: number;
  maxDate: Date = new Date();

  noFutureDate = (d: Date | null): boolean => {
    return (d ?? this.maxDate) <= this.maxDate;
  };

  private static futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valueDate = new Date(control.value);
    return valueDate > new Date() ? { futureDate: true } : null;
  }

  tiposDocumento = Object.values(TipoDocumento).map(value => ({
    value,
    label: value.charAt(0) + value.slice(1).toLowerCase()
  }));

  situacionesLaborales = Object.values(TipoCategoriaCliente).map(v => ({
    value: v,
    label: v.charAt(0) + v.slice(1).toLowerCase()
  }));

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { userId: number },
    private snackBar: MatSnackBar
  ) {
    this.userId = data.userId;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, EditUserDialogComponent.futureDateValidator]],
      tipoDocumento: ['', Validators.required],
      documento: ['', Validators.required],
      situacionLaboral: ['']
    });

    this.loading = true;
    this.userService.getById(this.userId)
      .then(fullUser => {
        this.form.patchValue({
          nombre: fullUser.nombre,
          apellido: fullUser.apellido,
          fechaNacimiento: new Date(fullUser.fechaNacimiento),
          tipoDocumento: fullUser.tipoDocumento,
          documento: fullUser.documento,
          situacionLaboral: (fullUser as any).situacionLaboral || ''
        });
        this.user = fullUser;
      })
      .catch(() => this.error = 'Error al cargar los datos del usuario')
      .finally(() => this.loading = false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    
    const formValue = this.form.value;
    const dto: EditarUsuarioRequestDto = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      fechaNacimiento: new Date(formValue.fechaNacimiento).toISOString().slice(0,10),
      tipoDocumento: formValue.tipoDocumento,
      documento: formValue.documento
    };

    if (this.user.rol === 'CLIENTE' && formValue.situacionLaboral) {
      dto.situacionLaboral = formValue.situacionLaboral;
    }

    this.userService.editProfile(this.userId, dto)
      .then(() => this.dialogRef.close(true))
      .catch(err => this.error = err.error?.message || 'Error al guardar')
      .finally(() => this.loading = false);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { ImmediateErrorStateMatcher } from '../../../../shared/immediate-error-state-matcher';

function cedulaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const cedula = control.value.toString().replace(/[.-]/g, '');
  if (cedula.length > 0 && cedula.length < 8) {
    return { invalidCedulaLength: true };
  }

  if (!/^\d{8}$/.test(cedula)) {
    return null; // No validar si no tiene 8 dígitos
  }

  const digitos = cedula.substring(0, 7).split('').map(Number);
  const digitoVerificador = parseInt(cedula.substring(7, 8), 10);

  const factores = [2, 9, 8, 7, 6, 3, 4];
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[i] * factores[i];
  }

  const digitoCalculado = (10 - (suma % 10)) % 10;

  return digitoCalculado === digitoVerificador ? null : { invalidCedula: { digitoCalculado } };
}

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
export class EditUserDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  user!: UsuarioDto;
  private userId: number;
  maxDate: Date;
  private subs = new Subscription();
  documentoMatcher = new ImmediateErrorStateMatcher();
  digitoVerificadorSugerido: number | null = null;

  noFutureDate = (d: Date | null): boolean => {
    return (d ?? this.maxDate) <= this.maxDate;
  };

  private static futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valueDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return valueDate >= today ? { futureDate: true } : null;
  }

  tiposDocumento = Object.values(TipoDocumento).map(value => ({
    value,
    label: value.toUpperCase()
  }));

  situacionesLaborales = Object.values(TipoCategoriaCliente).map(v => ({
    value: v,
    label: v.toUpperCase()
  }));

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { userId: number },
    private snackBar: MatSnackBar
  ) {
    this.userId = data.userId;
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.maxDate.setHours(0, 0, 0, 0);
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

    this.subs.add(
      this.form.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
        const documentoControl = this.form.get('documento');
        documentoControl?.setValue('', { emitEvent: false });
        documentoControl?.clearValidators();
        documentoControl?.setErrors(null);

        if (tipo === 'CEDULA') {
          documentoControl?.setValidators([Validators.required, cedulaValidator]);
        } else {
          documentoControl?.setValidators([Validators.required]);
        }
        documentoControl?.updateValueAndValidity();
      })
    );

    this.subs.add(
      this.form.get('documento')?.valueChanges.subscribe((value) => {
        const documentoControl = this.form.get('documento');
        if (!documentoControl) return;

        const tipo = this.form.get('tipoDocumento')?.value;

        if (tipo === 'CEDULA') {
          if (value) {
            const soloNumeros = value.replace(/\D/g, '');
            if (value !== soloNumeros) {
              documentoControl.setValue(soloNumeros, { emitEvent: false });
            }
          }

          const errors = documentoControl.errors;
          if (errors && errors['invalidCedula']) {
            this.digitoVerificadorSugerido = errors['invalidCedula'].digitoCalculado;
          } else {
            this.digitoVerificadorSugerido = null;
          }
        } else if (tipo === 'PASAPORTE') {
          if (!value) {
            documentoControl.setErrors({ required: true });
            return;
          }

          let formatted = value.replace(/[^A-Za-z0-9]/g, '');
          if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(/[^0-9]/g, '');
          }
          if (formatted.length > 8) {
            formatted = formatted.substring(0, 8);
          }

          if (value !== formatted) {
            documentoControl.setValue(formatted, { emitEvent: false });
          }

          let errors: ValidationErrors | null = null;
          const lettersCount = formatted.replace(/[0-9]/g, '').length;
          const pasaporteRegex = /^[A-Z][0-9]{7}$/;

          if (formatted.length === 0) {
            errors = { required: true };
          } else if (formatted.length < 8) {
            if (lettersCount === 0) {
              errors = { pasaporteNeedsLetter: true };
            } else if (lettersCount > 1) {
              errors = { pasaporteTooManyLetters: true };
            } else if (!/^[A-Z]/.test(formatted)) {
              errors = { pasaporteMustStartWithLetter: true };
            } else {
              errors = { pasaporteInvalidLength: true };
            }
          } else {
            if (!pasaporteRegex.test(formatted)) {
              if (lettersCount === 0) {
                errors = { pasaporteNeedsLetter: true };
              } else if (lettersCount > 1) {
                errors = { pasaporteTooManyLetters: true };
              } else if (!/^[A-Z]/.test(formatted)) {
                errors = { pasaporteMustStartWithLetter: true };
              } else {
                errors = { pasaporteInvalidFormat: true };
              }
            }
          }
          documentoControl.setErrors(errors);
        }
      })
    );

    this.loading = true;
    this.userService.getById(this.userId)
      .then(fullUser => {
        this.form.patchValue({
          nombre: fullUser.nombre,
          apellido: fullUser.apellido,
          fechaNacimiento: new Date(fullUser.fechaNacimiento + 'T00:00:00'),
          tipoDocumento: fullUser.tipoDocumento,
          documento: fullUser.documento,
          situacionLaboral: (fullUser as any).situacionLaboral || ''
        }, { emitEvent: false });
        this.user = fullUser;
      })
      .catch(() => this.error = 'Error al cargar los datos del usuario')
      .finally(() => this.loading = false);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get isTipoCedula(): boolean {
    return this.form.get('tipoDocumento')?.value === 'CEDULA';
  }

  get isTipoPasaporte(): boolean {
    return this.form.get('tipoDocumento')?.value === 'PASAPORTE';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    
    const formValue = this.form.value;
    const fechaNacimiento = new Date(formValue.fechaNacimiento);
    const dto: EditarUsuarioRequestDto = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      fechaNacimiento: new Date(fechaNacimiento.getTime() - (fechaNacimiento.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 10),
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

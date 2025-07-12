import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, ErrorStateMatcher } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TipoDocumento, TipoRol } from '../../../../models/users';
import { UserService } from '../../../../services/user.service';
import { AltaUsuarioDto } from '../../../../models';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';
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
    return null; 
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

export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  return password && confirmPassword && password.value !== confirmPassword.value 
    ? { passwordsNotMatching: true } 
    : null;
};

export class PasswordsMatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const hasMismatchError = control?.parent?.hasError('passwordsNotMatching');
    const isDirty = !!control?.dirty;
    
    return !!(hasMismatchError && isDirty || (hasMismatchError && isSubmitted));
  }
}

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  tiposDocumento = Object.values(TipoDocumento).map(value => ({ value, viewValue: value.toUpperCase() }));
  roles = Object.values(TipoRol)
    .filter(rol => rol !== TipoRol.CLIENTE) 
    .map(value => ({ value, viewValue: value }));
  loading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  submitted = false;
  matcher = new PasswordsMatchErrorStateMatcher();
  documentoMatcher = new ImmediateErrorStateMatcher();
  private subs = new Subscription();
  digitoVerificadorSugerido: number | null = null;
  maxDate: Date;
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

  passwordValidationStatus = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService,
    private materialUtils: MaterialUtilsService
  ) {
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.maxDate.setHours(0, 0, 0, 0);
    this.form = this.fb.group({
      email:            ['', [Validators.required, Validators.email]],
      password:         ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)]],
      confirmPassword:  ['', Validators.required],
      nombre:           ['', Validators.required],
      apellido:         ['', Validators.required],
      documento:        ['', Validators.required],
      tipoDocumento:    ['', Validators.required],
      rol:              ['', Validators.required],
      fechaNacimiento:  ['', [Validators.required, AddUserDialogComponent.futureDateValidator]]
    }, { validators: passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.subs.add(this.form.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordValidationStatus(value || '');
    }));

    this.subs.add(
      this.form.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
        const documentoControl = this.form.get('documento');
        documentoControl?.setValue('');
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

  updatePasswordValidationStatus(password: string): void {
    this.passwordValidationStatus.minLength = password.length >= 8;
    this.passwordValidationStatus.hasUppercase = /[A-Z]/.test(password);
    this.passwordValidationStatus.hasLowercase = /[a-z]/.test(password);
    this.passwordValidationStatus.hasNumber = /[0-9]/.test(password);
    this.passwordValidationStatus.hasSpecialChar = /[!@#$%^&*]/.test(password);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();
    const fechaNacimiento = new Date(raw.fechaNacimiento);
    const dto: AltaUsuarioDto = {
      email: raw.email,
      password: raw.password,
      nombre: raw.nombre,
      apellido: raw.apellido,
      documento: raw.documento,
      tipoDocumento: raw.tipoDocumento,
      rol: raw.rol,
      fechaNacimiento: new Date(fechaNacimiento.getTime() - (fechaNacimiento.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 10)
    };

    this.userService.create(dto)
      .then(() => {
        this.materialUtils.showSuccess('Usuario creado correctamente');
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.error = err.error?.message || 'Error al crear el usuario.';
      })
      .finally(() => (this.loading = false));
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
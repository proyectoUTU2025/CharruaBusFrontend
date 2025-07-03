import { Component, OnInit } from '@angular/core';
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
export class AddUserDialogComponent implements OnInit {
  form: FormGroup;
  tiposDocumento = Object.values(TipoDocumento).map(value => ({ value, viewValue: value.toUpperCase() }));
  roles = Object.values(TipoRol)
    .filter(rol => rol !== TipoRol.CLIENTE) // Excluir CLIENTE
    .map(value => ({ value, viewValue: value }));
  loading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  submitted = false;
  matcher = new PasswordsMatchErrorStateMatcher();
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
    this.form.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordValidationStatus(value || '');
    });
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
    const dto: AltaUsuarioDto = {
      email: raw.email,
      password: raw.password,
      nombre: raw.nombre,
      apellido: raw.apellido,
      documento: raw.documento,
      tipoDocumento: raw.tipoDocumento,
      rol: raw.rol,
      fechaNacimiento: new Date(raw.fechaNacimiento).toISOString().slice(0, 10)
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
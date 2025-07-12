import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, ErrorStateMatcher } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ImmediateErrorStateMatcher } from '../../shared/immediate-error-state-matcher';


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
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  error: string | null = null;
  today: Date;
  yesterday: Date;
  matcher = new PasswordsMatchErrorStateMatcher();
  documentoMatcher = new ImmediateErrorStateMatcher();
  private subs = new Subscription();
  digitoVerificadorSugerido: number | null = null;

  passwordValidationStatus = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  tiposDocumento = ['CEDULA', 'PASAPORTE', 'OTRO'];
  situacionesLaborales = ['ESTUDIANTE', 'JUBILADO', 'OTRO'];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
    
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
    this.yesterday.setHours(0, 0, 0, 0);

    this.signupForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, (control: AbstractControl) => {
        const date = new Date(control.value);
        return date >= this.today ? { futureDate: true } : null;
      }]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/)
        ]
      ],
      confirmPassword: ['', Validators.required],
      situacionLaboral: ['', Validators.required]
    }, { validators: passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.subs.add(this.signupForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordValidationStatus(value || '');
    }));

    this.subs.add(
      this.signupForm.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
        const documentoControl = this.signupForm.get('documento');
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
      this.signupForm.get('documento')?.valueChanges.subscribe((value) => {
        const documentoControl = this.signupForm.get('documento');
        if (!documentoControl) return;

        const tipo = this.signupForm.get('tipoDocumento')?.value;

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

  updatePasswordValidationStatus(password: string): void {
    this.passwordValidationStatus.minLength = password.length >= 8;
    this.passwordValidationStatus.hasUppercase = /[A-Z]/.test(password);
    this.passwordValidationStatus.hasLowercase = /[a-z]/.test(password);
    this.passwordValidationStatus.hasNumber = /[0-9]/.test(password);
    this.passwordValidationStatus.hasSpecialChar = /[!@#$%^&*]/.test(password);
  }

  get isTipoCedula(): boolean {
    return this.signupForm.get('tipoDocumento')?.value === 'CEDULA';
  }

  get isTipoPasaporte(): boolean {
    return this.signupForm.get('tipoDocumento')?.value === 'PASAPORTE';
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;
    try {
      const formValue = { ...this.signupForm.getRawValue() };

      const date = new Date(formValue.fechaNacimiento);
      formValue.fechaNacimiento = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 10);

      await this.authService.registrarCliente(formValue);
      this.router.navigate(['/verificar-codigo'], { state: { email: this.signupForm.value.email } });
    } catch (error: HttpErrorResponse | any) {
      if (error?.error?.message) {
        this.error = error.error.message;
      } else if (typeof error?.error === 'string') {
        this.error = error.error;
      } else if (error?.message) {
        this.error = error.message;
      } else {
        this.error = 'Error al registrar. Verificá los datos.';
      }

    }
  }
}

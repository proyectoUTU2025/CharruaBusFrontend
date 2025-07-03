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

  passwordValidationStatus = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  tiposDocumento = ['CEDULA', 'OTRO', 'PASAPORTE'];
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
    this.signupForm.get('password')?.valueChanges.subscribe(value => {
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



  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;
    try {
      await this.authService.registrarCliente(this.signupForm.value);
      this.router.navigate(['/verificar-codigo'], { state: { email: this.signupForm.value.email } });
    } catch (error: HttpErrorResponse | any) {
      debugger;
      console.error('Error al registrar usuario:', error);
          
      // Extraer mensaje específico del backend
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

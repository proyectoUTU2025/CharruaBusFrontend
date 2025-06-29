import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { ResetPasswordRequestDto } from '../../models/auth/reset-password-request.dto';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (password?.pristine || confirmPassword?.pristine) {
    return null;
  }
  
  return password && confirmPassword && password.value !== confirmPassword.value 
    ? { passwordsMismatch: true }
    : null;
}

class PasswordsMatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && (control.dirty || control.touched) && (control.parent?.errors?.['passwordsMismatch'] || isSubmitted));
  }
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordsMatcher = new PasswordsMatchErrorStateMatcher();

  private email: string = '';
  private code: string = '';

  passwordValidationStatus = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private materialUtils: MaterialUtilsService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'];
    this.code = navigation?.extras?.state?.['code'];

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatchValidator });
  }

  ngOnInit() {
    if (!this.email || !this.code) {
      console.warn('No se proporcionó email o código. Redirigiendo a /login');
      this.router.navigate(['/forgot-password']);
      return;
    }
    // Limpiamos el estado para que no persista en el historial del navegador
    this.location.replaceState(this.router.url.split('?')[0]);

    this.form.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordValidationStatus(value);
    });
  }

  private passwordValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const isValid = value.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
        return isValid ? null : { passwordStrength: true };
    };
  }

  updatePasswordValidationStatus(password: string): void {
    this.passwordValidationStatus.length = password.length >= 8;
    this.passwordValidationStatus.uppercase = /[A-Z]/.test(password);
    this.passwordValidationStatus.lowercase = /[a-z]/.test(password);
    this.passwordValidationStatus.number = /[0-9]/.test(password);
    this.passwordValidationStatus.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;
    const { newPassword, confirmPassword } = this.form.value;

    try {
        const payload: ResetPasswordRequestDto = {
          email: this.email,
          verificationCode: this.code,
          newPassword,
          confirmPassword,
        }
        const response = await this.auth.resetPassword(payload);
        this.materialUtils.showSuccess(response.message);
        this.router.navigate(['/login']);
    } catch (err: any) {
        this.error = err.error?.message || 'Ocurrió un error al cambiar la contraseña.';
    } finally {
        this.loading = false;
    }
  }
}

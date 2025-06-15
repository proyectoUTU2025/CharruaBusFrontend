import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  hidePassword = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loginService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.error = null;

    const { email, password } = this.loginForm.value;
    try {
      await this.loginService.login(email, password);
      this.router.navigate(['/']);
    } catch {
      this.error = 'Credenciales inválidas';
    }
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToSignup(): void {
    this.router.navigate(['/registro']);
  }
}

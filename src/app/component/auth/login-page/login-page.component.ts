import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule
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
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    try {
      await this.loginService.login(this.loginForm.value);
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

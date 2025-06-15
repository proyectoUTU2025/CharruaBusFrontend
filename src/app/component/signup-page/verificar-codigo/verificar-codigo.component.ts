import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './verificar-codigo.component.html',
  styleUrls: ['./verificar-codigo.component.scss']
})
export class VerificarCodigoComponent {
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.error = null;
    const { email, verificationCode } = this.form.value;

    try {
      await this.authService.verifyEmail(email, verificationCode);
      this.router.navigate(['/login']);
    } catch {
      this.error = 'Código inválido o expirado';
    }
  }
}

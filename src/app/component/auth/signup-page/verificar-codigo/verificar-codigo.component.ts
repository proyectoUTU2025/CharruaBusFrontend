import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../../services/login.service';
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

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    try {
      await this.loginService.validateCode(this.form.value.email, this.form.value.code);
      this.router.navigate(['/login']);
    } catch {
      this.error = 'Código inválido';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {
  signupForm: FormGroup;
  hidePassword = true;
  error: string | null = null;

  tiposDocumento = ['CEDULA', 'OTRO', 'PASAPORTE'];
  situacionesLaborales = ['ESTUDIANTE', 'JUBILADO', 'OTRO'];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/)
        ]
      ],
      situacionLaboral: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;
    try {
      await this.authService.registrarCliente(this.signupForm.value);
      this.router.navigate(['/verificar-codigo']);
    } catch (error) {
      this.error = 'Error al registrar. Verificá los datos.';
    }
  }
}

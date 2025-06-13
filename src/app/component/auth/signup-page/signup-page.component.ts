import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule
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

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/
        )
      ]],
      situacionLaboral: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;
    try {
      await this.loginService.registrarCliente(this.signupForm.value);
      this.router.navigate(['/verificar-codigo']);
    } catch {
      this.error = 'Error al registrar. Verificá los datos.';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    form: FormGroup;
    loading = false;
    message: string | null = null;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading = true;
        this.error = this.message = null;

        const email = this.form.value.email;
        this.auth.requestPasswordReset(email)
            .then(() => {
                this.message = 'Si el correo existe, recibirá un código para continuar.';

                this.router.navigate(['/verify-reset']);
            })
            .catch(err => {
                this.error = err.error?.message || 'Error al solicitar el código';
            })
            .finally(() => {
                this.loading = false;
            });
    }
}

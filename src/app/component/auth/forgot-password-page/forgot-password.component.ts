import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../../services/login.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    form: FormGroup;
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.isSubmitting = true;
        this.loginService
            .forgotPassword(this.form.value.email)
            .then(() => {
                this.successMessage = 'Código enviado a tu email.';
                this.errorMessage = '';
            })
            .catch(err => {
                this.errorMessage = err.error?.message || 'Error al enviar el código';
                this.successMessage = '';
            })
            .finally(() => this.isSubmitting = false);
    }
}

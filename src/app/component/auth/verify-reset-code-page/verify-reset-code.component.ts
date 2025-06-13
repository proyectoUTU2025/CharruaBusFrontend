import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
    selector: 'app-verify-reset-code',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule,
        RouterModule
    ],
    templateUrl: './verify-reset-code.component.html',
    styleUrls: ['./verify-reset-code.component.scss']
})
export class VerifyResetCodeComponent {
    form: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService,
        private router: Router
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            verificationCode: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.isSubmitting = true;
        const { email, verificationCode } = this.form.value;
        this.loginService.verifyResetCode(email, verificationCode)
            .then(() =>
                this.router.navigate(
                    ['/restablecer-contrasenia'],
                    { queryParams: { email, token: verificationCode } }
                )
            )
            .catch(err => {
                this.errorMessage = err.error?.message || 'Código inválido o expirado';
            })
            .finally(() => this.isSubmitting = false);
    }
}

import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        SharedModule,
        MaterialModule,
        RouterModule
    ],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
    form: FormGroup;
    isSubmitting = false;
    errorMessage = '';
    successMessage = '';
    private email: string;
    private token: string;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private loginService: LoginService,
        private router: Router
    ) {
        const { email, token } = this.route.snapshot.queryParams;
        this.email = email;
        this.token = token;
        this.form = this.fb.group(
            {
                newPassword: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.matchPasswords }
        );
    }

    private matchPasswords(group: FormGroup): ValidationErrors | null {
        const np = group.get('newPassword')!.value;
        const cp = group.get('confirmPassword')!.value;
        return np === cp ? null : { passwordsMismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.isSubmitting = true;
        const { newPassword, confirmPassword } = this.form.value;
        this.loginService
            .resetPassword(this.email, this.token, newPassword, confirmPassword)
            .then(() => {
                this.successMessage = 'Contraseña actualizada. Ya puedes iniciar sesión.';
                this.errorMessage = '';
            })
            .catch(err => {
                this.errorMessage = err.error?.message || 'Error al restablecer la contraseña';
                this.successMessage = '';
            })
            .finally(() => this.isSubmitting = false);
    }
}

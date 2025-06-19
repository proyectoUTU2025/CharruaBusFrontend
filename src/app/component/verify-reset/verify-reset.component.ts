import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-verify-reset',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './verify-reset.component.html',
    styleUrls: ['./verify-reset.component.scss']
})
export class VerifyResetComponent {
    form: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(
        fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.form = fb.group({
            email: ['', [Validators.required, Validators.email]],
            verificationCode: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.loading = true;
        this.error = null;

        const { email, verificationCode } = this.form.value;
        this.auth.verifyResetCode(email, verificationCode)
            .then(() => {

                this.router.navigate(['/reset-password'], {
                    queryParams: { email, code: verificationCode }
                });
            })
            .catch(err => {
                this.error = err.error?.message || 'Código inválido';
            })
            .finally(() => {
                this.loading = false;
            });
    }
}

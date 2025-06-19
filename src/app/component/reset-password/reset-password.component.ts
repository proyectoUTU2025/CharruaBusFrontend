import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    error: string | null = null;
    success: string | null = null;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        const { email, code } = this.route.snapshot.queryParams;
        this.form = this.fb.group({
            email: [email || '', [Validators.required, Validators.email]],
            verificationCode: [code || '', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.matchPasswords });
    }

    private matchPasswords(group: FormGroup): ValidationErrors | null {
        const np = group.get('newPassword')!.value;
        const cp = group.get('confirmPassword')!.value;
        return np === cp ? null : { passwordsMismatch: true };
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.loading = true;
        this.error = this.success = null;

        const { email, verificationCode, newPassword, confirmPassword } = this.form.value;

        this.auth.resetPassword(email, verificationCode, newPassword, confirmPassword)
            .then(() => {
                this.success = 'Contraseña cambiada. Ahora puede iniciar sesión.';
                setTimeout(() => this.router.navigate(['/login']), 1500);
            })
            .catch(err => {
                this.error = err.error?.message || 'Error al restablecer contraseña';
            })
            .finally(() => {
                this.loading = false;
            });
    }
}

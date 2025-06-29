import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialUtilsService } from '../../shared/material-utils.service';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    form: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private materialUtils: MaterialUtilsService
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
        this.error = null;

        const email = this.form.value.email;
        this.auth.requestPasswordReset(email)
            .then((response) => {
                this.materialUtils.showSuccess(response.message);
                this.router.navigate(['/verify-reset'], { state: { email } });
            })
            .catch(err => {
                this.error = err.error?.message || 'Error al solicitar el código';
            })
            .finally(() => {
                this.loading = false;
            });
    }
}

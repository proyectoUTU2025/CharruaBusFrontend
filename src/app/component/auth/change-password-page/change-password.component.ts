import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
    standalone: true,
    selector: 'app-change-password',
    imports: [SharedModule, MaterialModule],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    form!: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group(
            {
                currentPassword: ['', Validators.required],
                newPassword: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.passwordsMatchValidator }
        );
    }

    private passwordsMatchValidator(
        group: FormGroup
    ): ValidationErrors | null {
        const np = group.get('newPassword')!.value;
        const cp = group.get('confirmPassword')!.value;
        return np === cp ? null : { passwordsMismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.isSubmitting = true;
        const { currentPassword, newPassword, confirmPassword } = this.form.value;
        this.userService
            .changePassword(currentPassword, newPassword, confirmPassword)
            .then(() => this.router.navigate(['/profile']))
            .catch(err => {
                this.errorMessage = err.error?.message || 'Error al cambiar la contraseña';
            })
            .finally(() => (this.isSubmitting = false));
    }

    onCancel(): void {
        this.router.navigate(['/profile']);
    }
}

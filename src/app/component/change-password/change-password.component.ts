import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    FormGroup,
    ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ChangePasswordRequestDto } from '../../models/auth/change-password-request.dto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'app-change-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
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

    private passwordsMatchValidator(group: FormGroup): ValidationErrors | null {
        const np = group.get('newPassword')!.value;
        const cp = group.get('confirmPassword')!.value;
        return np === cp ? null : { passwordsMismatch: true };
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) return;

        this.isSubmitting = true;
        this.errorMessage = '';

        const dto: ChangePasswordRequestDto = {
            currentPassword: this.form.value.currentPassword,
            newPassword: this.form.value.newPassword,
            confirmPassword: this.form.value.confirmPassword
        };

        try {

            await this.userService.changePassword(dto);

            this.router.navigate(['/perfil']);
        } catch (err: any) {
            this.errorMessage =
                err.error?.message || 'Error al cambiar la contraseña';
        } finally {
            this.isSubmitting = false;
        }
    }

    onCancel(): void {
        this.router.navigate(['/perfil']);
    }
}

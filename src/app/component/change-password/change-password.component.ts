import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    FormGroup,
    ValidationErrors,
    AbstractControl,
    FormControl,
    NgForm,
    FormGroupDirective
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ChangePasswordRequestDto } from '../../models/auth/change-password-request.dto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialUtilsService } from '../../shared/material-utils.service';
import { MatDividerModule } from '@angular/material/divider';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
  
    if (password?.pristine || confirmPassword?.pristine) {
      return null;
    }
    
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordsMismatch: true }
      : null;
}

function newPasswordSameAsCurrentValidator(control: AbstractControl): ValidationErrors | null {
  const currentPassword = control.get('currentPassword');
  const newPassword = control.get('newPassword');

  if (currentPassword?.pristine || newPassword?.pristine) {
    return null;
  }
  
  return currentPassword && newPassword && currentPassword.value === newPassword.value 
    ? { newPasswordSameAsCurrent: true }
    : null;
}

class NewPasswordSameAsCurrentErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const newPasswordSame = form?.form.hasError('newPasswordSameAsCurrent');
    return !!(control && (control.dirty || control.touched) && (newPasswordSame || isSubmitted));
  }
}

class PasswordsMatchErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && (control.dirty || control.touched) && (control.parent?.errors?.['passwordsMismatch'] || isSubmitted));
    }
}

@Component({
    standalone: true,
    selector: 'app-change-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    form: FormGroup;
    isLoading = false;
    hideCurrentPassword = true;
    hideNewPassword = true;
    hideConfirmPassword = true;
    passwordsMatcher = new PasswordsMatchErrorStateMatcher();
    newPasswordMatcher = new NewPasswordSameAsCurrentErrorStateMatcher();
    
    passwordValidationStatus = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    };

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private materialUtils: MaterialUtilsService
    ) {
        this.form = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, this.passwordValidator()]],
            confirmPassword: ['', Validators.required]
        }, { validators: [passwordsMatchValidator, newPasswordSameAsCurrentValidator] });
    }

    ngOnInit(): void {
        this.form.get('newPassword')?.valueChanges.subscribe(value => {
            this.updatePasswordValidationStatus(value);
        });
    }

    private passwordValidator(): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const isValid = value.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
            return isValid ? null : { passwordStrength: true };
        };
    }
    
    updatePasswordValidationStatus(password: string | null): void {
        if (!password) {
            this.resetPasswordValidationStatus();
            return;
        }
        this.passwordValidationStatus.length = password.length >= 8;
        this.passwordValidationStatus.uppercase = /[A-Z]/.test(password);
        this.passwordValidationStatus.lowercase = /[a-z]/.test(password);
        this.passwordValidationStatus.number = /[0-9]/.test(password);
        this.passwordValidationStatus.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }

    private resetPasswordValidationStatus(): void {
        this.passwordValidationStatus = {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        };
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) return;

        this.isLoading = true;

        const dto: ChangePasswordRequestDto = this.form.value;

        try {
            await this.userService.changePassword(dto);
            this.materialUtils.showSuccess('Contraseña cambiada con éxito.');
            this.form.reset();
            this.resetPasswordValidationStatus();
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.setErrors(null) ;
            });
        } catch (err: any) {
            this.materialUtils.showError(err.error?.message || 'Error al cambiar la contraseña.');
        } finally {
            this.isLoading = false;
        }
    }

    onCancel(): void {
        this.form.reset();
        this.resetPasswordValidationStatus();
    }
}

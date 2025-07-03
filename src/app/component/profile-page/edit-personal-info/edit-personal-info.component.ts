import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { UsuarioDto } from '../../../models';
import { EditarUsuarioRequestDto } from '../../../models/users/editar-usuario-request.dto';
import { TipoDocumento } from '../../../models/users/tipo-documento.enum';
import { MaterialUtilsService } from '../../../shared/material-utils.service';

@Component({
  selector: 'app-edit-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-personal-info.component.html',
  styleUrls: ['./edit-personal-info.component.scss']
})
export class EditPersonalInfoComponent implements OnInit {
  form: FormGroup;
  user: UsuarioDto | null = null;
  isLoading = false;
  isLoadingData = true;
  tipoDocumentoOptions = Object.values(TipoDocumento).map(tipo => tipo.toUpperCase());
  maxDate: Date;

  noFutureDate = (d: Date | null): boolean => {
    return (d ?? this.maxDate) <= this.maxDate;
  };

  private static futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valueDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return valueDate >= today ? { futureDate: true } : null;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private materialUtils: MaterialUtilsService
  ) {
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.maxDate.setHours(0, 0, 0, 0);

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      rol: [{ value: '', disabled: true }],
      tipoDocumento: ['', Validators.required],
      documento: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, EditPersonalInfoComponent.futureDateValidator]]
    });
  }

  getAccountStatus(): string {
    return this.user?.activo ? 'Activo' : 'Inactivo';
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    this.isLoadingData = true;
    const userId = this.authService.id;
    if (!userId) {
      this.isLoadingData = false;
      return;
    };

    try {
      this.user = await this.userService.getById(userId);
      if (this.user) {
        this.form.patchValue(this.user);
      }
    } catch (error) {
      this.materialUtils.showError('Error al cargar los datos del usuario.');
    } finally {
      this.isLoadingData = false;
    }
  }

  async onSave(): Promise<void> {
    if (this.form.invalid || !this.user) {
      return;
    }

    this.isLoading = true;
    const formValue = this.form.getRawValue();

    const updatedData: EditarUsuarioRequestDto = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      documento: formValue.documento,
      tipoDocumento: formValue.tipoDocumento,
      fechaNacimiento: formValue.fechaNacimiento
    };

    try {
      await this.userService.editProfile(this.user.id, updatedData);
      this.materialUtils.showSuccess('¡Perfil actualizado con éxito!');
      this.form.markAsPristine();
    } catch (error) {
      this.materialUtils.showError('Error al actualizar el perfil.');
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    if (this.user) {
      this.form.patchValue(this.user);
    }
    this.form.markAsPristine();
  }
}

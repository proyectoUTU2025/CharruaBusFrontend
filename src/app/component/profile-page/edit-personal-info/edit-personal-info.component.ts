import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { TipoCategoriaCliente } from '../../../models/users/tipo-categoria-cliente.enum';
import { Subscription } from 'rxjs';
import { ImmediateErrorStateMatcher } from '../../../shared/immediate-error-state-matcher';

function cedulaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const cedula = control.value.toString().replace(/[\.\-]/g, '');
  if (cedula.length > 0 && cedula.length < 8) {
    return { invalidFormat: true };
  }

  if (!/^\d{8}$/.test(cedula)) {
    return null; 
  }

  const digitos = cedula.substring(0, 7).split('').map(Number);
  const digitoVerificador = parseInt(cedula.substring(7, 8), 10);

  const factores = [2, 9, 8, 7, 6, 3, 4];
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[i] * factores[i];
  }

  const digitoCalculado = (10 - (suma % 10)) % 10;

  return digitoCalculado === digitoVerificador ? null : { invalidCedula: { digitoCalculado } };
}

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
export class EditPersonalInfoComponent implements OnInit, OnDestroy {
  form: FormGroup;
  user: UsuarioDto | null = null;
  isLoading = false;
  isLoadingData = true;
  tipoDocumentoOptions = Object.values(TipoDocumento).map(tipo => tipo.toUpperCase());
  maxDate: Date;
  situacionLaboralOptions = Object.values(TipoCategoriaCliente).map(tipo => tipo.toUpperCase());
  private subs = new Subscription();
  digitoVerificadorSugerido: number | null = null;
  matcher = new ImmediateErrorStateMatcher();

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
      fechaNacimiento: ['', [Validators.required, EditPersonalInfoComponent.futureDateValidator]],
      situacionLaboral: [{ value: '', disabled: true }]
    });
  }

  getAccountStatus(): string {
    return this.user?.activo ? 'Activo' : 'Inactivo';
  }

  isCliente(): boolean {
    return this.user?.rol === 'CLIENTE';
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subs.add(
      this.form.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
        const documentoControl = this.form.get('documento');
        documentoControl?.setValue('');
        documentoControl?.clearValidators();
        documentoControl?.setErrors(null);

        if (tipo === 'CEDULA') {
          documentoControl?.setValidators([Validators.required, cedulaValidator]);
        } else {
          documentoControl?.setValidators([Validators.required]);
        }
        documentoControl?.updateValueAndValidity();
      })
    );

    this.subs.add(
      this.form.get('documento')?.valueChanges.subscribe((value) => {
        const documentoControl = this.form.get('documento');
        if (!documentoControl) return;

        const tipo = this.form.get('tipoDocumento')?.value;

        if (tipo === 'CEDULA') {
          if (value) {
            const soloNumeros = value.replace(/\D/g, '');
            if (value !== soloNumeros) {
              documentoControl.setValue(soloNumeros, { emitEvent: false });
            }
          }

          const errors = documentoControl.errors;
          if (errors && errors['invalidCedula']) {
            this.digitoVerificadorSugerido = errors['invalidCedula'].digitoCalculado;
          } else {
            this.digitoVerificadorSugerido = null;
          }
        } else if (tipo === 'PASAPORTE') {
          if (!value) {
            documentoControl.setErrors({ required: true });
            return;
          }

          let formatted = value.replace(/[^A-Za-z0-9]/g, '');
          if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(/[^0-9]/g, '');
          }
          if (formatted.length > 8) {
            formatted = formatted.substring(0, 8);
          }
          
          if (value !== formatted) {
            documentoControl.setValue(formatted, { emitEvent: false });
          }

          let errors: ValidationErrors | null = null;
          const lettersCount = formatted.replace(/[0-9]/g, '').length;
          const numbersCount = formatted.length - lettersCount;
          const pasaporteRegex = /^[A-Z][0-9]{7}$/;
          
          if (formatted.length === 0) {
            errors = { required: true };
          } else if (formatted.length < 8) {
             if (lettersCount === 0) {
                errors = { pasaporteNeedsLetter: true };
             } else if (lettersCount > 1) {
                errors = { pasaporteTooManyLetters: true };
             } else if (!/^[A-Z]/.test(formatted)) {
                errors = { pasaporteMustStartWithLetter: true };
             } else {
                errors = { pasaporteInvalidLength: true };
             }
          } else {
             if (!pasaporteRegex.test(formatted)) {
                if (lettersCount === 0) {
                    errors = { pasaporteNeedsLetter: true };
                } else if (lettersCount > 1) {
                    errors = { pasaporteTooManyLetters: true };
                } else if (!/^[A-Z]/.test(formatted)) {
                    errors = { pasaporteMustStartWithLetter: true };
                } else {
                    errors = { pasaporteInvalidFormat: true };
                }
             }
          }
          documentoControl.setErrors(errors);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
        if (this.isCliente()) {
          this.form.get('situacionLaboral')?.enable();
        } else {
          this.form.get('situacionLaboral')?.disable();
        }
        this.form.patchValue({
          ...this.user,
          fechaNacimiento: new Date(this.user.fechaNacimiento + 'T00:00:00')
        }, { emitEvent: false });

        const tipoDocumento = this.form.get('tipoDocumento')?.value;
        const documentoControl = this.form.get('documento');

        if (documentoControl && tipoDocumento) {
            documentoControl.clearValidators();

            if (tipoDocumento === 'CEDULA') {
              documentoControl.setValidators([Validators.required, cedulaValidator]);
            } else {
              documentoControl.setValidators([Validators.required]);
            }
            documentoControl.updateValueAndValidity({ emitEvent: false });

            if (tipoDocumento === 'CEDULA') {
                const errors = documentoControl.errors;
                if (errors && errors['invalidCedula']) {
                  this.digitoVerificadorSugerido = errors['invalidCedula'].digitoCalculado;
                } else {
                  this.digitoVerificadorSugerido = null;
                }
            }
        }
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
      fechaNacimiento: new Date(formValue.fechaNacimiento.getTime() - (formValue.fechaNacimiento.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 10)
    };
    if (this.isCliente()) {
      updatedData.situacionLaboral = formValue.situacionLaboral;
    }

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
      if (this.isCliente()) {
        this.form.get('situacionLaboral')?.enable();
      } else {
        this.form.get('situacionLaboral')?.disable();
      }
      this.form.patchValue({
        ...this.user,
        fechaNacimiento: new Date(this.user.fechaNacimiento + 'T00:00:00')
      }, { emitEvent: false });
    }
    this.form.markAsPristine();
  }

  get isTipoCedula(): boolean {
    return this.form.get('tipoDocumento')?.value === 'CEDULA';
  }

  get isTipoPasaporte(): boolean {
    return this.form.get('tipoDocumento')?.value === 'PASAPORTE';
  }
}

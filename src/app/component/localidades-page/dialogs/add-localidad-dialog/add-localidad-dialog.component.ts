import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TipoDepartamento } from '../../../../models/localidades/tipo-departamento.enum';
import { LocalidadDto } from '../../../../models/localidades/localidades-dto.model';
import { LocalidadService } from '../../../../services/localidades.service';
import { MaterialUtilsService } from '../../../../shared/material-utils.service';

@Component({
  standalone: true,
  selector: 'app-add-localidad-dialog',
  templateUrl: './add-localidad-dialog.component.html',
  styleUrls: ['./add-localidad-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class AddLocalidadDialogComponent {
  form: FormGroup;
  departamentos: { value: string; viewValue: string }[] = [];
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLocalidadDialogComponent>,
    private localidadService: LocalidadService,
    private materialUtils: MaterialUtilsService,
    @Inject(MAT_DIALOG_DATA) public data: { initialData?: LocalidadDto; error?: string } | null
  ) {
    // Inicializar departamentos con formato amigable
    this.departamentos = Object.keys(TipoDepartamento).map(key => ({
      value: key,
      viewValue: this.formatDepartmentName(TipoDepartamento[key as keyof typeof TipoDepartamento])
    }));

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      departamento: ['', Validators.required]
    });

    // Si hay datos iniciales, pre-rellenar el formulario
    if (data?.initialData) {
      this.form.patchValue(data.initialData);
    }

    // Si hay un error, mostrarlo
    if (data?.error) {
      this.error = data.error;
    }
  }

  private formatDepartmentName(departmentValue: string): string {
    return departmentValue.replace(/_/g, ' ');
  }

  save(): void {
    if (this.form.valid) {
      this.error = null; // Limpiar errores previos
      this.loading = true;
      
      const dto: LocalidadDto = this.form.value;
      
      this.localidadService.create(dto).subscribe({
        next: () => {
          this.loading = false;
          this.materialUtils.showSuccess('Localidad creada exitosamente.');
          this.dialogRef.close(true); // Cerrar con éxito
        },
        error: (error) => {
          this.loading = false;
          
          // Extraer mensaje de error del backend
          let errorMessage = 'Error al crear la localidad. Por favor, intenta nuevamente.';
          
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.error = errorMessage; // Mostrar error sin cerrar el diálogo
        }
      });
    }
  }

  setError(errorMessage: string): void {
    this.error = errorMessage;
  }

  clearError(): void {
    this.error = null;
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

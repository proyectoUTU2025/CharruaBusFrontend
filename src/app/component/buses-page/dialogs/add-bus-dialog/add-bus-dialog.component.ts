import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { AltaBusDto } from '../../../../models/buses/bus.model.dto';
import { LocalidadService } from '../../../../services/localidades.service';
import { BusService } from '../../../../services/bus.service';
import { LocalidadNombreDepartamentoDto } from '../../../../models/localidades/localidad-nombre-departamento-dto.model';

@Component({
  standalone: true,
  selector: 'app-add-bus-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-bus-dialog.component.html',
  styleUrls: ['./add-bus-dialog.component.scss']
})
export class AddBusDialogComponent implements OnInit {
  form: FormGroup;
  localidades: LocalidadNombreDepartamentoDto[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBusDialogComponent>,
    private localidadService: LocalidadService,
    private busService: BusService
  ) {
    this.form = this.fb.group({
      matricula: ['', Validators.required],
      localidadId: [null, Validators.required],
      cantidadAsientos: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.localidadService.getAllFlat().subscribe({
      next: (localidades) => {
        this.localidades = localidades;
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
        this.error = 'Error al cargar las ubicaciones. Por favor, intenta nuevamente.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading) {
      this.loading = true;
      this.error = null;

      const alta: AltaBusDto = {
        matricula: this.form.value.matricula,
        cantidadAsientos: this.form.value.cantidadAsientos,
        localidadId: this.form.value.localidadId
      };
      
      this.busService.create(alta)
        .then(() => {
          this.dialogRef.close(true);
        })
        .catch((error: HttpErrorResponse | any) => {
          console.error('Error al crear ómnibus:', error);
          
          if (error?.error?.message) {
            this.error = error.error.message;
          } else if (typeof error?.error === 'string') {
            this.error = error.error;
          } else if (error?.message) {
            this.error = error.message;
          } else {
            this.error = 'Error al crear el ómnibus. Por favor, intenta nuevamente.';
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.onSubmit();
  }

  cancel(): void {
    this.onCancel();
  }
}
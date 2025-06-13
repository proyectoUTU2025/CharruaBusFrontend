import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { LocalidadService } from '../../../../services/localidades.service';
import { BusService } from '../../../../services/bus.service';
import { ViajeExpresoService } from '../../../../services/viaje-expreso.service';
import { ViajeExpresoRequest } from '../../../../models/viajes/viaje-expreso-request.model';
import { ConfirmDialogComponent } from './dialogs/confirm-warning-dialog.component';

@Component({
  selector: 'app-alta-viaje-expreso',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './alta-viaje-expreso.component.html',
  styleUrls: ['./alta-viaje-expreso.component.scss']
})
export class AltaViajeExpresoComponent implements OnInit {
  @Input() omnibusIdPreseleccionado: number | null = null;

  form: FormGroup;
  localidades: any[] = [];
  buses: any[] = [];
  isLoading = false;
  horas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private localidadService: LocalidadService,
    private viajeExpresoService: ViajeExpresoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AltaViajeExpresoComponent>
  ) {
    this.form = this.fb.group({
      omnibusId: [null, Validators.required],
      destinoId: [null, Validators.required],
      fechaSalida: [null, Validators.required],
      horaSalida: [null, Validators.required],
      fechaLlegada: [null, Validators.required],
      horaLlegada: [null, Validators.required],
    });


    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        this.horas.push(`${hh}:${mm}`);
      }
    }
  }

  ngOnInit() {
    const omnibusId = this.data?.omnibusId || this.omnibusIdPreseleccionado;
    if (omnibusId) {
      this.form.patchValue({ omnibusId: +omnibusId });
    }
    this.loadLocalidades();
    this.loadBuses();
  }

  loadLocalidades() {
    this.localidadService.getAll({}, 0, 1000).subscribe({
      next: resp => this.localidades = resp.content,
      error: () => this.showSnackbar('Error cargando localidades')
    });
  }

  loadBuses() {
    this.busService.getAll({}, 0, 1000)
      .then(resp => this.buses = resp.content)
      .catch(() => this.showSnackbar('Error cargando ómnibus'));
  }

  onSubmit(confirm: boolean = false) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showSnackbar('Completa todos los campos');
      return;
    }

    const values = this.form.value;
    const fechaHoraSalida = this.combinarFechaHora(values.fechaSalida, values.horaSalida);
    const fechaHoraLlegada = this.combinarFechaHora(values.fechaLlegada, values.horaLlegada);

    const dto: ViajeExpresoRequest = {
      omnibusId: values.omnibusId,
      destinoId: values.destinoId,
      fechaHoraSalida,
      fechaHoraLlegada,
      confirm: confirm
    };

    this.isLoading = true;

    this.viajeExpresoService.crearViajeExpreso(dto).subscribe({
      next: () => {
        this.showSnackbar('¡Viaje registrado correctamente!');
        this.isLoading = false;
        this.form.reset();
        this.dialogRef.close('viajeRegistrado');
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409 && err.error && err.error.message) {
          this.dialog.open(ConfirmDialogComponent, {
            data: { message: err.error.message }
          }).afterClosed().subscribe(confirmar => {
            if (confirmar) {
              this.onSubmit(true);
            }
          });
        }
        else if (err.status === 400 && err.error && err.error.errores) {
          const errores = err.error.errores;
          let msg = '';
          for (const field in errores) {
            if (Array.isArray(errores[field])) {
              msg += errores[field].join(' ') + ' ';
            }
          }
          this.showSnackbar(msg.trim() || 'Error validando datos', 4500);
        }
        else if (err.error && err.error.message) {
          this.showSnackbar(err.error.message, 3500);
        }
        else {
          this.showSnackbar('Error registrando viaje', 3500);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  combinarFechaHora(fecha: string | Date, hora: string): string {
    if (!fecha || !hora) return '';
    const f = new Date(fecha);
    const yyyy = f.getFullYear();
    const mm = (f.getMonth() + 1).toString().padStart(2, '0');
    const dd = f.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hora}:00`;
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (control && control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Este campo es obligatorio';
    }
    return null;
  }

  close() {
    this.dialogRef.close(false);
  }

  private showSnackbar(msg: string, ms: number = 3000) {
    this.snackBar.open(msg, 'Cerrar', {
      duration: ms,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

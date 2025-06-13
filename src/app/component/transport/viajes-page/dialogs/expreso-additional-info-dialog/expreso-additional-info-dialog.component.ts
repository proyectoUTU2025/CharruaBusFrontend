import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ViajeService } from '../../../../../services/viaje.service';


@Component({
  selector: 'app-expreso-additional-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './expreso-additional-info-dialog.component.html',
  styleUrls: ['./expreso-additional-info-dialog.component.scss'],
  providers: [ViajeService]
})
export class ExpresoAdditionalInfoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpresoAdditionalInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    @Inject(ViajeService) private viajeService: ViajeService
  ) {
    this.form = this.fb.group({
      motivo: ['', Validators.required],
      conductor: ['', Validators.required],
      notas: ['']
    });
  }

  registrar(): void {
    if (this.form.valid) {
      const viajeCompleto = {
        ...this.data,
        ...this.form.value,
        tipo: 'Expreso',
        venta: 'No disponible',
        precio: 0,
        pasajesVendibles: 0,
        fechaSalida: this.data.fecha,
        fechaLlegada: this.data.fecha,
        horaSalida: this.data.horaSalida,
        horaLlegada: this.data.horaLlegada,
        origen: this.data.origen,
        destino: this.data.destino
      };

      this.viajeService.addViaje(viajeCompleto);

      this.snackBar.open('Viaje expreso registrado exitosamente.', 'Cerrar', {
        duration: 3000
      });

      this.dialogRef.close();
    }
  }

  atras(): void {
    this.dialogRef.close();
  }
}

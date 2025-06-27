import { Component, OnInit } from '@angular/core';
import { DetalleCompraDto } from '../../models';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-compra-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    RouterModule,
    MatIconModule    
  ],
 templateUrl: './compra-detalle-page.component.html',
  styleUrls: ['./compra-detalle-page.component.scss']
})
export class CompraDetallePageComponent implements OnInit {
  compraId!: number;
  detalle!: DetalleCompraDto;
  isCliente = false;
  mostrarBannerExito = false;
  displayedColumns = [
    'numeroAsiento',
    'paradaOrigen',
    'paradaDestino',
    'precio',
    'descuento',
    'subtotal',
    'estadoPasaje'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,  
    private compraService: CompraService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.mostrarBannerExito = !!navigation?.extras.state?.['compraExitosa'];
    this.isCliente = this.authService.rol === 'CLIENTE';
    this.compraId = Number(this.route.snapshot.paramMap.get('id'));
    this.compraService.getDetalle(this.compraId)
      .subscribe(d => this.detalle = d);
  }

  descargarPdf() {
    this.compraService.descargarPdf(this.compraId)
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  }
}
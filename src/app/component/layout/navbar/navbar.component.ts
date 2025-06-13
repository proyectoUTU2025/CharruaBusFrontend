import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private router: Router) { }

  onLogoClick(): void {
    if (this.router.url === '/' || this.router.url === '') {
      window.location.reload();
    } else {
      this.router.navigate(['']);
    }
  }

  goToHistorial(): void {
    this.router.navigate(['/perfil/historial']);
  }
}

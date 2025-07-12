import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialUtilsService } from '../../../shared/material-utils.service';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './verificar-codigo.component.html',
  styleUrls: ['./verificar-codigo.component.scss']
})
export class VerificarCodigoComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  error: string | null = null;
  email: string | null = null;
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  resending = false;
  resendCooldown = 0;
  private cooldownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private materialUtils: MaterialUtilsService,
    private location: Location
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'];
    
    if (this.email) {
      this.location.replaceState('/verificar-codigo');
    }

    this.form = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });
  }

  ngOnInit(): void {
    if (!this.email) {
      this.router.navigate(['/signup']);
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  ngAfterViewInit(): void {
    this.digitInputs?.first?.nativeElement.focus();
  }
  
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && /^\d$/.test(value)) {
      if (index < 5) {
        this.digitInputs.toArray()[index + 1].nativeElement.focus();
      }
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value === '') {
      if (index > 0) {
        this.digitInputs.toArray()[index - 1].nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text').trim();
    if (pasteData && /^\d{6}$/.test(pasteData)) {
      for (let i = 0; i < 6; i++) {
        this.form.get(`digit${i + 1}`)?.setValue(pasteData[i]);
      }
      this.digitInputs.last.nativeElement.focus();
    }
  }

  async onResendCode(): Promise<void> {
    if (!this.email || this.resending || this.resendCooldown > 0) return;

    this.resending = true;
    this.error = null;

    try {
      const response = await this.authService.resendVerificationEmail(this.email);
      this.materialUtils.showSuccess(response.message);
      this.startCooldown();
    } catch (err: any) {
      this.error = err.error?.message || 'Error al reenviar el código.';
    } finally {
      this.resending = false;
    }
  }

  private startCooldown(): void {
    this.resendCooldown = 60;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }
  
  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.email) return;

    this.error = null;
    const code = Object.values(this.form.value).join('');

    try {
      const response = await this.authService.verifyEmail(this.email, code);
      this.materialUtils.showSuccess(response.message);
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err?.error?.message || 'Código inválido o expirado. Inténtalo de nuevo.';
    }
  }
}

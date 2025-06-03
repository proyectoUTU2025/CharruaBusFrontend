import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaViajeConfirmDialogComponent } from './alta-viaje-confirm-dialog.component';

describe('AltaViajeConfirmDialogComponent', () => {
  let component: AltaViajeConfirmDialogComponent;
  let fixture: ComponentFixture<AltaViajeConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaViajeConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaViajeConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

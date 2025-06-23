import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajeDetalleDialogComponent } from './viaje-detalle-dialog.component';

describe('ViajeDetalleDialogComponent', () => {
  let component: ViajeDetalleDialogComponent;
  let fixture: ComponentFixture<ViajeDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeDetalleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViajeDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaViajeSelectBusDialogComponent } from './alta-viaje-select-bus-dialog.component';

describe('AltaViajeSelectBusDialogComponent', () => {
  let component: AltaViajeSelectBusDialogComponent;
  let fixture: ComponentFixture<AltaViajeSelectBusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaViajeSelectBusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaViajeSelectBusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

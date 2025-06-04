import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaViajeDetailsDialogComponent } from './alta-viaje-details-dialog.component';

describe('AltaViajeDetailsDialogComponent', () => {
  let component: AltaViajeDetailsDialogComponent;
  let fixture: ComponentFixture<AltaViajeDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaViajeDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaViajeDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

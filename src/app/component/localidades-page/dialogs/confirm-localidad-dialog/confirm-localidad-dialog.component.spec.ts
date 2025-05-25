import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmLocalidadDialogComponent } from './confirm-localidad-dialog.component';

describe('ConfirmLocalidadDialogComponent', () => {
  let component: ConfirmLocalidadDialogComponent;
  let fixture: ComponentFixture<ConfirmLocalidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmLocalidadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmLocalidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

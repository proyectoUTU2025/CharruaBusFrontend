import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocalidadDialogComponent } from './add-localidad-dialog.component';

describe('AddLocalidadDialogComponent', () => {
  let component: AddLocalidadDialogComponent;
  let fixture: ComponentFixture<AddLocalidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLocalidadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLocalidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

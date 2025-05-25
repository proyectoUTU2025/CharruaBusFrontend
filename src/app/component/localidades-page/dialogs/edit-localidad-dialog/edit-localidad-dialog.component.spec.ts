import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLocalidadDialogComponent } from './edit-localidad-dialog.component';

describe('EditLocalidadDialogComponent', () => {
  let component: EditLocalidadDialogComponent;
  let fixture: ComponentFixture<EditLocalidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLocalidadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLocalidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

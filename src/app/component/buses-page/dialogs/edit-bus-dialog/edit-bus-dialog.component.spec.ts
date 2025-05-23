import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusDialogComponent } from './edit-bus-dialog.component';

describe('EditBusDialogComponent', () => {
  let component: EditBusDialogComponent;
  let fixture: ComponentFixture<EditBusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

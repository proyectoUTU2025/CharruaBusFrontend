import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusDialogComponent } from './add-bus-dialog.component';

describe('AddBusDialogComponent', () => {
  let component: AddBusDialogComponent;
  let fixture: ComponentFixture<AddBusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpresoSelectBusDialogComponent } from './expreso-select-bus-dialog.component';

describe('ExpresoSelectBusDialogComponent', () => {
  let component: ExpresoSelectBusDialogComponent;
  let fixture: ComponentFixture<ExpresoSelectBusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpresoSelectBusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpresoSelectBusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

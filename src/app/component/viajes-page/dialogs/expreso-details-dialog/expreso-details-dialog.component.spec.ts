import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpresoDetailsDialogComponent } from './expreso-details-dialog.component';

describe('ExpresoDetailsDialogComponent', () => {
  let component: ExpresoDetailsDialogComponent;
  let fixture: ComponentFixture<ExpresoDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpresoDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpresoDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

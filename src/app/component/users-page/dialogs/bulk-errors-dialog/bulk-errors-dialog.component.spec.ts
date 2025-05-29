import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkErrorsDialogComponent } from './bulk-errors-dialog.component';

describe('BulkErrorsDialogComponent', () => {
  let component: BulkErrorsDialogComponent;
  let fixture: ComponentFixture<BulkErrorsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkErrorsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkErrorsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

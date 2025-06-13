import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadDialogComponent } from './bulk-upload-dialog.component';

describe('BulkUploadDialogComponent', () => {
  let component: BulkUploadDialogComponent;
  let fixture: ComponentFixture<BulkUploadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

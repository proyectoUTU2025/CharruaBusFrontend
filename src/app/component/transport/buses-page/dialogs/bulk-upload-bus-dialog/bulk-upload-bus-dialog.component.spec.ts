import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadBusDialogComponent } from './bulk-upload-bus-dialog.component';

describe('BulkUploadBusDialogComponent', () => {
  let component: BulkUploadBusDialogComponent;
  let fixture: ComponentFixture<BulkUploadBusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadBusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadBusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

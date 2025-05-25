import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadLocalidadDialogComponent } from './bulk-upload-localidad-dialog.component';

describe('BulkUploadLocalidadDialogComponent', () => {
  let component: BulkUploadLocalidadDialogComponent;
  let fixture: ComponentFixture<BulkUploadLocalidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadLocalidadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadLocalidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

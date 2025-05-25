import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpresoAdditionalInfoDialogComponent } from './expreso-additional-info-dialog.component';

describe('ExpresoAdditionalInfoDialogComponent', () => {
  let component: ExpresoAdditionalInfoDialogComponent;
  let fixture: ComponentFixture<ExpresoAdditionalInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpresoAdditionalInfoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpresoAdditionalInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

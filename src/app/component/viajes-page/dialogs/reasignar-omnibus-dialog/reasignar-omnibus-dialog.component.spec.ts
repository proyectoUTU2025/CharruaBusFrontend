import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasignarOmnibusDialogComponent } from './reasignar-omnibus-dialog.component';

describe('ReasignarOmnibusDialogComponent', () => {
  let component: ReasignarOmnibusDialogComponent;
  let fixture: ComponentFixture<ReasignarOmnibusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReasignarOmnibusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReasignarOmnibusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

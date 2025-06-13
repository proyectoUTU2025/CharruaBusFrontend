import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajesPageComponent } from './viajes-page.component';

describe('ViajesPageComponent', () => {
  let component: ViajesPageComponent;
  let fixture: ComponentFixture<ViajesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViajesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

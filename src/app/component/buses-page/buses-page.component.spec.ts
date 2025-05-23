import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusesPageComponent } from './buses-page.component';

describe('BusesPageComponent', () => {
  let component: BusesPageComponent;
  let fixture: ComponentFixture<BusesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

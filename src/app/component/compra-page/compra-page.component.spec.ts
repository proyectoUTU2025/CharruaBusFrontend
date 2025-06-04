import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraPageComponent } from './compra-page.component';

describe('CompraPageComponent', () => {
  let component: CompraPageComponent;
  let fixture: ComponentFixture<CompraPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompraPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

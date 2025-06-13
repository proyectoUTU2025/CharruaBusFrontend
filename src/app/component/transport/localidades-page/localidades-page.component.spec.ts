import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalidadesPageComponent } from './localidades-page.component';

describe('LocalidadesPageComponent', () => {
  let component: LocalidadesPageComponent;
  let fixture: ComponentFixture<LocalidadesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalidadesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalidadesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

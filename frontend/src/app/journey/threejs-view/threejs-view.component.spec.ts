import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeJSComponent } from './threejs-view.component';

describe('ThreeJSComponent', () => {
  let component: ThreeJSComponent;
  let fixture: ComponentFixture<ThreeJSComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreeJSComponent],
    });
    fixture = TestBed.createComponent(ThreeJSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

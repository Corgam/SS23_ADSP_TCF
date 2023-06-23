import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBlocksComponent } from './filter-blocks.component';

describe('FilterBlocksComponent', () => {
  let component: FilterBlocksComponent;
  let fixture: ComponentFixture<FilterBlocksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterBlocksComponent]
    });
    fixture = TestBed.createComponent(FilterBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

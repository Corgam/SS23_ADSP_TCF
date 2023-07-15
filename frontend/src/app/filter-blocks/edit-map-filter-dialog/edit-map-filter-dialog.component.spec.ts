import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMapFilterDialogComponent } from './edit-map-filter-dialog.component';

describe('EditMapFilterDialogComponent', () => {
  let component: EditMapFilterDialogComponent;
  let fixture: ComponentFixture<EditMapFilterDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditMapFilterDialogComponent]
    });
    fixture = TestBed.createComponent(EditMapFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

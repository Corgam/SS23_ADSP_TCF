import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFileListEntryComponent } from './data-file-list-entry.component';

describe('DataFileListEntryComponent', () => {
  let component: DataFileListEntryComponent;
  let fixture: ComponentFixture<DataFileListEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataFileListEntryComponent]
    });
    fixture = TestBed.createComponent(DataFileListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

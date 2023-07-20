import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueJourneyDialogComponent } from './continue-journey-dialog.component';

describe('InputDialogComponent', () => {
  let component: ContinueJourneyDialogComponent;
  let fixture: ComponentFixture<ContinueJourneyDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContinueJourneyDialogComponent]
    });
    fixture = TestBed.createComponent(ContinueJourneyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

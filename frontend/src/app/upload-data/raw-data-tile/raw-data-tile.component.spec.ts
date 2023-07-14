import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RawDataTileComponent } from './raw-data-tile.component';


describe('RawDataTileComponent', () => {
  let component: RawDataTileComponent;
  let fixture: ComponentFixture<RawDataTileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RawDataTileComponent]
    });
    fixture = TestBed.createComponent(RawDataTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

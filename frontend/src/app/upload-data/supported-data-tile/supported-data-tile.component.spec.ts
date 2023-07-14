import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportedDataTileComponent } from './supported-data-tile.component';


describe('SupportedDataTileComponent', () => {
  let component: SupportedDataTileComponent;
  let fixture: ComponentFixture<SupportedDataTileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupportedDataTileComponent]
    });
    fixture = TestBed.createComponent(SupportedDataTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

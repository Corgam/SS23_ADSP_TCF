import { AfterViewInit, Component } from '@angular/core';
import { GeoService } from './services/geo.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ControlsComponent } from './components/controls/controls.component';
import { Subscription } from 'rxjs';
import { AppService } from './services/app.service';


@Component({
  selector: 'app-first-draft',
  templateUrl: './first-draft.component.html',
  styleUrls: ['./first-draft.component.scss']
})
export class FirstDraftComponent implements AfterViewInit {

  isControlsOpened = false;

  private readonly controlsStateSubscription: Subscription;

  constructor(private appService: AppService, private geoService: GeoService, private bottomSheet: MatBottomSheet) {
    this.controlsStateSubscription = this.appService.controlsState.subscribe(value => this.isControlsOpened = value);
  }

  ngAfterViewInit(): void {
    this.geoService.updateView();
    this.geoService.setTileSource();
    this.geoService.updateSize();
  }

  openControls(): void {
    this.bottomSheet.open(ControlsComponent, { autoFocus: false });
  }

  
}

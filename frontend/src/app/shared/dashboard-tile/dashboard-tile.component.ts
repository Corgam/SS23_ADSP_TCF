import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

/**
 * This component represents each tile of the dashboard and displays the 
 * title and icon. When clicking the tile, it navigates to the given url.
 */
@Component({
  selector: 'app-dashboard-tile',
  templateUrl: './dashboard-tile.component.html',
  styleUrls: ['./dashboard-tile.component.scss']
})
export class DashboardTileComponent {

  @Input()
  iconName = "";

  @Input()
  title = "";

  @Input()
  url = "/";

  navigate(){
    this.router.navigate([this.url]);
  }

  constructor(private readonly router: Router) {}
}

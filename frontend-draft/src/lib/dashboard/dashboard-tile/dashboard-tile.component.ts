import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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

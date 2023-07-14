import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-raw-data-tile',
  templateUrl: './raw-data-tile.component.html',
  styleUrls: ['./raw-data-tile.component.scss']
})
export class RawDataTileComponent {

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

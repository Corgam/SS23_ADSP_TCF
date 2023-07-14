import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supported-data-tile',
  templateUrl: './supported-data-tile.component.html',
  styleUrls: ['./supported-data-tile.component.scss']
})
export class SupportedDataTileComponent {

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

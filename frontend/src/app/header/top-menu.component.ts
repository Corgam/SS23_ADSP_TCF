import { Component, OnDestroy, OnInit, Input } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: 'top-menu',
	templateUrl: './top-menu.component.html',
	styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent implements OnDestroy, OnInit {
	@Input()
  showsave: boolean = false;

	@Input()
  showmenu: boolean = false;

  @Input()
  showappmenu: boolean = false;

  @Input()
  wide: boolean = false;

	@Input()
  showcreate: boolean = false;

	@Input()
  showbacktolist: boolean = false;

  @Input()
  showsubmit: boolean = false;

  navigating: boolean = false;

  private onDestroy: Subject<boolean> = new Subject<boolean>();

  constructor( ) {}

  ngOnInit() {  }

  ngOnDestroy() { }
}


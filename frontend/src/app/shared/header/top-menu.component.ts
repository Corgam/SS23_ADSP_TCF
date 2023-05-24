import { Component, OnDestroy, OnInit, Input } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: 'top-menu',
	templateUrl: './top-menu.component.html',
	styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent {
  loggedInUser: string = ''; // Variable, um den Namen der angemeldeten Person zu speichern

  constructor() {
    // Annahme: Du erhältst den Namen der angemeldeten Person von deinem Authentifizierungs-/Benutzerservice
    // Hier kannst du den Namen der angemeldeten Person setzen, z.B. aus dem Local Storage oder vom Backend abrufen
    this.loggedInUser = 'Max Mustermann';
  }
}


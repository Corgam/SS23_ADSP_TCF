import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tiles: any[] = [];

  data = {
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
}

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.initializeTiles();
    });

    this.initializeTiles();
  }

  initializeTiles() {
    const uploadTitle = this.translate.instant('title.upload');
    const exploreTitle = this.translate.instant('title.explore');
    const mapTitle = this.translate.instant('title.map');
    const viewDatasetsTitle = this.translate.instant('title.viewDatasets');
  
    this.tiles = [
      { title: uploadTitle, icon: 'upload', url: 'upload' },
      { title: viewDatasetsTitle, icon: 'explore', url: 'data-sets' },
      { title: exploreTitle, icon: 'view_in_ar', url: '' },
      { title: mapTitle, icon: 'code', url: 'map' }
    ];
  }
}

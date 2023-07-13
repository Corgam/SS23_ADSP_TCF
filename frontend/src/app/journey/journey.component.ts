import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AreaFilter, Collection, Datafile, Journey, PaginationResult, RadiusFilter } from '@common/types';
import { Observable, tap } from 'rxjs';
import { JourneyService } from './services/journey.service';
import { Coordinate } from 'ol/coordinate';

type ViewType =  'default' | 'no-map';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyComponent {
  journey$?: Observable<Journey | null>;
  collectionFilesMap$?: Observable<Map<Collection, PaginationResult<Datafile>>>;
  selectedCollection$?: Observable<Collection | null>;
  selectedLocations$?: Observable<Coordinate[]>

  view: ViewType = 'default'

  constructor(
    private journeyService: JourneyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.journey$ = this.journeyService.journey$;
    this.selectedCollection$ = this.journeyService.selectedCollection$;
    this.collectionFilesMap$ = this.journeyService.collectionFilesMap$;
    this.selectedLocations$ = this.journeyService.locations$.pipe(tap(console.log));

    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      if (id) this.journeyService.loadJourney(id);
      else throw new Error('no id was given');
    });
  }

  changeView(view: ViewType) {
    this.view = view;
  }

  onMapFiltersUpdate(filters: (RadiusFilter | AreaFilter)[]) {
    this.journeyService.addMapFilters(filters);
  }
}

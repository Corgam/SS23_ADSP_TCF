import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaFilter, Collection, Journey, RadiusFilter } from '@common/types';
import { Observable, map } from 'rxjs';
import { DisplayCollection } from '../map/map.component';
import { CollectionData, JourneyService } from './services/journey.service';
import { ThreeJSComponent } from './threejs-view/threejs-view.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { isMapFilter } from '../../util/filter-utils';

export type ViewType = 'default' | 'no-map';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.scss'],
})
export class JourneyComponent {
  journey$?: Observable<Journey | null>;
  collectionsData$?: Observable<CollectionData[]>;
  selectedCollection$?: Observable<Collection | null>;
  displayCollections$?: Observable<DisplayCollection[]>;
  mapFilters$?: Observable<(RadiusFilter | AreaFilter)[]>;

  view: ViewType = 'default';
  // Journey View ref
  @ViewChild('threeJSView', { static: false }) tabs!: ThreeJSComponent;

  constructor(
    private journeyService: JourneyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.journey$ = this.journeyService.journey$;
    this.selectedCollection$ = this.journeyService.selectedCollection$;
    this.collectionsData$ = this.journeyService.collectionsData$;
    this.displayCollections$ = this.journeyService.collectionsData$.pipe(
      map((collectionsData) =>
        this.collectionDataToDisplayCollection(collectionsData)
      )
    );
    this.setMapFilters();

    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      this.journeyService.loadJourney(id);
    });
  }

  setMapFilters() {
    this.mapFilters$ = this.journeyService.selectedCollection$.pipe(
      map((selectedLocation) => {
        return selectedLocation?.filterSet.filter((filter) =>
          isMapFilter(filter)
        ) as (AreaFilter | RadiusFilter)[];
      })
    );
  }

  applyFilters() {
    this.journeyService.reloadJourney();
  }

  addCollection() {
    this.journeyService.addCollection();
  }

  changeView(view: ViewType) {
    this.view = view;
  }

  saveJourney() {
    this.journeyService.saveJourney().subscribe((journey) => {
      this.route.paramMap.subscribe((paramMap) => {
        const id = paramMap.get('id');
        if (id != journey._id) this.router.navigate(['journey', journey._id]);
      });
    });
  }

  download() {}

  onMapFiltersUpdate(filters: (RadiusFilter | AreaFilter)[]) {
    this.journeyService.addMapFilters(filters);
  }

  onSelectedTabChange(changeEvent: MatTabChangeEvent) {
    if (changeEvent.index == 2) {
      this.tabs.loadRenderer();
    } else {
      this.tabs.unloadRenderer();
    }
  }

  collectionDataToDisplayCollection(
    collectionsData: CollectionData[]
  ): DisplayCollection[] {
    return collectionsData.map(
      (collectionData) =>
        ({
          hexColor: collectionData.color,
          coordinates: [...collectionData.selectedFilesIds].map(
            (selectedFileId) => {
              const selectedFile = collectionData.files.results.find(
                (file) => file._id == selectedFileId
              );
              return selectedFile?.content.location?.coordinates
                ? selectedFile?.content.location?.coordinates
                : (selectedFile?.content as any).coords
                ? [
                    (selectedFile?.content as any).coords.longitude,
                    (selectedFile?.content as any).coords.latitude,
                  ]
                : (() => {
                    console.error(
                      'could not find coordinates on file: ',
                      selectedFile
                    );
                    return false;
                  })() && [0, 0];
            }
          ),
        } as DisplayCollection)
    );
  }
}

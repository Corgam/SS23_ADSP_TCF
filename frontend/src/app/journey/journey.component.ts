import { Component, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaFilter, Collection, Journey, RadiusFilter } from '@common/types';
import {
  Observable,
  combineLatest,
  last,
  map,
  switchMap
} from 'rxjs';
import { isMapFilter } from '../../util/filter-utils';
import { DisplayCollection } from '../map/map.component';
import { CollectionData, JourneyService } from './services/journey.service';
import { ThreeJSComponent } from './threejs-view/threejs-view.component';

export type ViewType = 'default' | 'no-map';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.scss'],
  providers: [JourneyService],
})
export class JourneyComponent {
  journey$?: Observable<Journey | null>;
  collectionsData$?: Observable<Observable<CollectionData>[]>;
  selectedCollection$?: Observable<Collection | null>;
  displayCollections$?: Observable<DisplayCollection[]>;
  mapFilters$?: Observable<(RadiusFilter | AreaFilter)[]>;
  hasNoCollections$?: Observable<boolean>;

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
      switchMap((collectionsData) =>
        this.collectionDataToDisplayCollection(collectionsData)
      )
    );
    this.hasNoCollections$ = this.collectionsData$.pipe(
      map((data) => data.length == 0)
    );
    this.setMapFilters();

    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      this.journeyService
        .loadJourney(id)
        .pipe(last())
        .subscribe((success) => {
          if (!success) this.router.navigate(['journey']);
        });
    });
  }

  setMapFilters() {
    this.mapFilters$ = this.journeyService.selectedCollection$.pipe(
      map((selectedCollection) => {
        return selectedCollection?.filterSet.filter(
          (filter) =>
            isMapFilter(filter) &&
            filter.negate == false &&
            filter.key == 'content.location'
        ) as (AreaFilter | RadiusFilter)[];
      })
    );
  }

  onMapFiltersUpdate(filters: (RadiusFilter | AreaFilter)[]) {
    console.log(filters)
    this.journeyService.addMapFilters(filters);
  }

  applyFilters() {
    this.journeyService.reloadSelectedCollection();
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

  download() {
    this.journeyService.downloadSelectedData();
  }

  onSelectedTabChange(changeEvent: MatTabChangeEvent) {
    if (changeEvent.index == 2) {
      this.tabs.loadRenderer();
    } else {
      this.tabs.unloadRenderer();
    }
  }

  collectionDataToDisplayCollection(
    collectionsData$: Observable<CollectionData>[]
  ): Observable<DisplayCollection[]> {
    return combineLatest(collectionsData$).pipe(
      map((collectionsData) =>
        collectionsData.map(
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
        )
      ),
    );
  }
}

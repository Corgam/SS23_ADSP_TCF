import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  combineLatest,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import {
  AreaFilter,
  BooleanOperation,
  Collection,
  Datafile,
  FilterOperations,
  Journey,
  PaginationResult,
  RadiusFilter,
  Visibility,
} from '@common/types';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private journeySubject = new BehaviorSubject<Journey | null>(null);
  journey$ = this.journeySubject.asObservable();

  private selectedDataFilesSubject = new BehaviorSubject<Set<string>>(
    new Set()
  );
  selectedDataFiles$ = this.selectedDataFilesSubject.asObservable();

  private selectedCollectionSubject = new BehaviorSubject<Collection | null>(
    null
  );
  selectedCollection$ = this.selectedCollectionSubject.asObservable();

  collectionFilesMap$: Observable<Map<Collection, PaginationResult<Datafile>>> =
    this.journey$.pipe(
      switchMap((journey) => {
        if (journey == null) return of([]);
        return forkJoin(
          journey.collections.map((collection) =>
            this.getCollection(collection).pipe(
              map(
                (dataFiles) =>
                  [collection, dataFiles] as [
                    Collection,
                    PaginationResult<Datafile>
                  ]
              )
            )
          )
        );
      }),
      map((results) => new Map(results)),
      shareReplay(1)
    );

  locations$ = combineLatest([
    this.collectionFilesMap$,
    this.selectedDataFiles$,
  ]).pipe(
    map(([collectionFilesMap, selectedDataFiles]) => {
      let locations: number[][] = [];
      for (let key of collectionFilesMap.keys()) {
        for (let file of collectionFilesMap.get(key)?.results || []) {
          if (!selectedDataFiles.has(file._id!)) continue;
          else if (file.content.location?.coordinates)
            locations.push(file.content.location?.coordinates);
          else if ((file.content as any).coords)
            locations.push([
              (file.content as any).coords.longitude,
              (file.content as any).coords.latitude,
            ]);
        }
      }
      console.log(locations);
      return locations;
    }),
    shareReplay(1)
  );

  constructor(private apiService: ApiService) {}

  loadJourney(id: string) {
    const journeyMock: Journey = {
      title: 'Test Journey',
      description: 'this is a description',
      tags: ['one tag', 'second tag'],
      author: 'me',
      collections: [
        {
          title: 'Collection 1',
          filterSet: [
            {
              key: 'tags',
              operation: FilterOperations.CONTAINS,
              value: 'fake',
              negate: false,
            },
          ],
        },
        {
          title: 'Collection 2',
          filterSet: [
            {
              key: 'tags',
              operation: FilterOperations.CONTAINS,
              value: 'fake',
              negate: false,
            },
            {
              booleanOperation: BooleanOperation.OR,
              filters: [
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'clear',
                  negate: false,
                },
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'school',
                  negate: false,
                },
              ],
            },
          ],
        },
        {
          title: 'Collection 3',
          filterSet: [
            {
              booleanOperation: BooleanOperation.OR,
              filters: [
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'clear',
                  negate: false,
                },
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'school',
                  negate: false,
                },
              ],
            },
          ],
        },
      ],
      visibility: Visibility.PUBLIC,
    };

    of(journeyMock).subscribe((val) => this.journeySubject.next(val));
    of(journeyMock)
      .pipe(map((journey) => journey.collections[0]))
      .subscribe((val) => this.selectedCollectionSubject.next(val));
  }

  selectCollection(collection: Collection) {
    this.selectedCollectionSubject.next(collection);
  }

  getCollection(collection: Collection) {
    return this.apiService.filterDatafiles(
      { filterSet: collection.filterSet },
      10,
      0
    );
  }

  selectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.add(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  deselectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.delete(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  isOneSelected$(...ids: string[]) {
    return this.selectedDataFiles$.pipe(
      map(
        (selected) =>
          ids.length != 0 &&
          ids.reduce((prev, curr) => prev || selected.has(curr), false) &&
          !ids.reduce((prev, curr) => prev && selected.has(curr), true)
      ),
      shareReplay(1)
    );
  }

  isSelected$(...ids: string[]) {
    return this.selectedDataFiles$.pipe(
      map(
        (selected) =>
          ids.length != 0 &&
          ids.reduce((prev, curr) => prev && selected.has(curr), true)
      ),
      shareReplay(1)
    );
  }

  addMapFilters(filters: (RadiusFilter | AreaFilter)[]) {
    const collection = this.selectedCollectionSubject.value;
    if (collection == null) return;

    collection.filterSet.push(...filters);
    this.selectedCollectionSubject.next(collection);  
  }
}

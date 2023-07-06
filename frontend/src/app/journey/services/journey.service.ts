import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  BooleanOperation,
  Collection,
  Datafile,
  FilterOperations,
  Journey,
  PaginationResult,
  Visibility,
} from '@common/types';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private journeySubject = new BehaviorSubject<Journey | null>(null);
  journey$ = this.journeySubject.asObservable();

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
      tap(console.log),
      map((results) => new Map(results))
    );

  locations$ = this.collectionFilesMap$.pipe(
    map((collectionFilesMap) => {
      let locations: number[][] = [];
      for (let key of collectionFilesMap.keys()) {
        for (let file of collectionFilesMap.get(key)?.results || [])
          if (file.content.location?.coordinates)
            locations.push(file.content.location?.coordinates);
          else if ((file.content as any).coords)
            locations.push([
              (file.content as any).coords.longitude,
              (file.content as any).coords.latitude,
            ]);
      }
      return locations;
    })
  );

  private selectedCollectionSubject = new BehaviorSubject<Collection | any>(
    null
  );
  selectedCollection$ = this.selectedCollectionSubject.asObservable();

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
              value: 'have',
              negate: false,
            },
            {
              booleanOperation: BooleanOperation.OR,
              filters: [
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'fake',
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
                  value: 'have',
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
}

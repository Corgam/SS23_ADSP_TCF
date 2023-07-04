import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map, of, tap } from 'rxjs';
import {
  BooleanOperation,
  Collection,
  FilterOperations,
  Journey,
  Visibility,
} from '@common/types';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private journeySubject = new BehaviorSubject<Journey | null>(null);
  journey$ = this.journeySubject.asObservable();

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
}

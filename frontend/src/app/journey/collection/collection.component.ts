import { Component, Input } from '@angular/core';
import { Collection, Datafile, PaginationResult } from '@common/types';
import { JourneyService } from '../services/journey.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent {
  @Input({ required: true }) collection!: Collection;
  @Input({ required: true }) dataFiles!: PaginationResult<Datafile>;

  constructor(private journeyService: JourneyService){}

  selectCollection() {  
    console.log('as')
    this.journeyService.selectCollection(this.collection)
  }
}

import { Component, Input } from '@angular/core';
import { Collection } from '@common/types';
import { JourneyService } from '../services/journey.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent {
  @Input({ required: true }) collection!: Collection;

  constructor(private journeyService: JourneyService){
  //   const tag = document.createElement('script');
  //   tag.src = 'https://www.youtube.com/iframe_api';
  //   document.body.appendChild(tag);
  }

  selectCollection() {  
    console.log('as')
    this.journeyService.selectCollection(this.collection)
  }
}

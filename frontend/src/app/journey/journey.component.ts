import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Collection, Journey } from '@common/types';
import { Observable, tap } from 'rxjs';
import { JourneyService } from './services/journey.service';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyComponent {
  journey$?: Observable<Journey | null>;
  selectedCollection$?: Observable<Collection | null>;

  constructor(
    private journeyService: JourneyService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.journey$ = this.journeyService.journey$;
    this.selectedCollection$ = this.journeyService.selectedCollection$.pipe(
      tap(console.log)
    );

    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      if (id) this.journeyService.loadJourney(id);
      else throw new Error('no id was given');
    });
  }
}

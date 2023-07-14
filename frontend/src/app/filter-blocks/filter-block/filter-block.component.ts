import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Filter, FilterOperations, InputKeyTypes } from '@common/types';
import { TranslateService } from '@ngx-translate/core';

interface Key {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})

export class FilterBlockComponent {
  @Input({ required: true }) fileFilter!: Filter;

  keyinputType?: InputKeyTypes;
  InputKeyTypesEnum = InputKeyTypes;
  
  keys: Key[] = [
    {value: 'title', viewValue: this.translate.instant('journey.title')},
    {value: 'description', viewValue: this.translate.instant('journey.description')},
    {value: 'tags', viewValue: this.translate.instant('journey.tags')},
    {value: 'author', viewValue: this.translate.instant('journey.author')},
  ];

  filterOperations = Object.keys(FilterOperations);

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private translate: TranslateService) {
    if (router.url.startsWith("/browse-journey")) {
      this.keyinputType = InputKeyTypes.SELECT;
    } else  {
      this.keyinputType = InputKeyTypes.INPUT;
  }
}


  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.fileFilter.operation = (FilterOperations as any)[operationKey];
  }

  toggleNegate() {
    this.fileFilter.negate = !this.fileFilter.negate;
  }
}

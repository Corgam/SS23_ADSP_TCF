import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DropdownOption, Filter, FilterOperations, InputKeyTypes } from '@common/types';

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})

export class FilterBlockComponent {
  @Input({ required: true }) fileFilter!: Filter;
  @Input() dropdownOptions!: DropdownOption[];
  keyinputType?: InputKeyTypes;
  InputKeyTypesEnum = InputKeyTypes;

  filterOperations = Object.keys(FilterOperations);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
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

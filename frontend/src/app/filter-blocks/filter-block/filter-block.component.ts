import { Component, Input } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Filter, FilterOperations } from '@common/types';
import { DropdownOption } from '../filter-blocks.component';



@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})

export class FilterBlockComponent {
  @Input({ required: true }) fileFilter!: Filter;
  @Input() dropdownOptions?: DropdownOption[];
  
  filterOperations = Object.keys(FilterOperations);

  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.fileFilter.operation = (FilterOperations as any)[operationKey];
  }

  toggleNegate() {
    this.fileFilter.negate = !this.fileFilter.negate;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Filter, FilterOperations } from '@common/types';

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})
export class FilterBlockComponent {
  @Input({ required: true }) filter!: Filter;
  @Output() onChange = new EventEmitter();

  keyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  // operation = new FormControl('', [Validators.required, Validators.minLength(3)]);
  valueControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);

  filterOperations = Object.keys(FilterOperations);

  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.filter.operation = (FilterOperations as any)[operationKey];
    this.onChange.emit();
  }

  toggleNegate() {
    this.filter.negate = !this.filter.negate;
    this.onChange.emit();
  }

  getControlErrorMessage(control: FormControl) {
    if (control.hasError('required')) return 'input needed';
    if (control.hasError('minlength')) return 'must be longer than 3';
    return '';
  }

  isStringFilter() {
    return [FilterOperations.MATCHES, FilterOperations.CONTAINS]
  }
}

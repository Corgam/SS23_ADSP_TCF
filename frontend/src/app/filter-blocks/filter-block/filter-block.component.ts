import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  AnyFilter,
  AreaFilter,
  BooleanFilter,
  Filter,
  FilterOperations,
  NumberFilter,
  RadiusFilter,
  StringFilter,
} from '@common/types';
import {
  isAreaFilter,
  isBooleanFilter,
  isMapFilter,
  isNumberFilter,
  isRadiusFilter,
  isStringFilter,
} from '../../../util/filter-utils';
import { MatDialog } from '@angular/material/dialog';
import { EditMapFilterDialogComponent } from '../edit-map-filter-dialog/edit-map-filter-dialog.component';
import { DropdownOption } from '../filter-blocks.component';

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})

export class FilterBlockComponent {
  @Input({ required: true }) filter!: Filter;
  @Output() onChange = new EventEmitter();

  @Input() dropdownOptions?: DropdownOption[];

  keyControl = new FormControl('', [
    Validators.required,
  ]);
  valueControl = new FormControl('', [
    Validators.required,
  ]);

  constructor(private dialog: MatDialog) {}

  filterOperations = Object.keys(FilterOperations);

  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.filter.operation = (FilterOperations as any)[operationKey];
    if (isRadiusFilter(this.filter))
      this.filter.value = {
        center: [13.394096404307541, 52.51601329720293],
        radius: 10,
      };
    if (isAreaFilter(this.filter))
      this.filter.value = {
        vertices: [],
      };
    if (isStringFilter(this.filter)) this.filter.value = '';
    if (isNumberFilter(this.filter)) this.filter.value = 0;
    if (isBooleanFilter(this.filter)) this.filter.value = true;

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

  editMapFilter() {
    const dialogRef = this.dialog.open(EditMapFilterDialogComponent, {
      data: this.filter,
    });

    dialogRef.afterClosed().subscribe((result: AreaFilter | RadiusFilter) => {
      if (!result) return;

      this.filter.operation = result.operation;
      this.filter.value = result.value;
      this.onChange.emit();
    });
  }

  isRadiusFilter(filter?: AnyFilter): filter is RadiusFilter {
    return isRadiusFilter(filter || this.filter);
  }

  isAreaFilter(filter?: AnyFilter): filter is AreaFilter {
    return isAreaFilter(filter || this.filter);
  }

  isMapFilter() {
    return isMapFilter(this.filter);
  }

  isInputFilter(filter?: AnyFilter): filter is StringFilter | NumberFilter {
    return (
      isStringFilter(filter || this.filter) ||
      isNumberFilter(filter || this.filter)
    );
  }

  isStringFilter(filter?: AnyFilter): filter is StringFilter {
    return isStringFilter(filter || this.filter);
  }

  isFormFieldFilter(
    filter?: AnyFilter
  ): filter is StringFilter | NumberFilter | BooleanFilter {
    return (
      this.isInputFilter(filter || this.filter) ||
      this.isBooleanFilter(filter || this.filter)
    );
  }

  isBooleanFilter(filter?: AnyFilter): filter is BooleanFilter {
    return isBooleanFilter(filter || this.filter);
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AreaFilter, RadiusFilter } from '@common/types';

@Component({
  selector: 'app-edit-map-filter-dialog',
  templateUrl: './edit-map-filter-dialog.component.html',
  styleUrls: ['./edit-map-filter-dialog.component.scss'],
})
export class EditMapFilterDialogComponent {
  filter: RadiusFilter | AreaFilter | null;
  constructor(
    public dialogRef: MatDialogRef<EditMapFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RadiusFilter | AreaFilter
  ) {
    this.filter = JSON.parse(JSON.stringify(data));
  }

  onNewFilter(filters: (RadiusFilter | AreaFilter)[]) {
    if (filters.length > 0) this.filter = filters.at(-1)!;
    else this.filter = null;
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    if (this.filter) this.dialogRef.close(this.filter);
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface InputDialogData {
  label: string;
  value: string;
  placeholder: string;
}

/**
 * Dialog component for the input dialog
 */
@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss'],
})
export class InputDialogComponent<InputDialogComponent> {
  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: InputDialogData
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.data.value);
  }
}

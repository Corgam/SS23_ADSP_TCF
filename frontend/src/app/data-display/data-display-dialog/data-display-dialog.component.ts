import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Datafile, NotRefDataFile, RefDataFile } from '@common/types';

@Component({
  selector: 'app-data-display-dialog',
  templateUrl: './data-display-dialog.component.html',
  styleUrls: ['./data-display-dialog.component.scss']
})
export class DataDisplayDialogComponent {

  datafile: RefDataFile | NotRefDataFile;

  constructor(
    public dialogRef: MatDialogRef<DataDisplayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {datafile: RefDataFile | NotRefDataFile},
  ) {
    this.datafile = data.datafile;
  }
}

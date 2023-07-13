import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataDisplayDialogComponent } from './data-display/data-display-dialog/data-display-dialog.component';
import { Datafile, NotRefDataFile, RefDataFile } from '@common/types';
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private readonly dialog: MatDialog) { }

  openDisplayDataDialog(datafile: RefDataFile | NotRefDataFile){
    this.dialog.open(DataDisplayDialogComponent, {
      data: {datafile},
    });

  }
}

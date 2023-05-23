import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  tiles = [
    {title: 'Upload data', icon: 'upload', url: 'upload'},
    {title: 'Edit data', icon: 'edit', url: ''},
    {title: 'Exploration', icon: 'view_in_ar', url: ''},
    {title: 'First draft', icon: 'code', url: 'first-draft'},
  ]
}

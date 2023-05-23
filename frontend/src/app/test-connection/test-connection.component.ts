import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-test-connection',
  templateUrl: './test-connection.component.html',
  styleUrls: ['./test-connection.component.scss']
})
export class TestConnectionComponent implements OnInit{

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
   this.apiService.getData().subscribe(result => console.log(result))
  }

  

}

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// interface modules {
//   id: number;
//   Name: string;
// }

interface moduleList {
  list: Array<any>;
}

@Component({
  selector: 'app-timetable',
  templateUrl: 'timetable.page.html',
  styleUrls: ['timetable.page.scss'],
})
export class TimetablePage {
  movieList: any;

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.getAllTimetable();
  }

  getAllTimetable(): Observable<any> {
    this.http
      .get<moduleList>(
        'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables'
      )
      .subscribe((data) => {
        console.log(data);
        this.movieList = data;
      });

    return this.movieList;
  }
}

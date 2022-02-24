import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';

interface moduleList {
  list: Array<any>;
}

@Component({
  selector: 'app-timetable',
  templateUrl: 'timetable.page.html',
  styleUrls: ['timetable.page.scss'],
})
export class TimetablePage {
  module_id;
  courseId;
  course;
  lecturer: boolean;
  moduleList: any[] = [];
  studentClassList: any[] = [];
  list: any[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.getData('role').then((res) => {
      if (res == 'lecturer') {
        this.lecturer = true;
        this.getClasses();
      } else if (res == 'student') {
        this.lecturer = false;
        this.getCourse();
        this.getStudentClass();
      }
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  getClasses() {
    let resJson;
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        this.http
          .get<moduleList>(
            'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module/' +
              resJson.module_id[i]
          )
          .subscribe((data) => {
            this.list.push(data);
          });
      }
    });

    console.log(this.list);
    return this.list;
  }

  getCourse() {
    let resJson;
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      this.http
        .get(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses/' +
            resJson.CourseID
        )
        .subscribe((data) => {
          this.course = data;
          // console.log(this.course);
          return this.course;
        });
    });
  }

  getStudentClass() {
    this.course = this.getCourse();
    console.log(this.course['moduleList']);
    for (let i = 0; i < this.course['moduleList'].length; i++) {
      this.http
        .get<moduleList>(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module/' +
            this.course.moduleList[i]
        )
        .subscribe((data) => {
          this.studentClassList.push(data);
        });
    }

    console.log(this.studentClassList);
    return this.studentClassList;
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

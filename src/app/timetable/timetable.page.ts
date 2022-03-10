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
    let test = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        let parseValue = parseInt(resJson.module_id[i]);
        test += parseValue + ',';
      }
      let data = {
        test: test.substring(0, test.length - 1),
      };
      this.http
        .post(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
          data
        )
        .subscribe((data) => {
          this.list.push(data);
          console.log(this.list);
        });
    });
    return this.list;
  }

  getCourse() {
    let resJson;
    let test = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      console.log(resJson);
      this.http
        .get(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses/' +
            resJson.CourseID
        )
        .subscribe((data) => {
          console.log(data);
          this.course = data;
          for (let i = 0; i < this.course['moduleList'].length; i++) {
            let parseValue = parseInt(this.course['moduleList'][i]);
            test += parseValue + ',';
          }

          let postData = {
            test: test.substring(0, test.length - 1),
          };
          this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module/',
              postData
            )
            .subscribe((data) => {
              for (let i = 0; i < Object.keys(data).length; i++) {
                this.http
                  .get(
                    'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
                      data[i].data.module_id
                  )
                  .subscribe((res) => {
                    data[i].data.module_name = res['Name'];
                  });
              }
              this.list.push(data);
              console.log(this.list);
            });
        });
      return this.list;
    });
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

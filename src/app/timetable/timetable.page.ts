import { Component, OnInit } from '@angular/core';
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
export class TimetablePage implements OnInit {
  module_id;
  courseId;
  course;
  lecturer: boolean;
  moduleList: any[] = [];
  studentClassList: any[] = [];
  list: any[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.getData('timetableDate').then((date) => {
      this.getData('role').then((res) => {
        if (res == 'lecturer') {
          this.lecturer = true;
          this.getClasses(date);
        } else if (res == 'student') {
          this.lecturer = false;
          this.getCourse();
        }
      });
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  getClasses(date: String) {
    let resJson;
    let text = '';
    let classList = [];
    let timetableList = [];
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        let parseValue = parseInt(resJson.module_id[i]);
        text += parseValue + ',';
      }
      let data = {
        text: text.substring(0, text.length - 1),
      };
      this.http
        .get(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/' +
            date
        )
        .subscribe((res) => {
          res['timetable'].forEach((result) => {
            if (result.active == true) {
              timetableList.push(result);
            }
          });
        });
      this.http
        .post(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
          data
        )
        .subscribe((data) => {
          for (let i = 0; i < Object.keys(data).length; i++) {
            for (let j = 0; j < timetableList.length; j++) {
              if (timetableList[j].class_id == data[i].id) {
                classList.push(data[i]);
              }
            }
          }
          for (let i = 0; i < classList.length; i++) {
            this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
                  classList[i].data.module_id
              )
              .subscribe((res) => {
                classList[i].data.module_name = res['Name'];
              });
          }
          this.list.push(classList);
        });
    });
    return this.list;
  }

  getCourse() {
    let resJson;
    let text = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      this.http
        .get(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses/' +
            resJson.CourseID
        )
        .subscribe((data) => {
          this.course = data;
          for (let i = 0; i < this.course['moduleList'].length; i++) {
            let parseValue = parseInt(this.course['moduleList'][i]);
            text += parseValue + ',';
          }

          let postData = {
            text: text.substring(0, text.length - 1),
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

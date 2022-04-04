import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { time } from 'console';

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
    const today = new Date();
    const lastSunday = today.getDate() - today.getDay();
    const sunday = new Date(today.setDate(lastSunday)).toJSON();
    const dateOnly = sunday.split('T');
    const date = dateOnly[0];

    this.getData('role').then((res) => {
      if (res == 'lecturer') {
        this.lecturer = true;
        this.getClasses(date);
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
      console.log(data);
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
      // console.log(timetableList);
      this.http
        .post(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
          data
        )
        .subscribe((data) => {
          console.log(data);
          for (let j = 0; j < timetableList.length; j++) {
            for (let i = 0; i < Object.keys(data).length; i++) {
              if (timetableList[j].class_id == data[i].id) {
                console.log(data[i]);
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
          console.log(this.list);
        });
    });
    return this.list;
  }

  getCourse() {
    let resJson;
    let text = '';
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
            text += parseValue + ',';
          }

          let postData = {
            text: text.substring(0, text.length - 1),
          };
          console.log(postData);
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

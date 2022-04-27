import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { LoadingController, Platform } from '@ionic/angular';
import { time } from 'console';
// import { TimetableService } from '../services/timetable.service';

@Component({
  selector: 'app-timetable',
  templateUrl: 'timetable.page.html',
  styleUrls: ['timetable.page.scss'],
})
export class TimetablePage {
  module_id;
  courseId;
  course;
  private loading;
  lecturer: boolean;
  moduleList: any[] = [];
  studentClassList: any[] = [];
  list: any[] = [];

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private platform: Platform // private timetableService: TimetableService
  ) {}

  ngOnInit(): void {
    this.getData('timetableDate').then((date) => {
      this.getData('role').then((res) => {
        if (res == 'lecturer') {
          this.lecturer = true;
          this.load(date);
        } else {
          this.load(date);
        }
      });
    });
  }

  getClasses(date: string) {
    let resJson;

    let classList = [];
    let timetableList = [];
    let text = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      this.getData('role').then(async (resp) => {
        if (resp == 'student') {
          let p = this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses/' +
                resJson.CourseID
            )
            .toPromise();

          await p;

          let course;
          await p.then((data) => {
            course = data;
          });

          console.log(date);
          let p2 = this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/' +
                date
            )
            .toPromise();

          await p2;
          await p2.then((res) => {
            res['timetable'].forEach((result) => {
              if (result.active == true) {
                timetableList.push(result);
              }
            });
          });
          console.log(timetableList);
          for (let i = 0; i < course['moduleList'].length; i++) {
            let parseValue = parseInt(course['moduleList'][i]);
            text += parseValue + ',';
          }

          let postData = {
            text: text.substring(0, text.length - 1),
          };

          let p3 = this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module/',
              postData
            )
            .toPromise();

          await p3;

          await p3.then((res) => {
            for (let i = 0; i < Object.keys(res).length; i++) {
              for (let j = 0; j < timetableList.length; j++) {
                if (timetableList[j].class_id == res[i].id) {
                  classList.push(res[i]);
                }
              }
            }
          });

          let promises = [];

          for (let i = 0; i < classList.length; i++) {
            let p = this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
                  classList[i].data.module_id
              )
              .toPromise();
            promises.push(p);
          }

          await Promise.all(promises);

          let count = 0;
          for (let p of promises) {
            p.then((res) => {
              classList[count].data.module_name = res.Name;
              count++;
            });
          }
          this.list.push(classList);
          this.loading.dismiss();
          return this.list;
        } else if (resp == 'lecturer') {
          for (let i = 0; i < resJson.module_id.length; i++) {
            let parseValue = parseInt(resJson.module_id[i]);
            text += parseValue + ',';
          }
          let data = {
            text: text.substring(0, text.length - 1),
          };
          console.log(data);
          let p = this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/' +
                date
            )
            .toPromise();

          await p;
          await p.then((res) => {
            res['timetable'].forEach((result) => {
              if (result.active == true) {
                timetableList.push(result);
              }
            });
          });
          console.log(timetableList);
          let p2 = this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
              data
            )
            .toPromise();

          await p2;

          await p2.then((res) => {
            for (let i = 0; i < Object.keys(res).length; i++) {
              for (let j = 0; j < timetableList.length; j++) {
                if (timetableList[j].class_id == res[i].id) {
                  classList.push(res[i]);
                }
              }
            }
          });
          console.log(classList);
          let promises = [];

          for (let i = 0; i < classList.length; i++) {
            let p = this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
                  classList[i].data.module_id
              )
              .toPromise();
            promises.push(p);
          }

          await Promise.all(promises);

          let count = 0;
          for (let p of promises) {
            p.then((res) => {
              classList[count].data.module_name = res.Name;
              count++;
            });
          }

          this.list.push(classList);
          this.loading.dismiss();
          return this.list;
        }
      });
    });
  }

  load(date: string) {
    var startTime = performance.now();
    this.loadingController
      .create({
        message: 'Loading Data....',
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });
    this.getClasses(date);
    var endTime = performance.now();

    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
  }

  doRefresh(event) {
    let complete = false;
    this.getData('timetableDate').then((date) => {
      this.list = [];
      this.load(date);
      complete = true;
    });

    if ((complete = true)) {
      setTimeout(() => {
        event.target.complete();
      }, 0);
    }
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

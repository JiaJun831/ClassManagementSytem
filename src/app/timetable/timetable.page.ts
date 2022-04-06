import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { LoadingController, Platform } from '@ionic/angular';
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
        }
      });
    });
  }

  ionViewWillEnter() {
    console.log('DIDenter');
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
              if (timetableList[j].active != false) {
                if (timetableList[j].class_id == data[i].id) {
                  classList.push(data[i]);
                }
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
          this.loading.dismiss();
        });
    });
    return this.list;
  }

  load(date: String) {
    this.loadingController
      .create({
        message: 'Loading Data....',
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });
    this.list = this.getClasses(date);
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

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Storage } from '@capacitor/storage';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { LoadingController, Platform } from '@ionic/angular';
import { StatusBarInfo } from '@capacitor/status-bar';
// import { TimetableService } from '../services/timetable.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  firstName: any;
  today: Date;
  time: any;
  day: any;
  list: any[] = [];
  lecturer: boolean;
  private loading;
  numOfClass = 0;
  finish = 0;
  backbutton: any;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private platform: Platform // private timetableService: TimetableService
  ) {}

  openBrowser() {
    Browser.open({ url: 'https://www.dkit.ie/' });
  }

  async ngOnInit() {
    this.setData('timetableDate', this.getSundayOfCurrentWeek());

    this.time = this.getCurrentTime();
    setInterval(() => {
      this.time = this.getCurrentTime();
    }, 1000 * 60);

    if (window.location.href == '/home') {
      this.backbutton = this.platform.backButton.observers.pop();
    }
    // this.presentLoadingWithOptions();

    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');

    if (isPushNotificationsAvailable) {
      //   // Request permission to use push notifications
      //   // iOS will prompt user and return if they granted permission or not
      //   // Android will just grant without prompting

      PushNotifications.requestPermissions().then((result) => {
        this.getData('userID').then((res) => {
          if (result.receive === 'granted') {
            //       // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register();
            FCM.subscribeTo({ topic: 'test' })
              .then()
              .catch((err) => console.log(err));
            FCM.getToken()
              .then()
              .catch((err) => console.log(err));
          } else {
          }
        });
      });

      PushNotifications.addListener('registration', (token: Token) => {
        this.getData('userID').then((res) => {
          let postData = {
            userID: res,
            token: token.value,
          };

          this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/notificationToken',
              postData
            )
            .subscribe((res) => {});
        });
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          alert('Push notification received: ' + notification);
        }
      );
    }

    this.presentLoadingWithOptions();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  getCurrentTime() {
    this.today = new Date();
    return this.today.getHours();
  }

  getToday() {
    this.today = new Date();
    return this.today.getDay();
  }

  getCourse(date: string) {
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
          let p2 = this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/' +
                date
            )
            .toPromise();

          await p2;
          await p2.then((res) => {
            console.log(res);
            res['timetable'].forEach((result) => {
              if (result.active == true) {
                timetableList.push(result);
              }
            });
          });

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
          await this.checkTodayClass();
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
          await this.checkTodayClass();
          this.loading.dismiss();
          return this.list;
        }
      });
    });
  }

  async presentLoadingWithOptions() {
    var startTime = performance.now();
    await this.loadingController
      .create({
        message: 'Please wait...',
        animated: true,
        keyboardClose: true,
        spinner: 'bubbles',
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });

    await this.getData('role').then((res) => {
      if (res == 'lecturer') {
        this.lecturer = true;
      } else {
        this.lecturer = false;
      }
    });

    await this.getData('user').then(async (res) => {
      let resJson = JSON.parse(res);
      this.firstName = resJson.FirstName;
      await this.firstName;
    });

    this.getData('timetableDate').then((date) => {
      this.getCourse(date);
    });
    var endTime = performance.now();

    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
  }

  async checkTodayClass() {
    for (const data of this.list) {
      for (const test of data) {
        if (test.data.timeslot.dayIndex == this.getToday()) {
          this.numOfClass++;
          if (
            parseInt(test.data.timeslot.start_time.substring(0, 2)) < this.time
          ) {
            this.finish++;
          }
        }
      }
    }
  }

  setData(key: string, value: string) {
    // Store the value under "my-key"
    Storage.set({ key: key, value: value });
  }

  getSundayOfCurrentWeek() {
    const today = new Date();
    // Get last sunday date
    const lastSunday = today.getDate() - today.getDay();
    let sunday = new Date(today.setDate(lastSunday));
    // gettimezoneoffset
    const final = sunday.setTime(
      sunday.getTime() - new Date().getTimezoneOffset() * 60 * 1000
    );
    const result = new Date(final).toJSON();
    const dateOnly = result.split('T');
    const date = dateOnly[0];
    return date;
  }
}

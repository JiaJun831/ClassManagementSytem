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
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  firstName: any;
  today: Date;
  time: any;
  course;
  day: any;
  list: any[] = [];
  lecturer: boolean;
  private loading;
  numOfClass = 0;
  finish = 0;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController
  ) {}

  openBrowser() {
    Browser.open({ url: 'https://www.dkit.ie/' });
  }

  ionViewDidEnter() {}

  ngOnInit() {
    this.presentLoadingWithOptions();

    setInterval(() => {
      this.time = this.getCurrentTime();
    }, 1000);

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
            FCM.subscribeTo({ topic: res })
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
          console.log(res);
          let postData = {
            userID: res,
            token: token.value,
          };

          this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/notificationToken',
              postData
            )
            .subscribe((res) => {
              console.log(res);
            });
        });
        // alert('Push registration success, token: ' + token.value);
      });

      // const addListeners = async () => {
      //   await PushNotifications.addListener('registration', (token) => {
      //     console.info('Registration token: ', token.value);
      //   });

      //   await PushNotifications.addListener('registrationError', (err) => {
      //     console.error('Registration error: ', err.error);
      //   });

      //   await PushNotifications.addListener(
      //     'pushNotificationReceived',
      //     (notification) => {
      //       console.log('Push notification received: ', notification);
      //     }
      //   );

      //   await PushNotifications.addListener(
      //     'pushNotificationActionPerformed',
      //     (notification) => {
      //       console.log(
      //         'Push notification action performed',
      //         notification.actionId,
      //         notification.inputValue
      //       );
      //     }
      //   );
      // };
    }
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

  getCourse() {
    let resJson;
    let text = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      this.getData('role').then((resp) => {
        if (resp == 'student') {
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
                  this.loading.dismiss();
                  this.checkTodayClass();
                });
            });
          return this.list;
        } else if (resp == 'lecturer') {
          for (let i = 0; i < resJson.module_id.length; i++) {
            let parseValue = parseInt(resJson.module_id[i]);
            text += parseValue + ',';
          }
          let data = {
            text: text.substring(0, text.length - 1),
          };
          this.http
            .post(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
              data
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
              this.loading.dismiss();

              this.checkTodayClass();
            });
          return this.list;
        }
      });
    });
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  isArray(val: string | any[]): boolean {
    if (val.length > 1) {
      return true;
    }
  }

  presentLoadingWithOptions() {
    this.loadingController
      .create({
        message: 'Please wait...',
        animated: true,
        keyboardClose: true,
        spinner: 'bubbles',
        duration: 2000,
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });

    this.getCourse();
    this.getData('role').then((res) => {
      if (res == 'lecturer') {
        this.lecturer = true;
      } else {
        this.lecturer = false;
      }
    });

    this.getData('user').then((res) => {
      let resJson = JSON.parse(res);
      this.firstName = resJson.FirstName;
    });
  }

  checkTodayClass() {
    // for (let i = 0; i < this.list.length; i++) {
    for (const data of this.list) {
      for (const test of data) {
        if (test.data.timeslot.dayIndex == this.getToday()) {
          this.numOfClass++;
          if (test.data.timeslot.start_time.substring(0, 2) < this.time) {
            this.finish++;
          }
        }
      }
    }
  }
}

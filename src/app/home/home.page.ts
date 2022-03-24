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

interface moduleList {
  list: Array<any>;
}

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
  result = new Map();
  day: any;
  list: any[] = [];
  module_id: any;
  lecturer: boolean;
  constructor(private http: HttpClient) {}

  openBrowser() {
    Browser.open({ url: 'https://www.dkit.ie/' });
  }

  ngOnInit() {
    this.getData('role').then((res) => {
      if (res == 'lecturer') {
        this.lecturer = true;
        this.getCourse();
      } else {
        this.lecturer = false;
        this.getCourse();
      }
    });
    this.getData('user').then((res) => {
      let resJson = JSON.parse(res);
      this.firstName = resJson.FirstName;
    });
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
    let test = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      console.log(resJson);
      this.getData('role').then((resp) => {
        if (resp == 'student') {
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
        } else if (resp == 'lecturer') {
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
}

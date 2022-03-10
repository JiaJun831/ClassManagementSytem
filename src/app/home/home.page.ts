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
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      });

      PushNotifications.addListener('registration', (token: Token) => {
        alert('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          alert('Push received: ' + JSON.stringify(notification));
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          alert('Push action performed: ' + JSON.stringify(notification));
        }
      );
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

  getModuleById(moduleID: any) {}

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  isArray(val: string | any[]): boolean {
    if (val.length > 1) {
      return true;
    }
  }
}

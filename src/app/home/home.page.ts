import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Storage } from '@capacitor/storage';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';

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
  id: any;
  user: any;
  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private platform: Platform,
    private nfc: NFC,
    private alertController: AlertController,
    private ndef: Ndef
  ) {}

  openBrowser() {
    Browser.open({ url: 'https://www.dkit.ie/' });
  }

  async ngOnInit() {
    await this.getData('userID').then((res) => {
      res = this.id;
    });

    this.setData('timetableDate', this.getSundayOfCurrentWeek());

    this.time = this.getCurrentTime();
    setInterval(() => {
      this.time = this.getCurrentTime();
    }, 1000 * 60);

    if (window.location.href == '/home') {
      this.backbutton = this.platform.backButton.observers.pop();
    }
    this.readNFC();
    this.notificationToken();
    this.presentLoadingWithOptions();
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
    let text = '';
    this.getData('user').then((res) => {
      let resJson = JSON.parse(res);
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

          for (let i = 0; i < course['moduleList'].length; i++) {
            let parseValue = parseInt(course['moduleList'][i]);
            text += parseValue + ',';
          }

          let postData = {
            text: text.substring(0, text.length - 1),
          };

          let classList = await this.classList(date, postData);

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
          let postData = {
            text: text.substring(0, text.length - 1),
          };

          let classList = await this.classList(date, postData);
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
          await this.checkTodayClass();
          this.loading.dismiss();
          return this.list;
        }
      });
    });
  }

  async timetableList(date: string) {
    let timetableList = [];
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
    return timetableList;
  }

  async classList(date: string, postData: any) {
    let timetableList = await this.timetableList(date);
    let classList = [];
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
    return classList;
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

  notificationToken() {
    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');

    if (isPushNotificationsAvailable) {
      this.http
        .get(
          `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/notificationToken/${this.id}`
        )
        .subscribe((result) => {
          console.log(result);
          PushNotifications.addListener(
            'registration',
            async (token: Token) => {
              await this.getData('userID').then((res) => {
                let postData = {
                  userID: res,
                  token: token.value,
                };
                if (postData.token != result['token']) {
                  this.http
                    .post(
                      'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/notificationToken',
                      postData
                    )
                    .subscribe((res) => {});
                }
              });
            }
          );
        });
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
          this.getData('user').then(async (user) => {
            let userJSON = JSON.parse(user);
            this.http
              .get(
                `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses/${userJSON.CourseID}`
              )
              .subscribe((res) => {
                FCM.subscribeTo({ topic: res['name'].replace(/\s/g, '') })
                  .then()
                  .catch((err) => console.log(err));
                this.ndef;
              });
          });
        }
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          alert(
            'Push notification received: ' +
              notification.title +
              ' ' +
              notification.body
          );
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          alert(
            'Push notification received: ' + notification.notification.title
          );
        }
      );
    }
  }

  readNFC() {
    let text = '';
    let classList = [];
    let attendance = false;
    this.getData('role').then(async (role) => {
      if (role == 'student') {
        console.log('Is Student');
        this.getData('user').then(async (res) => {
          let resJson = JSON.parse(res);
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
          for (let i = 0; i < course['moduleList'].length; i++) {
            let parseValue = parseInt(course['moduleList'][i]);
            text += parseValue + ',';
          }

          let postData = {
            text: text.substring(0, text.length - 1),
          };
          await this.getData('timetableDate').then(async (date) => {
            date = date;
            classList = await this.classList(date, postData);

            this.nfc
              .addNdefListener(
                () => {
                  // this.presentAlert('ok');
                },
                (err) => {
                  this.presentAlert('Error : ' + err);
                }
              )
              .subscribe(async (event) => {
                await this.getData('userID').then(async (id) => {
                  let classroom = this.nfc
                    .bytesToString(event.tag.ndefMessage[0].payload)
                    .substring(3);

                  for (let i = 0; i < classList.length; i++) {
                    if (
                      classList[i].data.timeslot.dayIndex == this.getToday() &&
                      classList[i].data.timeslot.start_time.substring(0, 2) <=
                        this.getCurrentTime() &&
                      classList[i].data.timeslot.end_time.substring(0, 2) >=
                        this.getCurrentTime() &&
                      classList[i].data.timeslot.classroom == classroom
                    ) {
                      console.log('Class found');
                      let class_id = classList[i].id;
                      attendance = true;
                      console.log(
                        `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/updateTimetables/${date}/${class_id}}/${id}`
                      );
                      this.http
                        .get(
                          `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/updateTimetables/${date}/${class_id}/${id}`
                        )
                        .subscribe((res) => {
                          this.presentAlert('Sign Attendance Success.');
                        });
                    }
                  }
                  if (attendance == false) {
                    console.log('No class in this time : ' + classroom);
                    this.presentAlert('No class in this time : ' + classroom);
                  }
                });
              });
          });
        });
      }
    });
  }

  async presentAlert(mess) {
    const alert = await this.alertController.create({
      header: 'attention',
      message: mess,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

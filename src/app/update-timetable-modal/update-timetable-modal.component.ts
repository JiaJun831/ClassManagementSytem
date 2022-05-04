import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
@Component({
  selector: 'app-update-timetable-modal',
  templateUrl: './update-timetable-modal.component.html',
  styleUrls: ['./update-timetable-modal.component.scss'],
})
export class UpdateTimetableModalComponent implements OnInit {
  @Input() class_id: number;
  @Input() module_id: number;
  @Input() module_name: string;
  updateForm: FormGroup;
  isSubmitted = false;
  timetableCheck = 0;
  roomCheck = 0;

  courseList: any[] = [];
  day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timetable: any[] = [];
  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.updateForm = new FormGroup({
      classroom: new FormControl('', Validators.required),
      dayIndex: new FormControl('1'),
      end_time: new FormControl('10:00', Validators.required),
      start_time: new FormControl('09:00', Validators.required),
      day: new FormControl(),
    });
  }
  dismissModal() {
    this.modalController.dismiss();
  }
  async presentAlertRadio() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header:
        'Do you want to change only this occurrence of the event, or this and all future occurrences?',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Only This Week',
          value: 'week',
          checked: false,
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'All Future Classes',
          value: 'all',
          checked: false,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Ok',
          handler: (alertData) => {
            this.updateClass(alertData);
          },
        },
      ],
    });

    await alert.present();
  }

  get errorControl() {
    return this.updateForm.controls;
  }

  async updateClass(updateWeek: String) {
    const today = new Date();
    this.isSubmitted = true;
    if (!this.updateForm.valid) {
      const alert = await this.alertController.create({
        header: 'Please provide all the required values!',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
      return false;
    } else {
      if (today.getDay > this.updateForm.value.dayIndex) {
        const startTime = this.updateForm.value.start_time.split('T');
        const endTime = this.updateForm.value.end_time.split('T');
        if (startTime > endTime) {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header:
              'We dont have a time machine, your end time should not be earlier than your start time.',
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                cssClass: 'secondary',
              },
            ],
          });
          await alert.present();
        } else {
          const updateDate = {
            module_id: this.module_id,
            module_name: this.module_name.replace(/\s/g, ''),
            timeslot: {
              start_time: startTime[0],
              classroom: this.updateForm.value.classroom,
              dayIndex: parseInt(this.updateForm.value.dayIndex),
              end_time: endTime[0],
              day: this.day[this.updateForm.value.dayIndex - 1],
            },
          };

          this.getData('timetableDate').then(async (date) => {
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
                  this.timetable.push(result);
                }
              });
            });

            let p2 = this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes'
              )
              .toPromise();

            await p2;
            await p2.then((res) => {
              for (let i = 0; i < Object.keys(res).length; i++) {
                for (let j = 0; j < this.timetable.length; j++) {
                  if (res[i].id == this.timetable[j].class_id) {
                    if (
                      res[i].data.timeslot.classroom ==
                        updateDate.timeslot.classroom &&
                      res[i].data.timeslot.dayIndex ==
                        updateDate.timeslot.dayIndex
                    ) {
                      if (
                        (res[i].data.timeslot.start_time.substring(0, 2) >
                          updateDate.timeslot.start_time.substring(0, 2) &&
                          res[i].data.timeslot.end_time.substring(0, 2) <
                            updateDate.timeslot.end_time.substring(0, 2)) ||
                        (res[i].data.timeslot.start_time.substring(0, 2) >
                          updateDate.timeslot.start_time.substring(0, 2) &&
                          res[i].data.timeslot.end_time.substring(0, 2) >
                            updateDate.timeslot.end_time.substring(0, 2)) ||
                        (res[i].data.timeslot.start_time.substring(0, 2) <
                          updateDate.timeslot.start_time.substring(0, 2) &&
                          res[i].data.timeslot.end_time.substring(0, 2) <
                            updateDate.timeslot.end_time.substring(0, 2))
                      ) {
                        this.roomCheck += 0;
                      } else {
                        this.roomCheck += 1;
                      }
                    }
                  } else {
                    this.roomCheck += 0;
                  }
                }
              }
            });

            let p3 = this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/courses'
              )
              .toPromise();
            await p3;
            await p3.then((res) => {
              for (let i = 0; i < Object.keys(res).length; i++) {
                if (res[i].data.moduleList.includes(this.module_id)) {
                  this.courseList = res[i].data.moduleList;
                }
              }
            });

            let courseTimetableList = [];
            await p2;
            await p2.then((res2) => {
              for (let i = 0; i < Object.keys(res2).length; i++) {
                for (let j = 0; j < this.courseList.length; j++) {
                  if (res2[i].data.module_id == this.courseList[j]) {
                    courseTimetableList.push(res2[i]);
                  }
                }
              }
            });

            for (let i = 0; i < courseTimetableList.length; i++) {
              for (let j = 0; j < this.timetable.length; j++) {
                if (courseTimetableList[i].id == this.timetable[j].class_id) {
                  if (
                    courseTimetableList[i].data.timeslot.dayIndex ==
                    updateDate.timeslot.dayIndex
                  ) {
                    console.log(courseTimetableList[i]);
                    if (
                      (courseTimetableList[
                        i
                      ].data.timeslot.start_time.substring(0, 2) >
                        updateDate.timeslot.start_time.substring(0, 2) &&
                        courseTimetableList[i].data.timeslot.end_time.substring(
                          0,
                          2
                        ) < updateDate.timeslot.end_time.substring(0, 2)) ||
                      (courseTimetableList[
                        i
                      ].data.timeslot.start_time.substring(0, 2) >
                        updateDate.timeslot.start_time.substring(0, 2) &&
                        courseTimetableList[i].data.timeslot.end_time.substring(
                          0,
                          2
                        ) > updateDate.timeslot.end_time.substring(0, 2)) ||
                      (courseTimetableList[
                        i
                      ].data.timeslot.start_time.substring(0, 2) <
                        updateDate.timeslot.start_time.substring(0, 2) &&
                        courseTimetableList[i].data.timeslot.end_time.substring(
                          0,
                          2
                        ) < updateDate.timeslot.end_time.substring(0, 2))
                    ) {
                      this.timetableCheck += 0;
                    } else {
                      this.timetableCheck += 1;
                    }
                  } else {
                    this.timetableCheck += 0;
                  }
                } else {
                  this.timetableCheck += 0;
                }
              }
            }

            console.log(this.roomCheck);
            console.log(this.timetableCheck);
            if (this.roomCheck == 0 && this.timetableCheck == 0) {
              if (updateWeek == 'week') {
                this.http
                  .post(
                    `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/${date}/${this.class_id}`,
                    { newClass: updateDate }
                  )
                  .subscribe(async (res) => {
                    const alert = await this.alertController.create({
                      header: 'Update Complete',
                      buttons: [
                        {
                          text: 'Ok',
                          role: 'cancel',
                          handler: () => {
                            this.dismissModal();
                          },
                        },
                      ],
                    });
                    await alert.present();
                  });
              } else {
                this.http.post(
                  `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/default/${this.class_id}`,
                  { newClass: updateDate }
                );
              }
            } else if (this.timetableCheck >= 1) {
              const alert = await this.alertController.create({
                header: 'Cant update -  Timetable duplicated.',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                  },
                ],
              });
              await alert.present();
            } else if (this.roomCheck >= 1) {
              const alert = await this.alertController.create({
                header: 'Cant update -  Room not available.',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                  },
                ],
              });
            }
          });
        }
      } else {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Cant update to that day, since it already pass.',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
              cssClass: 'secondary',
            },
          ],
        });
        await alert.present();
      }
    }
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

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

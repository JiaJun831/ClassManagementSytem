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
  check = false;
  day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timetableList: any[] = [];
  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
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
                  this.timetableList.push(result);
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
                for (let j = i; j < this.timetableList.length; j++) {
                  if (res[i].id == this.timetableList[i].class_id) {
                    if (
                      res[i].data.timeslot.classroom ==
                      updateDate.timeslot.classroom
                    ) {
                      if (
                        res[i].data.timeslot.dayIndex ==
                        updateDate.timeslot.dayIndex
                      ) {
                        console.log(res[i]);
                        if (
                          (res[i].data.timeslot.start_time.substring(0, 2) >
                            updateDate.timeslot.start_time.substring(0, 2) &&
                            res[i].data.timeslot.end_time.substring(0, 2) <
                              updateDate.timeslot.end_time.substring(0, 2)) ||
                          (res[i].data.timeslot.start_time.substring(0, 2) >
                            updateDate.timeslot.start_time.substring(0, 2) &&
                            res[i].data.timeslot.end_time.substring(0, 2) >
                              updateDate.timeslot.end_time.substring(0, 2)) ||
                          updateDate.timeslot.start_time.substring(0, 2) >=
                            res[i].data.timeslot.end_time.substring(0, 2)
                        ) {
                          this.check = true;
                        } else {
                          this.check = false;
                        }
                      } else {
                        this.check = true;
                      }
                    }
                  } else {
                    if (
                      res[i].data.timeslot.dayIndex ==
                      updateDate.timeslot.dayIndex
                    ) {
                      console.log(res[i]);
                      if (
                        (res[i].data.timeslot.start_time.substring(0, 2) >
                          updateDate.timeslot.start_time.substring(0, 2) &&
                          res[i].data.timeslot.end_time.substring(0, 2) <
                            updateDate.timeslot.end_time.substring(0, 2)) ||
                        (res[i].data.timeslot.start_time.substring(0, 2) >
                          updateDate.timeslot.start_time.substring(0, 2) &&
                          res[i].data.timeslot.end_time.substring(0, 2) >
                            updateDate.timeslot.end_time.substring(0, 2)) ||
                        updateDate.timeslot.start_time.substring(0, 2) >=
                          res[i].data.timeslot.end_time.substring(0, 2)
                      ) {
                        this.check = true;
                      } else {
                        this.check = false;
                      }
                    } else {
                      this.check = true;
                    }
                  }
                }
              }
            });
            if (this.check == true) {
              if (updateWeek == 'week') {
                this.http
                  .post(
                    `http://localhost:5000/attendancetracker-a53a9/us-central1/api/timetables/${date}/${this.class_id}`,
                    // `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/${date}/${this.class_id}`,
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
            } else {
              const alert = await this.alertController.create({
                header: 'Cant update',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                  },
                ],
              });
              await alert.present();
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
  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

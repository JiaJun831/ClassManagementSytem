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
  updateForm: FormGroup;
  isSubmitted = false;
  day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.updateForm = new FormGroup({
      classroom: new FormControl('', Validators.required),
      dayIndex: new FormControl(''),
      end_time: new FormControl('', Validators.required),
      start_time: new FormControl('', Validators.required),
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
    this.isSubmitted = true;
    if (!this.updateForm.valid) {
      const alert = this.alertController.create({
        header: 'Please provide all the required values!',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
        ],
      });
      return false;
    } else {
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
      } else {
        const updateDate = {
          module_id: this.module_id,
          timeslot: {
            start_time: startTime,
            classroom: this.updateForm.value.classroom,
            dayIndex: parseInt(this.updateForm.value.dayIndex),
            end_time: endTime,
            day: this.day[this.updateForm.value.dayIndex - 1],
          },
        };
        this.getData('timetableDate').then((date) => {
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
        });
      }
    }
  }
  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

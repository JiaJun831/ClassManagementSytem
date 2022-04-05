import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { LoadingController, ModalController } from '@ionic/angular';
import { UpdateTimetableModalComponent } from '../update-timetable-modal/update-timetable-modal.component';

interface moduleList {
  list: Array<any>;
}

@Component({
  selector: 'app-modify-timetable',
  templateUrl: './modify-timetable.page.html',
  styleUrls: ['./modify-timetable.page.scss'],
})
export class ModifyTimetablePage implements OnInit {
  list: any[] = [];
  private loading;

  constructor(
    private http: HttpClient,
    public modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.getData('timetableDate').then((date) => {
      this.load(date);
    });
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

  async openModal(class_id: number, module_id: number) {
    let modal = await this.modalController.create({
      component: UpdateTimetableModalComponent,
      componentProps: {
        class_id: class_id,
        module_id: module_id,
      },
    });
    modal.onDidDismiss().then((res) => {
      this.getData('timetableDate').then((date) => {
        this.list = [];
        this.load(date);
      });
    });
    return await modal.present();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
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
    this.getClasses(date);
  }
}

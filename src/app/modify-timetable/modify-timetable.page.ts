import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { LoadingController, ModalController } from '@ionic/angular';
import { UpdateTimetableModalComponent } from '../update-timetable-modal/update-timetable-modal.component';

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
    this.getData('user').then(async (res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        let parseValue = parseInt(resJson.module_id[i]);
        text += parseValue + ',';
      }
      let data = {
        text: text.substring(0, text.length - 1),
      };
      console.log(data);
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
      this.loading.dismiss();
      return this.list;
    });
  }

  async openModal(class_id: number, module_id: number, module_name: string) {
    let modal = await this.modalController.create({
      component: UpdateTimetableModalComponent,
      componentProps: {
        class_id: class_id,
        module_id: module_id,
        module_name: module_name,
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

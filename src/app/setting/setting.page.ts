import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { Storage } from '@capacitor/storage';
@Component({
  selector: 'app-setting',
  templateUrl: 'setting.page.html',
  styleUrls: ['setting.page.scss'],
})
export class SettingPage {
  constructor(public router: Router) {}
  firstLetter;

  ngOnInit() {
    this.getData('user').then((res) => {
      let jsonRes = JSON.parse(res);
      this.firstLetter = jsonRes.FirstName.substring(0, 1);
    });
  }

  logout() {
    this.router.navigate(['../login']);
    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'role' });
    Storage.remove({ key: 'userID' });
    PushNotifications.removeAllListeners();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

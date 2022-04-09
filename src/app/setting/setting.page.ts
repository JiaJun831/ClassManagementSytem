import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { Storage } from '@capacitor/storage';
import { AuthServiceService } from '../services/auth-service.service';
@Component({
  selector: 'app-setting',
  templateUrl: 'setting.page.html',
  styleUrls: ['setting.page.scss'],
})
export class SettingPage {
  constructor(public router: Router, private authService: AuthServiceService) {}
  firstLetter;

  ngOnInit() {
    this.getData('user').then((res) => {
      let jsonRes = JSON.parse(res);
      this.firstLetter = jsonRes.FirstName.substring(0, 1);
    });
  }
  ionViewWillEnter() {
    console.log('Enter');
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['../login'], { replaceUrl: true });
    // Storage.remove({ key: 'user' });
    // Storage.remove({ key: 'role' });
    // Storage.remove({ key: 'userID' });
    Storage.clear();
    PushNotifications.removeAllListeners();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}

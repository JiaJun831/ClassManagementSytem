import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public loadingCtrl: LoadingController) {}

  openBrowser() {
    Browser.open({ url: 'https://www.dkit.ie/' });
  }

  // ngOnInit() {
  //   this.presentLoadingDefault();
  // }
}

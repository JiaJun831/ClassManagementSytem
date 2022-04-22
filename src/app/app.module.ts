import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { UpdateTimetableModalComponent } from './update-timetable-modal/update-timetable-modal.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AttendanceModalComponent } from './attendance-modal/attendance-modal.component';
import { NFC } from '@awesome-cordova-plugins/nfc/ngx';
@NgModule({
  declarations: [
    AppComponent,
    UpdateTimetableModalComponent,
    AttendanceModalComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.config),
    AngularFireAuthModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    HttpClient,
    NFC,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

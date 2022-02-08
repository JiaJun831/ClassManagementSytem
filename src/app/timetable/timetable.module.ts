import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetablePage } from './timetable.page';

import { TimetablePageRoutingModule } from './timetable-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: TimetablePage }]),
    TimetablePageRoutingModule,
  ],
  declarations: [TimetablePage],
})
export class Tab2PageModule {}

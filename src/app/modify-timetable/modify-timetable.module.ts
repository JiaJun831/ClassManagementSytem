import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModifyTimetablePageRoutingModule } from './modify-timetable-routing.module';

import { ModifyTimetablePage } from './modify-timetable.page';
import { UpdateTimetableModalComponent } from '../update-timetable-modal/update-timetable-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModifyTimetablePageRoutingModule,
  ],
  declarations: [ModifyTimetablePage, UpdateTimetableModalComponent],
  entryComponents: [UpdateTimetableModalComponent],
})
export class ModifyTimetablePageModule {}

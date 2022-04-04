import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { PhotoListComponent } from './photo-list/photo-list.component';

@NgModule({
  declarations: [PhotoUploadComponent, PhotoListComponent],
  imports: [CommonModule],
  exports: [PhotoUploadComponent, PhotoListComponent],
})
export class ComponentsModule {}

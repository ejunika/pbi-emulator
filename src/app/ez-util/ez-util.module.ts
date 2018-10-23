import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../ez-util/components/dropdown/dropdown.component';
import { FilterPipe } from './pipes/filter.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    DropdownComponent
  ],
  declarations: [DropdownComponent, FilterPipe]
})
export class EzUtilModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../ez-util/components/dropdown/dropdown.component';
import { FilterPipe } from './pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AccordionComponent } from './components/accordion/accordion.component';
import { DummyComponent } from './components/dummy/dummy.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AngularFontAwesomeModule
  ],
  exports: [
    DropdownComponent,
    AccordionComponent,
    DummyComponent
  ],
  declarations: [DropdownComponent, FilterPipe, AccordionComponent, DummyComponent],
  entryComponents: [
    DummyComponent
  ]
})
export class EzUtilModule { }

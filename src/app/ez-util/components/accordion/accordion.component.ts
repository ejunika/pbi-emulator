import { Component, OnInit, Input } from '@angular/core';
import { Accordion } from './accordion-data-models';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit {

  @Input('accordion')
  accordion: Accordion;

  constructor() { }

  ngOnInit() {

  }

}

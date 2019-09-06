import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, Inject } from '@angular/core';
import { DropdownItem } from './dropdown-item';
import { DropdownConfig } from './dropdown-config';
import { DropdownEvent } from 'bootstrap';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';

declare const $: any;
const DD_ON_SHOW: DropdownEvent = 'show.bs.dropdown';

@Component({
  selector: 'ez-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  selectedItem: DropdownItem;

  searchText: string;

  @Input('ddItems')
  ddItems: Array<DropdownItem>;

  @Input('ddConfig')
  ddConfig: DropdownConfig;

  @Input('vpn')
  vpn: string;

  @Input('uidpn')
  uidpn: string;

  @Input('ddlText')
  ddlText: string;

  @Input('copyTextEnabled')
  copyTextEnabled: boolean;

  @Output('onItemChange')
  onItemChange: EventEmitter<Array<DropdownItem> | DropdownItem> = new EventEmitter<Array<DropdownItem> | DropdownItem>();

  @Input('selectedItem')
  set _selectedItem(item: DropdownItem) {
    this.selectedItem = item;
  }

  @ViewChild('ezDropdown')
  ezDropdown: ElementRef;

  @ViewChild('searchTextInput')
  searchTextInput: ElementRef;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    this.initListeners();
    if (!this.selectedItem) {
      this.selectedItem = {};
    }
  }

  selectItem(item: DropdownItem): void {
    if (this.selectedItem) {
      _.extend(this.selectedItem, item);
    }
    this.onItemChange.emit(this.selectedItem);
  }

  initListeners(): void {
    $(this.ezDropdown.nativeElement).on(DD_ON_SHOW, e => {
      setTimeout(() => {
        if (this.searchTextInput) {
          $(this.searchTextInput.nativeElement).focus();
          this.searchText = '';
        }
      }, 0);
    });
  }

  copyText(copierInput: HTMLInputElement): void {
    copierInput.select();
    this.document.execCommand('copy');
  }

}

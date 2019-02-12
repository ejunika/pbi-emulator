import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { HelpComponent } from './help/help.component';

@Injectable()
export class ConfirmDialogService implements CanActivate, CanDeactivate<HelpComponent> {

  constructor() { }

  canActivate(): boolean {
    return true;
  }

  canDeactivate(x: HelpComponent): boolean {
    return true;
  }

}

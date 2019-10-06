import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ScriptLoaderService {

  constructor() { }

  loadScriptSnipet(snipet: string): void {
    let script: any = document.createElement('script');
    script.type = 'text/javascript';
    script.append(snipet);
    document.getElementsByTagName('head')[0].appendChild(script);
  }

}

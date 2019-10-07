import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss']
})
export class ScriptEditorComponent implements OnInit {

  constructor(private scriptLoaderService: ScriptLoaderService) { }

  ngOnInit() {
    this.scriptLoaderService.loadScriptSnipet('console.log(report)');
  }

}

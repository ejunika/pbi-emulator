import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';


const THEME = 'ace/theme/github';
const LANG = 'ace/mode/javascript';

@Component({
  selector: 'app-ace',
  template: `
    <div #editor id="editor"></div>
  `,
  styles: ['#editor { height: 500px; width: 100% }']
})
export class AceComponent implements OnInit {

  @ViewChild('editor') editorElementRef: ElementRef;

  constructor() { }

  ngOnInit() {
    const editorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 10,
      maxLines: Infinity,
    };
    let editor = ace.edit(this.editorElementRef.nativeElement, editorOptions);
    editor.setTheme(THEME);
    editor.getSession().setMode(LANG);
    editor.setShowFoldWidgets(true);
  }

}

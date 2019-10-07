import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  dontShowNextTime: boolean = true;

  constructor(
    private localStorage: LocalStorage,
    private router: Router
  ) { }

  ngOnInit() {

  }

  start(): void {
    if (this.dontShowNextTime) {
      this.localStorage.setItem('dontShowNextTime', true)
        .subscribe((isDone: boolean) => {
          if (isDone) {
            this.router.navigate(['home']);
          }
        });
    }
  }

}

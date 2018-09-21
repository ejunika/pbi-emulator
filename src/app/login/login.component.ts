import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  clientId: string;
  username: string;
  password: string;

  constructor(
    private dataService: DataService,
    private localStorage: LocalStorage
  ) { }

  ngOnInit() {

  }

  login(): void {
    if (this.clientId && this.username && this.password) {
      this.dataService.login(this.clientId, this.username, this.password).subscribe(res => {
        this.localStorage.setItem('azureToken', res.token);
      });
    }
  }

}

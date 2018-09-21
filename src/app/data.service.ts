import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  serverConfig: any;
  restUrls: any;
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = this.buildBaseUrl();
  }

  getRestUrls(): any {
    return this.restUrls;
  }

  login(clientId: string, username: string, password: string): Observable<any> {
    return this.http.post('https://login.microsoftonline.com/common/oauth2/token', this.transformData({
      grant_type: 'password',
      resource: 'https://analysis.windows.net/powerbi/api',
      client_id: clientId,
      username: username,
      password: password
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  transformData(data: any): string {
    let formUrlData = '';
    if (data) {
      for (let key in data) {
        formUrlData += encodeURIComponent(key)+"="+encodeURIComponent(data[key])+"&";
      }
    }
    return formUrlData
  }

  buildBaseUrl(): string {
    let baseUrl;
    if (this.serverConfig) {
      if (this.serverConfig.sslEnabled) {
        baseUrl = 'https://';
      } else {
        baseUrl = 'http://';
      }
      if (this.serverConfig.domain) {
        baseUrl += this.serverConfig.domain;
        if (this.serverConfig.port) {
          baseUrl += ':' + this.serverConfig.port;
        }
        baseUrl += '/';
      }
      if (this.serverConfig.appContext) {
        baseUrl += this.serverConfig.appContext + '/';
      }
      if (this.serverConfig.restContext) {
        baseUrl += this.serverConfig.restContext + '/';
      }
    } else {
      baseUrl = 'https://api.powerbi.com/v1.0/';
    }
    return baseUrl;
  }

  post(data: any, url: string, urlParams?: string | string[], searchParams?: {}): Observable<any> {
    return this.http.post<any>(this.buildUrl(url, urlParams, searchParams), data);
  }

  buildUrl(url: string, urlParams?: string | string[], searchParams?: {}): string {
    if (urlParams) {
      for (let i = 0; i < urlParams.length; i++) {
        url += '/' + urlParams[i];
      }
    }
    if (searchParams) {
      url += '?';
      for (const key in searchParams) {
        if (searchParams[key]) {
          url += key + '=' + searchParams[key] + '&';
        }
      }
      if (url.lastIndexOf('&') === url.length - 1) {
        url = url.substr(0, url.length -  1);
      }
    }
    if (!url.startsWith('http')) {
      url = this.baseUrl + url;
    }
    return url;
  }

  get(url: string, urlParams?: string | string[], searchParams?: {}): Observable<any> {
    return this.http.get<any>(this.buildUrl(url, urlParams, searchParams));
  }

}

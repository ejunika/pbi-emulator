import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class GroupService {

  tanentMap = new Map<string, string>();

  constructor(
    private localStorage: LocalStorage
  ) {
    this.localStorage.getItem('districtList').subscribe(districtList => {
      if (districtList) {
        for (let i = 0; i < districtList.length; i++) {
          this.tanentMap.set(districtList[i].uid, districtList[i].name);
        }
      }
    });
    // this.tanentMap.set('11E87A5D-A05F-CE72-8374-010000000000', 'Arizona');
    // this.tanentMap.set('11E85DFB-DA8F-26E1-8374-010000000000', 'Mount Desert');
    // this.tanentMap.set('11E87A4E-2454-4658-8374-010000000000', 'California');
  }

  transform(groups: Array<any>): Array<any> {
    let mappedGroups: Array<any>;
    if (groups) {
      mappedGroups = groups.map(group => {
        group.tanentName = this.tanentMap.get(group.name);
        return group;
      });
      return mappedGroups.sort((a, b) => a.tanentName - b.tanentName);
    }
  }

}

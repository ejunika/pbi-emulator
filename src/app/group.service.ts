import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { IGroup } from './app-models';

@Injectable()
export class GroupService {

  tenantMap = new Map<string, string>();

  constructor(
    private localStorage: LocalStorage
  ) {
    this.localStorage.getItem('districtList')
      .subscribe(districtList => {
        if (districtList) {
          for (let i = 0; i < districtList.length; i++) {
            this.tenantMap.set(districtList[i].uid, districtList[i].name);
          }
        }
      });
  }

  transform(groups: Array<IGroup>): Array<IGroup> {
    let mappedGroups: Array<IGroup>;
    if (groups) {
      mappedGroups = groups.map((group: IGroup) => {
        group.tenantName = this.tenantMap.get(group.name) || group.name;
        return group;
      });
      return mappedGroups.sort((a: IGroup, b: IGroup) => b.tenantName.localeCompare(a.tenantName));
    }
  }

}

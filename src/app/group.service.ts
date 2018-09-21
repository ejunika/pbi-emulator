import { Injectable } from '@angular/core';

@Injectable()
export class GroupService {

  tanentMap = new Map<string, string>();

  constructor() {
    this.tanentMap.set('11E87A5D-A05F-CE72-8374-010000000000', 'Arizona');
    this.tanentMap.set('11E85DFB-DA8F-26E1-8374-010000000000', 'Mount Desert');
    this.tanentMap.set('11E87A4E-2454-4658-8374-010000000000', 'California');
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

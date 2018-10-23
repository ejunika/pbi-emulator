import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: Array<any>, ...args: Array<any>): Array<any> {
    if (!items) {
      return [];
    }
    if (!args[0]) {
      return items;
    }
    let searchText = args[0].toLowerCase();
    let searchProperty = args[1];
    if (searchProperty) {
      return items.filter(item => {
        let value = item[searchProperty];
        if (value) {
          return value.toString().toLowerCase().includes(searchText)
        } else {
          return false;
        }
      });
    } else {
      return items.filter(item => {
        if (typeof item === 'object') {
          let values = Object.values(item);
          for (let key in values) {
            let value: string = <string>values[key];
            if (value && value.toString().toLowerCase().includes(searchText)) {
              return true;
            }
          }
          return false;
        } else {
          return items.filter(item => {
            if (item) {
              return item.toString().toLowerCase().includes(searchText);
            } else {
              return false;
            }
          });
        }
      });
    }
  }

}

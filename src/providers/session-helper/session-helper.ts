import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
/*
  Generated class for the SessionHelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SessionHelperProvider {

  constructor(private storage: Storage) {
    console.log('Hello SessionHelperProvider Provider');
  }


  SaveValueInSession(key , value){
   return this.storage.set(key, value);
  }

  GetApiUrl() {
    return this.storage.get('AppUrl').then((val) => {
       return val;
    });
  }

  GetBackImages(){
    return this.storage.get('IMAGES').then((val) => {
      console.log("BACK IMAGES" , val);
      return val;
      
   });
  }

  GetValuesFromSession(key){
    return this.storage.get(key).then((val) => {
      console.log("Key" ,key+":- " , val);
      return val;
   });
  }




}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { LoadingController } from 'ionic-angular' ;

/*
  Generated class for the ApiHelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiHelperProvider {
  loading = null ;
  apiUrl = 'http://50.63.172.206/API/Test/';

  constructor(public http: HTTP , public loadingCtrl: LoadingController) {
    console.log('Hello ApiHelperProvider Provider');
   // this.http.setRequestTimeout(100000);
  }

  public RequestPostHttp(data1: any , endpoint , loaderShow){

    if(loaderShow){
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...',
      });
     this.loading.present();
    }

    this.http.setRequestTimeout(600);
    console.log("** API URL" , this.apiUrl+endpoint);
     return this.http.post(this.apiUrl+endpoint, data1,{})
        .then(data => {
          if(loaderShow){
            this.loading.dismiss();
          }
          return JSON.parse(data.data);
          
        })
        .catch(error => {
          if(loaderShow){
            this.loading.dismiss();
          }
          console.log("Error",error.status);
          console.log("Error error",error.error); 
          return JSON.parse(error.status);
         // error message as string
         
      
        });


}

private SendResponse(res:any){
  this.loading.dismiss();
  return res ;
}

private handleError (error: any) {
  this.loading.dismiss();
  // Could dig deeper into the error to get a better message or use a remote logging infrastructure
  let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
  console.error("ERROR",errMsg); // log to console instead
  return Observable.throw(errMsg);
}

}

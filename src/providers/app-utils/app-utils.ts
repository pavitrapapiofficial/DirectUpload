import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
/*
  Generated class for the AppUtilsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppUtilsProvider {

  ScreenHeaders: any = [];

  constructor(private datePipe: DatePipe, private decimalPipe: DecimalPipe, public alertCtrl: AlertController,
    public toastctrl: ToastController) {
    console.log('Hello AppUtilsProvider Provider');
  }


  GetCurrentDateTime() {

    var datetime = this.datePipe.transform(new Date(), 'yyyy-MM-dd hh:mm:ss.000', 'GMT+00:00');
    return datetime;

  }

  GetFeatureDateFormat(date) {
    var datetime = this.datePipe.transform(date, 'd MMM y');
    //  console.log("FORMATED",datetime);
    return datetime;
  }


  twoDecimals(number) {
    return this.decimalPipe.transform(number, '1.2-2');
  }

  presentToast(msg){
  
    let toast = this.toastctrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {

    });
    toast.present();

  }


  AddScreenHeader(title, type, typeid) {

    this.ScreenHeaders.push({
      header_title: title,
      header_type: type,
      header_type_id: typeid
    });

  }


  generateRandomValue(min: number,
    max: number): number {
    let maxVal: number = max,
      minVal: number = min,
      genVal: number;


    // Generate max value
    if (maxVal === 0) {
      maxVal = maxVal;
    }
    else {
      maxVal = 1;
    }


    // Generate min value
    if (minVal) {
      minVal = minVal;
    }
    else {
      minVal = 0;
    }

    genVal = minVal + (maxVal - minVal) * Math.random();

    return genVal;
  }

  presentBasicAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Dismiss']
    });
    alert.present();
  }


  empty(v) {
    let type = typeof v;
    if(type === 'undefined') {
        return true;
    }
    if(type=== 'boolean') {
        return !v;
    }
    if(v === null) {
        return true;
    }
    if(v === undefined) {
        return true;
    }
    if(v instanceof Array) {
        if(v.length < 1) {
            return true;
        }
    }
    else if(type === 'string') {
        if(v.length < 1) {
            return true;
        }
        if(v==='0') {
            return true;
        }
    }
    else if(type === 'object') {
        if(Object.keys(v).length < 1) {
            return true;
        }
    }
    else if(type === 'number') {
        if(v===0) {
            return true;
        }
    }
    return false;

   // Considers undefined, null, false, 0, 0.0, "0" {}, [] as empty.

  //  "0.0", NaN, " ", true are considered non-empty.

}

}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ApiHelperProvider , SessionHelperProvider , ConfigTablesProvider } from '../../providers/providers';
import { SyncDataPage } from '../sync-data/sync-data';
import { HTTP } from '@ionic-native/http';
/**
 * Generated class for the ApiloginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-apilogin',
  templateUrl: 'apilogin.html',
})
export class ApiloginPage {

  login_data = { UserName:'ali@pulse-micro.com', Password:'ali17', Url:'http://50.63.172.206/API/Test/' };
  ImportData = { Milestone: 'Background', SortOrder: 1, CompletedTill: 'NA', Status: 1, DataJSON:'', ImportedAt:''};


  constructor(public navCtrl: NavController, public navParams: NavParams , private alertCtrl: AlertController,
              public ApiHelper: ApiHelperProvider,public sessionProvider: SessionHelperProvider , 
              public configProvider: ConfigTablesProvider, public http: HTTP ) {

                
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApiloginPage');

    this.ImportData.Milestone = 'Background';
    this.ImportData.SortOrder = 1 ;
    this.ImportData.Status = 1 ;
    this.ImportData.CompletedTill = 'NA';
    this.ImportData.DataJSON = '';
    this.ImportData.ImportedAt = '';
    this.configProvider.SaveImportsEntity(this.ImportData);

    this.ImportData.Milestone = 'Masters/1';
    this.ImportData.SortOrder = 2 ;
    this.ImportData.Status = 1 ;
    this.ImportData.CompletedTill = 'NA';
    this.ImportData.DataJSON = '';
    this.ImportData.ImportedAt = '';
    this.configProvider.SaveImportsEntity(this.ImportData);

    this.ImportData.Milestone = 'Categories';
    this.ImportData.SortOrder = 3 ;
    this.ImportData.Status = 1 ;
    this.ImportData.CompletedTill = 'NA';
    this.ImportData.DataJSON = '';
    this.ImportData.ImportedAt = '';
    this.configProvider.SaveImportsEntity(this.ImportData);


  }


   UserLogin(){
   
   if(this.login_data.UserName == ''){
     this.presentBasicAlert('Email' , 'Enter Email-Id')
   }else if(this.login_data.Password == ''){
    this.presentBasicAlert('Password' , 'Enter Password')
   }else if(this.login_data.Url == ''){
    this.presentBasicAlert('Url' , 'Enter Url')
   }else{
    console.log("Submit Click" , this.login_data);

    this.ApiHelper.RequestPostHttp(this.login_data , 'Verify' , true).then(result => {
      //here you have the analog success function from an ajax call 
      //use the received data
     
      if(result.Status == false){
        this.presentBasicAlert('Error' , result.Message);
      }else{
        this.sessionProvider.SaveValueInSession('AppUrl' , this.login_data.Url);
        this.sessionProvider.SaveValueInSession('StoreName' , 'Platini Jeans');
        this.sessionProvider.SaveValueInSession('ImportStatus' , 'Not Started');

        if(result.UserId == 13 || result.UserId == 2 || result.UserId == 3 || result.UserId == 9 || result.UserId == 10 || result.UserId == 11 || result.UserId == 5
          || result.UserId == 12 || result.UserId == 9744 || result.UserId == 4 || result.UserId == 1 || result.UserId == 6 
          || result.UserId == 7 || result.UserId == 8 || result.UserId == 10752){
            console.log("**USER TYPE ADMIN");
          this.sessionProvider.SaveValueInSession('userid', result.UserId);
          this.sessionProvider.SaveValueInSession('userEmail' , this.login_data.UserName);
          this.sessionProvider.SaveValueInSession('roleid', '1');
         }else{
          console.log("**USER TYPE NORMAL");
          this.sessionProvider.SaveValueInSession('userid', result.UserId);
          this.sessionProvider.SaveValueInSession('userEmail' , this.login_data.UserName);
          this.sessionProvider.SaveValueInSession('roleid', '5');
         }  

        this.openStatusPage();
      }
     
  
     }, 
      error => {
         //here you have the analog error function from an ajax call 
         //treat the error
         this.presentBasicAlert('Error' , 'Please check your details')
         console.log("ERROR" , error);
        }
     );

   }
       

   }


   presentBasicAlert(title , message) {
    let alert = this.alertCtrl.create({
      title: title,
     // subTitle: '10% of battery remaining',
      message: message,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  openStatusPage(){
    this.navCtrl.push(SyncDataPage,{
      From: 1 
    }); 
  }


}

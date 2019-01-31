import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { IonicPageModule, App } from 'ionic-angular';
import { NavController , IonicPage } from 'ionic-angular';
import { SessionHelperProvider , ConfigTablesProvider } from '../../providers/providers';
import { SyncDataPage } from '../sync-data/sync-data';
import { ApiloginPage } from '../apilogin/apilogin';
import { MainHomePage } from '../main-home/main-home';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
@NgModule({
  imports: [IonicPageModule]      
})
export class HomePage {
  
  ImportData = { Milestone: 'Background', SortOrder: 1, CompletedTill: 'NA', Status: 1, DataJSON:'', ImportedAt:''};

  constructor(public navCtrl: NavController , public sessionProvider: SessionHelperProvider, 
              public configProvider: ConfigTablesProvider,  public appCtrl: App) {
   
  }





  ionViewDidLoad() {
 
       setTimeout(() => {
     
       this.sessionProvider.GetApiUrl().then((val)=>{
        console.log("API" , val);
        if(val == null){
         this.openLoginPage();
        }else{
          this.openMainPage(); 
      //   this.CheckMilestones();
       //  this.openStatusPage();
        }
   
       }).catch(error =>{
         console.log("API ERROR" , error);
       });

       }, 5000);



   }


  openStatusPage(){
    this.navCtrl.push(SyncDataPage); 
  }

  openLoginPage(){
    this.navCtrl.push(ApiloginPage); 
  }
  openMainPage(){
   this.appCtrl.getRootNav().setRoot(MainHomePage);
  }

   CheckMilestones(){

    this.configProvider.GetAllImports().subscribe(milestones =>{
     if(milestones == 0){
       
    }else{
      for(var i = 0 ; i < milestones.length ; i++){
      }
     
      this.configProvider.GetAllUnCompleteEntity().subscribe(UnCompletedmilestones =>{
      if(UnCompletedmilestones == 0){
        console.log("HOME PAGE OPEN ");
       this.openMainPage(); 
      }else{
        console.log("SYNC DATA PAGE OPEN ");
        this.openStatusPage();
      }
     
     },error =>{
       console.log("ERROR" , error);
     });


    }
   
   },error =>{
     console.log("ERROR" , error);
   }); 

   }




}

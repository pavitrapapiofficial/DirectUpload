import { Component } from '@angular/core';
import { Platform, AlertController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
//import { SplashScreen } from '@ionic-native/splash-screen';
import { ConfigTablesProvider, ProductsProvider, SessionHelperProvider } from './../providers/providers';
import { HomePage } from '../pages/home/home';
import { MainHomePage } from '../pages/main-home/main-home';
import { ApiloginPage } from '../pages/apilogin/apilogin';
import { ToastController } from 'ionic-angular';
import { Config } from 'ionic-angular';
//import { Keyboard } from '@ionic-native/keyboard';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
 
  constructor(public platform: Platform, public  app: App,private config: Config,public statusBar: StatusBar,public sessionProvider: SessionHelperProvider,
    configProvider: ConfigTablesProvider, productsProvider: ProductsProvider, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
     statusBar.styleDefault();
     statusBar.overlaysWebView(false);
    // this.keyboard.hideFormAccessoryBar(true);
      configProvider.CreateImportsTable();
      productsProvider.CreateProductsTable();
     
      this.sessionProvider.GetApiUrl().then((val)=>{
        console.log("API" , val);
        if(val == null){
          this.rootPage = ApiloginPage;
        }else{
          this.rootPage = MainHomePage;
        }
   
       }).catch(error =>{
         console.log("API ERROR" , error);
       });


     // splashScreen.hide();
    });
  }


}


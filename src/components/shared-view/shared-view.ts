import { Component, style } from '@angular/core';
import { NavController, Toast } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ProductListingPage } from '../../pages/product-listing/product-listing';
import { FormControl } from '@angular/forms';
import { Events } from 'ionic-angular';
import { SessionHelperProvider, ConfigTablesProvider, AppUtilsProvider, ApiHelperProvider, ProductsProvider } from '../../providers/providers';
import * as $ from "jquery";
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import {CartDetailsPage} from '../../pages/cart-details/cart-details';
import { App } from 'ionic-angular';
import { MainHomePage } from '../../pages/main-home/main-home';
import { CustomerlistingPage } from '../../pages/customerlisting/customerlisting';
import { SyncDataPage } from '../../pages/sync-data/sync-data';
import { MyOrderPage } from '../../pages/my-order/my-order';
/**
 * Generated class for the SharedViewComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'shared-view',
  templateUrl: 'shared-view.html'
})
export class SharedViewComponent {

  text: string;
  parent_cat: string;
  parent_cat_id: any;
  FirstLevelCategories: any = [];
  SecondLevelCategories: any = [];
  login_data = { UserName: '', Password: '' };
  forgot_data = { UserName: '' };
  register_data = { CompanyName: '', UserName: '', FirstName: '', LastName: '', PhoneNumber: '', Email: '', City: '', state: '', zipCode: '', address: '', Password: '' };
  searchTerm: string = '';
  searchitems: any;
  searching: any = false;
  searchControl: FormControl;
  topParent='';
  topParentName='';
  childId='';
  ChildName='';
  registrationHide = true ;
  loginHide = true ;
  child = true ;
  logoutHide = true ;
  loggedInEmail:string ;
  cart_qty: any ;

  constructor(public sessionProvider: SessionHelperProvider, public configProvider: ConfigTablesProvider,public events: Events,
    public navCtrl: NavController, public appUtils: AppUtilsProvider, public apiHelper: ApiHelperProvider,public sharedP: SharedhelperProvider,
    public alertCtrl: AlertController, public productsProvider: ProductsProvider, public appCtrl: App) {
    console.log('Hello SharedViewComponent Component');
    this.text = 'Hello World';
    this.searchControl = new FormControl();
    this.productsProvider.CheckCountInCart();

    this.GetCaltalogue();
  //   jQuery(function($) {
  //     $('#maincat li').click(function() {
  //        $(this).addClass('hover_triangle');
  //     },function() {
  //        $(this).removeClass('hover_triangle');
  //     });
  // }); 

 


  events.subscribe('cart:added', (total, time) => {
    // user and time are the same arguments passed in `events.publish(user, time)`
    console.log('***Welcome', total, 'at', time);
    this.cart_qty = total ;
  });


  }

  


  ionViewDidLoad() {

    

  }


  ionViewWillEnter(){

   
    
  }

  GetCaltalogue(){

   this.FirstLevelCategories = [] ;

    this.configProvider.GetFirstLevelCategories().subscribe(res => {
      console.log("GetFirstLevelCategories Length", res.rows.length);

      if (res.rows.length == 0) {
        console.log("NO Categories Found");

      } else {
        for (var i = 0; i < res.rows.length; i++) {

          this.FirstLevelCategories.push({
            id: res.rows.item(i).categoryId,
            name: res.rows.item(i).name,
            sort_order: res.rows.item(i).sortOrder,
            parentId: res.rows.item(i).parentId,
            isActive: res.rows.item(i).isActive,
            isDelete: res.rows.item(i).isDelete,
            CategoryLevel: res.rows.item(i).CategoryLevel,
            dateCreated: res.rows.item(i).dateCreated,
            dateUpdated: res.rows.item(i).dateUpdated
          })

        }

        this.FirstLevelCategories.push({
          id: '1A',
          name: 'NEW ARRIVALS',
          sort_order: 'NA',
          parentId: 'NA',
          isActive: 'NA',
          isDelete: 'NA',
          CategoryLevel: 'NA',
          dateCreated: 'NA',
          dateUpdated: 'NA'
        });

        this.FirstLevelCategories.push({
          id: '1B',
          name: 'CLEARANCE',
          sort_order: 'NA',
          parentId: 'NA',
          isActive: 'NA',
          isDelete: 'NA',
          CategoryLevel: 'NA',
          dateCreated: 'NA',
          dateUpdated: 'NA'
        });

        this.sessionProvider.GetValuesFromSession('userEmail').then((val) => {
          this.loggedInEmail = val ;
        }).catch(error => {
          console.log("API ERROR", error);
        });

        this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

          if (val == 1) {
            this.FirstLevelCategories.push({
              id: '1C',
              name: 'Future Deliveries',
              sort_order: 'NA',
              parentId: 'NA',
              isActive: 'NA',
              isDelete: 'NA',
              CategoryLevel: 'NA',
              dateCreated: 'NA',
              dateUpdated: 'NA'
            });
            this.FirstLevelCategories.push({
              id: '1D',
              name: 'Deactivated products',
              sort_order: 'NA',
              parentId: 'NA',
              isActive: 'NA',
              isDelete: 'NA',
              CategoryLevel: 'NA',
              dateCreated: 'NA',
              dateUpdated: 'NA'
            });
          }

        }).catch(error => {
          console.log("API ERROR", error);
        });


      }

    }, error => {
      console.log("ERROR", error);
    });


  }



  openCatalogue() {

    console.log("OPEN CATALOGUE");
    $(".catalog").addClass("show-left");
    $(".left-container").show();
    $(".main-cat").show();
    $(".as-hvr").hide();

    if($('.filters span').hasClass('bg')){
      $('.filters span').removeClass('bg')
      }
      if($('.filters ul').hasClass('block')){
      $('.filters ul').removeClass('block')
      }

  }

  openLogin() {

    $(".button-as").addClass("show-left");
    $(".main-cat").show();
    $(".as-hvr").hide();
    if($('.filters span').hasClass('bg')){
      $('.filters span').removeClass('bg')
      }
      if($('.filters ul').hasClass('block')){
      $('.filters ul').removeClass('block')
      }

    this.sessionProvider.GetValuesFromSession('userid').then((val) => {
     console.log("**SESSION VALUE" , val);
      if (val == 0) {
        this.registrationHide = true ;
        this.loginHide = true ;
        this.logoutHide = false ;
        console.log("**IF M AAYA" , val);
      }
      else {
        this.loginHide = false ;
        this.registrationHide = false ;
        this.logoutHide = true ;
        console.log("**ELSE M AAYA" , val);
      }
    

    }).catch(error => {
      console.log("API ERROR", error);
    });
   
  }

  openSearch() {
    $(".search-area").addClass('search-visible');
    $(".as-hvr").hide();
    if($('.filters span').hasClass('bg')){
      $('.filters span').removeClass('bg')
      }
      if($('.filters ul').hasClass('block')){
      $('.filters ul').removeClass('block')
      }
  }

  closeMenu() {
    console.log('closeMenu');
    $(".left-container").removeClass('show-left');
    $(".search-area").removeClass('search-visible');
    // document.getElementsByClassName('main-cat').style.display = "none";
    $(".main-cat").hide();

  }
  loginshow() {
    console.log('loginshow');
    $(".left-container").removeClass('show-left');
    $(".login-as").addClass("show-left");
  }


  registration() {
    console.log('registration');
    $(".left-container").removeClass('show-left');
    $(".registration").addClass("show-left");

  }

  forgotid() {
    console.log('forgotid');
    $(".left-container").removeClass('show-left');
    $(".forgot-as").addClass("show-left");
  }

  registerwholeseler() {
    console.log('registerwholeseler');
    $(".left-container").removeClass('show-left');
    $(".registration").addClass("show-left");
  }

  loginidexist() {
    console.log('loginidexist');
    $(".left-container").removeClass('show-left');
    $(".login-as").addClass("show-left");
  }


  hideleftmenu() {
    console.log('hideleftmenu');
    $(".catalog").removeClass("show-left");
    $(".button-as").removeClass("show-left");
    $(".main-cat").hide();
  }



  Logout() {

    this.sessionProvider.SaveValueInSession('userid', 0);
    this.sessionProvider.SaveValueInSession('roleid', '5');
    this.sessionProvider.SaveValueInSession('userEmail', 'NULL');
    this.closeMenu();
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }


  OpenHomeRoot(){
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }


  SignIn() {

    if (this.login_data.UserName == '') {
      this.presentBasicAlert('Email', 'Enter Email-Id')
    } else if (this.login_data.Password == '') {
      this.presentBasicAlert('Password', 'Enter Password')
    } else {
      console.log("Submit Click", this.login_data);

      this.apiHelper.RequestPostHttp(this.login_data, 'Verify' , true).then(result => {
        //here you have the analog success function from an ajax call 
        //use the received data
        if (result.Status == false) {
          this.presentBasicAlert('Error', result.Message);
        } else {
           
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
          this.closeMenu();
          this.appCtrl.getRootNav().setRoot(MainHomePage);
        }


      },
        error => {
          //here you have the analog error function from an ajax call 
          //treat the error
          this.presentBasicAlert('Error', 'Please check your details')
          console.log("ERROR", error);
        }
      );

    }


  }

  Register() {

    if (this.register_data.CompanyName == '') {
      this.presentBasicAlert('CompanyName', 'Enter CompanyName')
    } else if (this.register_data.FirstName == '') {
      this.presentBasicAlert('FirstName', 'Enter FirstName')
    } else if (this.register_data.LastName == '') {
      this.presentBasicAlert('LastName', 'Enter LastName')
    } else if (this.register_data.Email == '') {
      this.presentBasicAlert('Email', 'Enter Email')
    } else if (this.register_data.UserName == '') {
      this.presentBasicAlert('UserName', 'Enter UserName')
    } else if (this.register_data.PhoneNumber == '') {
      this.presentBasicAlert('PhoneNumber', 'Enter PhoneNumber')
    } else if (this.register_data.City == '') {
      this.presentBasicAlert('City', 'Enter City')
    } else if (this.register_data.state == '') {
      this.presentBasicAlert('State', 'Enter State')
    } else if (this.register_data.zipCode == '') {
      this.presentBasicAlert('ZipCode', 'Enter ZipCode')
    } else if (this.register_data.address == '') {
      this.presentBasicAlert('Address', 'Enter Address')
    } else if (this.register_data.Password == '') {
      this.presentBasicAlert('Password', 'Enter Password')
    } else {
      console.log("Submit Click", this.register_data);

      this.apiHelper.RequestPostHttp(this.register_data, 'Register' , true).then(result => {
        //here you have the analog success function from an ajax call 
        //use the received data

        if (result.Status == false) {
          this.presentBasicAlert('Error', result.Message);
        } else {
          this.sessionProvider.SaveValueInSession('UserId', result.UserId);
          this.sessionProvider.SaveValueInSession('roleid', '5');
          this.sessionProvider.SaveValueInSession('userEmail' , this.register_data.Email);
          this.closeMenu();
          this.appCtrl.getRootNav().setRoot(MainHomePage);

        }


      },
        error => {
          //here you have the analog error function from an ajax call 
          //treat the error
          this.presentBasicAlert('Error', 'Please check your details')
          console.log("ERROR", error);
        }
      );

    }
  }


  ForgotPssword() {

    if (this.forgot_data.UserName == '') {
      this.presentBasicAlert('Email', 'Enter Email-Id')
    } else {
      console.log("Submit Click", this.forgot_data);

      this.apiHelper.RequestPostHttp(this.forgot_data, 'forgotpassword' , true).then(result => {
        //here you have the analog success function from an ajax call 
        //use the received data

        if (result.Status == false) {
          this.presentBasicAlert('Error', result.Message);
        } else {
          let alert = this.alertCtrl.create({
            title: 'Success',
            message: result.Message,
            buttons: [{
              text: 'OK',
              role: 'ok',
              handler: () => {
                console.log('Cancel clicked');
                this.closeMenu();
              }
            }]
          });
          alert.present();
        }


      },
        error => {
          //here you have the analog error function from an ajax call 
          //treat the error
          this.presentBasicAlert('Error', 'Please check your details')
          console.log("ERROR", error);
        }
      );

    }


  }


  SearchProducts() {
    console.log("SearchTerm", this.searchTerm);

    if(this.searchTerm == ''){
      console.log("NO SearchTerm PRESENT");
    }else{
      this.searching = true;
      this.searchitems = [];
      this.productsProvider.SearchProductsFromDB(this.searchTerm).subscribe(res => {
  
        for (var i = 0; i < res.rows.length; i++) {
          this.searchitems.push({
            data: res.rows.item(i)
          });
        }
        this.searching = false;
        this.OpenSearchedProduct();
      }, error => {
        console.log("ERROR", error);
      });
    }

  }





  presentBasicAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      // subTitle: '10% of battery remaining',
      message: message,
      buttons: ['Dismiss']
    });
    alert.present();
  }
  GetSecondLevelCategories(id, name) {
    //  $("#maincat ul").hide();
    this.parent_cat = name;
    this.parent_cat_id = id;
    console.log("CLICKED IDD", id)
    if (id == '1A') {
      this.child = false ;
      console.log('NEW ARRIVALS CLICKED');
     
    } else if (id == '1B') {
      console.log('CLEARANCE CLICKED');
      this.child = false ;
      this.OpenProductListing(id, name, 1);
    } else if (id == '1C') {
      this.child = false ;
      console.log('FUTURE DELIVERIES CLICKED');
      this.OpenProductListing(id, name, 2);
    } else if (id == '1D') {
      this.child = false ;
      console.log('DEACTIVATED CLICKED');
    } else {
      // $("#maincat ul").show();
      this.child = true ;
      this.SecondLevelCategories = [];
      this.configProvider.GetSecondLevelCategories(id).subscribe(res => {
        console.log("Second Level Length", res);

        if (res.rows.length == 0) {
          console.log("**NO Categories Found");
       
        } else {
         
          for (var i = 0; i < res.rows.length; i++) {

            this.SecondLevelCategories.push({
              id: res.rows.item(i).categoryId,
              name: res.rows.item(i).name,
              sort_order: res.rows.item(i).sortOrder,
              parentId: res.rows.item(i).parentId,
              isActive: res.rows.item(i).isActive,
              isDelete: res.rows.item(i).isDelete,
              CategoryLevel: res.rows.item(i).CategoryLevel,
              dateCreated: res.rows.item(i).dateCreated,
              dateUpdated: res.rows.item(i).dateUpdated
            })

          }
          
          this.child = true ;
           $("#sub-menu-"+id).show();
           console.log("**Categories Found");
        }

      }, error => {
        console.log("ERROR", error);
      });

    }

  }

  OpenProductListing(catID, name, type) {

    console.log("Id", catID, "Name", name);

    this.navCtrl.push(ProductListingPage, {
      Type: type,
      CatID: catID, CatName: name, ParentId: this.parent_cat_id, ParentCat: this.parent_cat

    });
    $(".left-container").hide(300);

  }

  
  OpenCartDetails(){

    this.navCtrl.push(CartDetailsPage,{
      From: 1 
    });
     this.closeMenu();
    }

    OpenMyOrders() {

      this.navCtrl.push(MyOrderPage);
      this.closeMenu();
    }
  
    OpenCustomers() {
      this.navCtrl.push(CustomerlistingPage);
      this.closeMenu();
    }
    openStatusPage(){
      this.navCtrl.push(SyncDataPage,{
        From: 2
      }); 
    }

  OpenSearchedProduct() {
    
    this.navCtrl.push(ProductListingPage, {
      Type: 3,
      SearchTerm: this.searchTerm,
      Data: this.searchitems
    });
    this.closeMenu();

  }

  GetTopParent(catID){
  
    this.configProvider.GetCategoryDetails(catID).subscribe(res => {
      console.log("RESSS", res.rows.item(0));
      console.log("RESSS", res.rows.item(0).CategoryLevel);
      if(res.rows.item(0).CategoryLevel == 0){
        this.topParent = res.rows.item(0).categoryId;
        this.topParentName = res.rows.item(0).name;
        console.log("Top Parent" , this.topParent , "Name" , this.topParentName);
        console.log("Child Parent" , this.childId , "Name" , this.ChildName);
        this.navCtrl.push(ProductListingPage, {
          Type: 0,
          CatID: this.childId, CatName: this.ChildName, ParentId: this.topParent, ParentCat:this.topParentName
        });
        this.closeMenu();
      }else if(res.rows.item(0).CategoryLevel == 1){
        this.childId = res.rows.item(0).categoryId;
        this.ChildName = res.rows.item(0).name;
      
        this.GetTopParent(res.rows.item(0).parentId);
      }
       else{
        this.GetTopParent(res.rows.item(0).parentId);
      }
      
    }, error => {
      console.log("Error", error);
    });


  }




}

import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { ConfigTablesProvider, ProductsProvider, AppUtilsProvider, SessionHelperProvider, AccountsProvider } from '../../providers/providers';
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { ProductListingPage } from '../product-listing/product-listing';
import { CartDetailsPage } from '../cart-details/cart-details';
import { SyncDataPage } from '../sync-data/sync-data';
import { MainHomePage } from '../main-home/main-home';
import { MyOrderPage } from '../my-order/my-order';
import { DeactivatedProductsPage } from '../deactivated-products/deactivated-products';
/**
 * Generated class for the CustomerlistingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customerlisting',
  templateUrl: 'customerlisting.html',
})
export class CustomerlistingPage {

  Customers: any = [];
  PageCount = 0 ;
  PerPageCount = 20 ;
  from:any ;
  SearchText: any = "";
  pagingEnabled = true ;
 

  constructor(public navCtrl: NavController, public navParams: NavParams, public accountsProvider: AccountsProvider, public appUtils: AppUtilsProvider,
    public shared: SharedhelperProvider, public configProvider: ConfigTablesProvider, private renderer: Renderer, public productsProvider: ProductsProvider,
    public sessionHelper: SessionHelperProvider, public appCtrl: App) {

    this.from = this.navParams.get("From");
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerlistingPage');

    this.GetAllCustomers();

  }


  SearchCustomer(){
    if(this.SearchText == ""){
      this.appUtils.presentToast('Search Input is empty');
    }else{
      this.accountsProvider.SearchAccountsFromDB(this.SearchText).subscribe(SearchRes => {
        console.log("**SEARCH RES" , SearchRes);
        if(SearchRes.rows.length > 0){
          this.Customers = [] ;
         for(var i = 0 ; i < SearchRes.rows.length ; i++){
          let customer = {accountId: "",UserName: "", FirstName: "", lastname:"", Email: "", Phone: "", City: "", Role: ""} ;

          let AccountRes = SearchRes.rows.item(i);
          customer.UserName = AccountRes.userName ;
          customer.FirstName = AccountRes.firstName ;
          customer.lastname = AccountRes.lastName ;
          customer.Email = AccountRes.email ;
          customer.accountId = AccountRes.accountId ;
          if(AccountRes.roleId == 1){
            customer.Role = "Master Admin" ;
          }else if(AccountRes.roleId == 2){
            customer.Role = "Admin" ;
          }else if(AccountRes.roleId == 3){
            customer.Role = "Warehouse" ;
          }else if(AccountRes.roleId == 4){
            customer.Role = "Sales Person" ;
          }else if(AccountRes.roleId == 5){
            customer.Role = "Customer" ;
          }else if(AccountRes.roleId == 6){
            customer.Role = "User" ;
          } 
          let communicQuery = 'SELECT * FROM Communications WHERE isActive=? AND accountId='+AccountRes.accountId;
          this.accountsProvider.GetDetailsFromTable(communicQuery).subscribe(CommRes => {
           if(CommRes.rows.length > 0){
             customer.Phone = CommRes.rows.item(0).phone ;
           } 
          let addressQuery = 'SELECT * FROM Addresses WHERE isActive=? AND accountId=' + AccountRes.accountId;
          this.accountsProvider.GetDetailsFromTable(addressQuery).subscribe(addrRes => {
            if(addrRes.rows.length > 0){
              for(var j = 0 ; j < addrRes.rows.length ; j++){
                if (addrRes.rows.item(j).addressTypeId == 2) {
                customer.City = addrRes.rows.item(j).city ;
                }
              }
            }
            
          })
    
          })
          this.Customers.push(customer);
          this.pagingEnabled = false ;
         }
        }else{
          this.appUtils.presentToast('No Account Found');
        }
       });
    }
    
  }



  GetAllCustomers(){

    this.Customers = [] ;
    
    let accountQuery = 'SELECT * FROM Accounts WHERE isActive=? LIMIT ' + 1 + ',' + this.PerPageCount;
    this.accountsProvider.GetDetailsFromTable(accountQuery).subscribe(acRes => {
      console.log("CUSTOMERS RES" , acRes)
     for(var i = 0 ; i < acRes.rows.length ; i++){

      let customer = {accountId: "",UserName: "", FirstName: "", lastname:"", Email: "", Phone: "", City: "", Role: ""} ;

      let AccountRes = acRes.rows.item(i);
      customer.UserName = AccountRes.userName ;
      customer.FirstName = AccountRes.firstName ;
      customer.lastname = AccountRes.lastName ;
      customer.Email = AccountRes.email ;
      customer.accountId = AccountRes.accountId ;
      if(AccountRes.roleId == 1){
        customer.Role = "Master Admin" ;
      }else if(AccountRes.roleId == 2){
        customer.Role = "Admin" ;
      }else if(AccountRes.roleId == 3){
        customer.Role = "Warehouse" ;
      }else if(AccountRes.roleId == 4){
        customer.Role = "Sales Person" ;
      }else if(AccountRes.roleId == 5){
        customer.Role = "Customer" ;
      }else if(AccountRes.roleId == 6){
        customer.Role = "User" ;
      } 
      let communicQuery = 'SELECT * FROM Communications WHERE isActive=? AND accountId='+AccountRes.accountId;
      this.accountsProvider.GetDetailsFromTable(communicQuery).subscribe(CommRes => {
       if(CommRes.rows.length > 0){
         customer.Phone = CommRes.rows.item(0).phone ;
       } 
      let addressQuery = 'SELECT * FROM Addresses WHERE isActive=? AND accountId=' + AccountRes.accountId;
      this.accountsProvider.GetDetailsFromTable(addressQuery).subscribe(addrRes => {
        if(addrRes.rows.length > 0){
          for(var j = 0 ; j < addrRes.rows.length ; j++){
            if (addrRes.rows.item(j).addressTypeId == 2) {
            customer.City = addrRes.rows.item(j).city ;
            }
          }
        }
        
      })

      })
      this.Customers.push(customer);
     }
     this.pagingEnabled = true ;
      
    });

  }


  doInfinite(): Promise<any> {
    console.log('Begin async operation');
    this.PageCount = this.PageCount + 1 ;
    return new Promise((resolve) => {
      setTimeout(() => {
        
        let start = this.PageCount * this.PerPageCount ;
        let accountQuery = 'SELECT * FROM Accounts WHERE isActive=? LIMIT ' + start + ',' + this.PerPageCount;
        this.accountsProvider.GetDetailsFromTable(accountQuery).subscribe(acRes => {
          console.log("CUSTOMERS RES" , acRes)
         for(var i = 0 ; i < acRes.rows.length ; i++){
    
          let customer = {accountId: "",UserName: "", FirstName: "", lastname:"", Email: "", Phone: "", City: "", Role: ""} ;
    
          let AccountRes = acRes.rows.item(i);
          customer.UserName = AccountRes.userName ;
          customer.FirstName = AccountRes.firstName ;
          customer.lastname = AccountRes.lastName ;
          customer.Email = AccountRes.email ;
          customer.accountId = AccountRes.accountId ;
          if(AccountRes.roleId == 1){
            customer.Role = "Master Admin" ;
          }else if(AccountRes.roleId == 2){
            customer.Role = "Admin" ;
          }else if(AccountRes.roleId == 3){
            customer.Role = "Warehouse" ;
          }else if(AccountRes.roleId == 4){
            customer.Role = "Sales Person" ;
          }else if(AccountRes.roleId == 5){
            customer.Role = "Customer" ;
          }else if(AccountRes.roleId == 6){
            customer.Role = "User" ;
          } 
          
          let communicQuery = 'SELECT * FROM Communications WHERE isActive=? AND accountId='+AccountRes.accountId;
          this.accountsProvider.GetDetailsFromTable(communicQuery).subscribe(CommRes => {
           if(CommRes.rows.length > 0){
             customer.Phone = CommRes.rows.item(0).phone ;
           } 
          let addressQuery = 'SELECT * FROM Addresses WHERE isActive=? AND accountId=' + AccountRes.accountId;
          this.accountsProvider.GetDetailsFromTable(addressQuery).subscribe(addrRes => {
            if(addrRes.rows.length > 0){
              for(var j = 0 ; j < addrRes.rows.length ; j++){
                if (addrRes.rows.item(j).addressTypeId == 2) {
                customer.City = addrRes.rows.item(j).city ;
                }
              }
            }
            
          })
    
          })
          this.Customers.push(customer);
         }
         console.log('Async operation has ended');
         resolve();
        });

      }, 200);
    })
  }



  SelectCustomer(customer){

    this.navCtrl.pop().then(() => {
      console.log("**Image Data", this.from);
      if(this.from == 1){
        this.navParams.get('callback')(customer);
      }else{
      }
      });

  }




  ///// SHARED METHODS


  OpenProductListing(catID, name, type) {

    // $("#maincat ul li").click( {});

    $("left-container").hide();
    console.log("Id", catID, "Name", name);

    this.navCtrl.push(ProductListingPage, {
      Type: type,
      CatID: catID, CatName: name, ParentId: this.shared.parent_cat_id, ParentCat: this.shared.parent_cat

    });
    $(".left-container").hide();

  }
  OpenCartDetails() {

    this.navCtrl.push(CartDetailsPage, {
      From: 1
    });
    this.shared.closeMenu();
  }

  OpenMyOrders() {

    this.navCtrl.push(MyOrderPage);
    this.shared.closeMenu();
  }

  OpenCustomers() {

    // this.navCtrl.push(CustomerlistingPage);
    // this.shared.closeMenu();
  }
  openStatusPage(){
    this.navCtrl.push(SyncDataPage,{
      From: 2
    }); 
  }

  OpenSearchedProduct() {

    this.navCtrl.push(ProductListingPage, {
      Type: 3,
      SearchTerm: this.shared.searchTerm,
      Data: this.shared.searchitems
    });
    this.shared.closeMenu();

  }

  GetTopParent(catID) {

    this.configProvider.GetCategoryDetails(catID).subscribe(res => {
      console.log("RESSS", res.rows.item(0));
      console.log("RESSS", res.rows.item(0).CategoryLevel);
      if (res.rows.item(0).CategoryLevel == 0) {
        this.shared.topParent = res.rows.item(0).categoryId;
        this.shared.topParentName = res.rows.item(0).name;
        console.log("Top Parent", this.shared.topParent, "Name", this.shared.topParentName);
        console.log("Child Parent", this.shared.childId, "Name", this.shared.ChildName);
        this.navCtrl.push(ProductListingPage, {
          Type: 0,
          CatID: this.shared.childId, CatName: this.shared.ChildName, ParentId: this.shared.topParent, ParentCat: this.shared.topParentName
        });
        this.shared.closeMenu();
      } else if (res.rows.item(0).CategoryLevel == 1) {
        this.shared.childId = res.rows.item(0).categoryId;
        this.shared.ChildName = res.rows.item(0).name;

        this.GetTopParent(res.rows.item(0).parentId);
      }
      else {
        this.GetTopParent(res.rows.item(0).parentId);
      }

    }, error => {
      console.log("Error", error);
    });


  }

  SearchProducts() {
    console.log("SearchTerm", this.shared.searchTerm);
    this.renderer.invokeElementMethod(event.target, 'blur');
    if (this.shared.searchTerm == '') {
      console.log("NO SearchTerm PRESENT");
    } else {
      this.shared.searching = true;
      this.shared.searchitems = [];
      this.productsProvider.SearchProductsFromDB(this.shared.searchTerm).subscribe(res => {

        for (var i = 0; i < res.rows.length; i++) {
          this.shared.searchitems.push({
            data: res.rows.item(i)
          });
        }
        this.shared.searching = false;
        this.OpenSearchedProduct();
      }, error => {
        console.log("ERROR", error);
      });
    }

  }

  GetSecondLevelCategories(id, name) {
    //  $("#maincat ul").hide();
    this.shared.parent_cat = name;
    this.shared.parent_cat_id = id;
    console.log("CLICKED IDD", id)
    if (id == '1A') {
      this.shared.child = false;
      console.log('NEW ARRIVALS CLICKED');
      $("left-container").hide();

    } else if (id == '1B') {
      console.log('CLEARANCE CLICKED');
      $("left-container").hide();
      this.shared.child = false;
      this.OpenProductListing(id, name, 1);
    } else if (id == '1C') {
      this.shared.child = false;
      console.log('FUTURE DELIVERIES CLICKED');
      $("left-container").hide();
      this.OpenProductListing(id, name, 2);
    } else if (id == '1D') {
      this.shared.child = false;
      console.log('DEACTIVATED CLICKED');
      this.navCtrl.push(DeactivatedProductsPage, {
        Type: 1,
        CatID: id, CatName: name, ParentId: this.shared.parent_cat_id, ParentCat: this.shared.parent_cat
     });
      $("left-container").hide();
    } else {
      // $("#maincat ul").show();
      this.shared.child = true;
      this.shared.SecondLevelCategories = [];
      this.configProvider.GetSecondLevelCategories(id).subscribe(res => {
        console.log("Second Level Length", res);

        if (res.rows.length == 0) {
          console.log("**NO Categories Found");

        } else {

          for (var i = 0; i < res.rows.length; i++) {

            this.shared.SecondLevelCategories.push({
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

          this.shared.child = true;
          $("#sub-menu-" + id).show();
          console.log("**Categories Found");
        }

      }, error => {
        console.log("ERROR", error);
      });

    }

  }

  Logout() {

    this.sessionHelper.SaveValueInSession('userid', 0);
    this.sessionHelper.SaveValueInSession('roleid', '5');
    this.sessionHelper.SaveValueInSession('userEmail', 'NULL');
    this.shared.closeMenu();
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }


  OpenHomeRoot() {
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }


}

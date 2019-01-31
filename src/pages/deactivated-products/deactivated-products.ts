import { Component, Renderer } from '@angular/core';
import { NgModule } from '@angular/core';
import { IonicPageModule, App } from 'ionic-angular';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ConfigTablesProvider, ProductsProvider, AppUtilsProvider , SessionHelperProvider } from '../../providers/providers';
import { ProductDetailsPage } from '../product-details/product-details';
import { CartDetailsPage } from '../cart-details/cart-details';
import { MainHomePage } from '../main-home/main-home';
import * as $ from "jquery";
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { Events } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import { SyncDataPage } from '../sync-data/sync-data';
import { MyOrderPage } from '../my-order/my-order';
import { CustomerlistingPage } from '../customerlisting/customerlisting';
import { ProductListingPage } from '../product-listing/product-listing';

/**
 * Generated class for the DeactivatedProductsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deactivated-products',
  templateUrl: 'deactivated-products.html',
})
@NgModule({
  imports: [IonicPageModule]
})
export class DeactivatedProductsPage {
  ThirdLevelCategories: any = [];
  AllProducts: any = [];
  ProductImages: any = [];
  catids: any = [];
  catType = 0;
  Clearance = 0;
  page = 0;
  perPage = 24;
  totalData = 0;
  totalPage = 0;
  ScreenHeaders: any = [];
  hideMe = true;

  parent_cat: any ;
  child_cat: any ;

  loaderHide = true ;
  constructor(public navCtrl: NavController, public navParams: NavParams,public appCtrl: App,public events: Events,
    public productsProvider: ProductsProvider, public configProvider: ConfigTablesProvider,private file: File,private renderer: Renderer,
    public appUtils: AppUtilsProvider, public platform: Platform, public sessionProvider: SessionHelperProvider,
    public shared: SharedhelperProvider) {
      $(document).ready(function(){
        $(".filters span").click(function(){
        $(this).toggleClass("bg");
        $(this).children().toggleClass("block");
        });
        });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeactivatedProductsPage');

    if (this.navParams.get("Type") == 1) {
      this.hideMe = false;
      this.catType = 1;
      this.Clearance = 1;
      this.ScreenHeaders = [];
      this.AddScreenHeader("home", "Home", "");
      this.AddScreenHeader(this.navParams.get("ParentCat"), "ParentCat", this.navParams.get("ParentId"));
      this.GetClearanceProducts();
    } else if (this.navParams.get("Type") == 2) {
      this.hideMe = false;
      this.catType = 2;
      this.Clearance = 0;
      this.ScreenHeaders = [];
      this.AddScreenHeader("home", "Home", "");
      this.AddScreenHeader(this.navParams.get("ParentCat"), "ParentCat", this.navParams.get("ParentId"));
      this.GetFutureDeliveriesProducts();
    } else if (this.navParams.get("Type") == 3) {
      this.AllProducts = [];
      this.hideMe = false;
      this.catType = 0;
      this.Clearance = 0;
      this.ScreenHeaders = [];
      this.AddScreenHeader("home", "Home", "");
      this.AddScreenHeader("Search results for " + this.navParams.get("SearchTerm"), "Search", "");
      console.log("Search Products", this.navParams.get("Data"));
      this.totalData = this.navParams.get("Data").length;
      for (var i = 0; i < this.navParams.get("Data").length; i++) {
        let temp = this.navParams.get("Data")[i].data;
       
        let imgepath = '';
        this.productsProvider.GetBaseImageOfproduct(temp.clothesId).subscribe(res => {
          if (res.rows.length == 0) {
            imgepath = 'no_image';
          }
          else {
            var imagePath1 = this.file.dataDirectory + res.rows.item(0).imagePath;
            imgepath = normalizeURL(imagePath1);
          }
          console.log("Temp Data" , temp);
          console.log("Discount Price" , temp.DiscountedPrice , "Style NO" , temp.styleNumber);

          this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

            if (val == 5) {
             
              if (temp.DiscountedPrice == null) {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.msrp, Discount: '', img:  imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });

              } else {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedMSRP, Discount: temp.msrp, img:  imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
              }

            }else{

              if (temp.DiscountedPrice == null) {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.price, Discount: '', img:  imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  
              } else {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedPrice, Discount: temp.price, img: imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
              }

            }
  
          }).catch(error => {
            console.log("API ERROR", error);
          });

        }, error => {
          console.log("ERROR", error);
        });

       
      }


    }
    else {
      this.hideMe = true;
      this.catType = 0;
      this.Clearance = 0;
      this.ScreenHeaders = [];
      this.AddScreenHeader("home", "Home", "");
      this.AddScreenHeader(this.navParams.get("ParentCat"), "ParentCat", this.navParams.get("ParentId"));
      this.AddScreenHeader(this.navParams.get("CatName"), "ProductListing", this.navParams.get("CatID"));
      this.GetThirdLevelCategories(this.navParams.get("CatID"));

    }
  }
  ionViewWillEnter() {
 
  }


  AddScreenHeader(title, type, typeid) {

    this.ScreenHeaders.push({
      header_title: title,
      header_type: type,
      header_type_id: typeid
    });

  }

  onHeaderClick(header){
   console.log("Header click" , header);
  if (header == 'home') {
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }else{

  }

  } 




  GetThirdLevelCategories(id) {

    this.ThirdLevelCategories = [];
    this.configProvider.GetThirdLevelCategories(id).subscribe(res => {

      if (res.rows.length == 0) {
        console.log("NO Categories Found");

      } else {
        for (var i = 0; i < res.rows.length; i++) {

          this.catids.push(res.rows.item(i).categoryId);
          this.ThirdLevelCategories.push({
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


        this.productsProvider.GetThirdLevelProductCount(this.catids, this.Clearance).subscribe(count => {
          this.totalData = count;
          console.log("Total Data", this.totalData, "Count", count);
          if (this.totalData == 0) {
            console.log("No Product Found");
          } else {
            let total = Math.floor(this.totalData / this.perPage);
            let mod = this.totalData % this.perPage;
            if (mod == 0) {
              this.totalPage = total;
            } else {
              this.totalPage = total + 1;
            }
            console.log("Total Data:-", this.totalData, "Total Page:-", total, "MODULAS:-", mod, "Final Total page:-", this.totalPage);
            this.GetAllProducts(this.catids, this.perPage * this.page, this.perPage);

            if(this.totalData < this.perPage){
             console.log("HIDE LOADER");
             this.loaderHide = false ;
            }else{
              this.loaderHide = true ;
            }

          }
        }, error => {
          console.log("ERROR", error);
        });

      }

    }, error => {
      console.log("ERROR", error);
    });

  }


  GetClearanceProducts() {

    this.productsProvider.GetDeactivateProductCount().subscribe(count => {
      this.totalData = count;
      console.log("Total Data", this.totalData, "Count", count);
      if (this.totalData == 0) {
        console.log("No Product Found");
      } else {
        let total = Math.floor(this.totalData / this.perPage);
        let mod = this.totalData % this.perPage;
        if (mod == 0) {
          this.totalPage = total;
        } else {
          this.totalPage = total + 1;
        }
        console.log("Total Data:-", this.totalData, "Total Page:-", total, "MODULAS:-", mod, "Final Total page:-", this.totalPage);
        this.GetAllProducts(this.catids, this.perPage * this.page, this.perPage);

      }
    }, error => {
      console.log("ERROR", error);
    });


  }

  GetFutureDeliveriesProducts() {

    this.productsProvider.GetFutureDeliveriesProductCount().subscribe(count => {
      this.totalData = count;
      console.log("Total Data", this.totalData, "Count", count);
      if (this.totalData == 0) {
        console.log("No Product Found");
      } else {
        let total = Math.floor(this.totalData / this.perPage);
        let mod = this.totalData % this.perPage;
        if (mod == 0) {
          this.totalPage = total;
        } else {
          this.totalPage = total + 1;
        }
        console.log("Total Data:-", this.totalData, "Total Page:-", total, "MODULAS:-", mod, "Final Total page:-", this.totalPage);
        this.GetAllProducts(this.catids, this.perPage * this.page, this.perPage);

      }
    }, error => {
      console.log("ERROR", error);
    });


  }



  GetAllProducts(catids, startpageIndex, perpage) {

    console.log("SELECTED CAT ID", catids);
    this.productsProvider.GetAllDeactivateProducts(catids, startpageIndex, perpage, this.catType, this.Clearance).subscribe(res1 => {
      console.log("**ThirdLevel PRODUCTS length", res1.rows.length);
      this.AllProducts = [];
      for (var i = 0; i < res1.rows.length; i++) {

        let temp = res1.rows.item(i);
        let imgepath = '';
        this.productsProvider.GetBaseImageOfproduct(res1.rows.item(i).clothesId).subscribe(res => {
          //   console.log("PRODUCTS IMAGES" , temp.styleNumber, "Images" ,res);
         
          if (res.rows.length == 0) {

            imgepath = 'no_image';

          }
          else {
            var imagePath1 = this.file.dataDirectory + res.rows.item(0).imagePath;
            imgepath = normalizeURL(imagePath1);

          }

          this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

            if (val == 5) {
             
              if (temp.DiscountedPrice == null) {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.msrp, Discount: '', img: imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  
              } else {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedMSRP, Discount: temp.msrp, img: imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
              }

            }else{

              if (temp.DiscountedPrice == null) {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.price, Discount: '', img: imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  
              } else {
                this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedPrice, Discount: temp.price, img:  imgepath,
                futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
              }

            }
       //     this.loaderHide = false ;
          }).catch(error => {
            console.log("API ERROR", error);
          });
          


        }, error => {
          console.log("ERROR", error);
        });

      }
     

    }, error => {
      console.log("ERROR", error);
    });


  }


  doInfinite(infiniteScroll) {
    console.log("Infinite Scroll", infiniteScroll);
    this.page = this.page + 1;
    console.log("Page", this.page, "start index", this.perPage * this.page);

    setTimeout(() => {

      this.productsProvider.GetAllDeactivateProducts(this.catids, this.perPage * this.page, this.perPage, this.catType, this.Clearance).subscribe(res1 => {
        console.log("**ThirdLevel PRODUCTS length", res1.rows.length);

        for (var i = 0; i < res1.rows.length; i++) {
          let temp = res1.rows.item(i);
          let imgepath = '';
          this.productsProvider.GetBaseImageOfproduct(res1.rows.item(i).clothesId).subscribe(res => {
            //  console.log("PRODUCTS IMAGES" , temp.styleNumber, "Images" ,res);
            if (res.rows.length == 0) {
              imgepath = 'no_image';
            }
            else {
              var imagePath1 = this.file.dataDirectory + res.rows.item(0).imagePath;
              imgepath = normalizeURL(imagePath1);
            }
            console.log("**Product Future Date", temp.futureDeliveryDate);

            this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

              if (val == 5) {
               
                if (temp.DiscountedPrice == null) {
                  this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.msrp, Discount: '', img: imgepath,
                  futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
    
                } else {
                  this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedMSRP, Discount: temp.msrp, img: imgepath,
                  futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
                }

              }else{

                if (temp.DiscountedPrice == null) {
                  this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.price, Discount: '', img:  imgepath,
                  futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
    
                } else {
                  this.AllProducts.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedPrice, Discount: temp.price, img: imgepath,
                  futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
                }

              }
    
            }).catch(error => {
              console.log("API ERROR", error);
            });

          }, error => {
            console.log("ERROR", error);
          });

        }

      }, error => {
        console.log("ERROR", error);
      });

      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 200);

  }



  onFilter(category: any): void {
    console.log('onFilter');
    $(".as-hvr").hide();
    console.log("category id", category);
    this.catids = [];
    this.catids.push(category);
    this.productsProvider.GetThirdLevelProductCount(this.catids, this.Clearance).subscribe(count => {
      this.totalData = count;
      console.log("Total Data", this.totalData, "Count", count);
      if (this.totalData == 0) {
        console.log("No Product Found");
      } else {

        let total = Math.floor(this.totalData / this.perPage);
        let mod = this.totalData % this.perPage;
        if (mod == 0) {
          this.totalPage = total;
        } else {
          this.totalPage = total + 1;
        }
        this.page = 0;

        console.log("Total Data:-", this.totalData, "Total Page:-", total, "MODULAS:-", mod, "Final Total page:-", this.totalPage);
        this.GetAllProducts(this.catids, this.perPage * this.page, this.perPage);

        if(this.totalData < this.perPage){
          console.log("HIDE LOADER");
          this.loaderHide = false ;
         }else{
           this.loaderHide = true ;
         }


      }
    }, error => {
      console.log("ERROR", error);
    });

  }


  OpenProductDetails(prodID) {

    this.navCtrl.push(ProductDetailsPage, {
      ProductID: prodID,
      ScreenHeaders: this.ScreenHeaders
    });

  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    // this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

GetParentAndChildHeaders(type){

 if(type == 1){

 }else if(type == 2){
  
 }else if(type == 3){

 }else{

  let cat = this.navParams.get("CatID");
  console.log("CAT" , cat);
  this.configProvider.GetCategoryDetails(cat).subscribe(res =>{
  
   if(res.rows.item(0).CategoryLevel == 2){
     this.configProvider.GetCategoryDetails(res.rows.item(0).parentId).subscribe(res1 => {
       this.child_cat = res1.rows.item(0);   
       this.configProvider.GetCategoryDetails(res1.rows.item(0).parentId).subscribe(res2 => {
         this.parent_cat = res2.rows.item(0);    
         },error =>{
    
         }); 
       },error =>{
  
       });

   }else if(res.rows.item(0).CategoryLevel == 1){
    this.child_cat = res.rows.item(0);   
    
    this.configProvider.GetCategoryDetails(res.rows.item(0).parentId).subscribe(res1 => {
    this.parent_cat = res1.rows.item(0);    
    },error =>{

    });

   }

  },error =>{

  });


 }

  
}

///////////////////////////////Shared Methods


OpenProductListing(catID, name, type) {

  $("left-container").hide();

  console.log("Id", catID, "Name", name);

  this.navCtrl.push(ProductListingPage, {
    Type: type,
    CatID: catID, CatName: name, ParentId: this.shared.parent_cat_id, ParentCat: this.shared.parent_cat

  });
  $(".left-container").hide();

}
OpenCartDetails(){

  this.navCtrl.push(CartDetailsPage,{
    From: 1 
  });
  this.shared.closeMenu();
  }

  OpenMyOrders() {

    this.navCtrl.push(MyOrderPage);
    this.shared.closeMenu();
  }

  openStatusPage(){
    this.navCtrl.push(SyncDataPage,{
      From: 2
    }); 
  }

  OpenCustomers() {

    this.navCtrl.push(CustomerlistingPage);
    this.shared.closeMenu();
  }

  OpenSearchedProduct() {
  
    this.navCtrl.push(ProductListingPage, {
      Type: 3,
      SearchTerm: this.shared.searchTerm,
      Data: this.shared.searchitems
    });
    this.shared.closeMenu();

  }

  GetTopParent(catID){

    this.configProvider.GetCategoryDetails(catID).subscribe(res => {
      console.log("RESSS", res.rows.item(0));
      console.log("RESSS", res.rows.item(0).CategoryLevel);
      if(res.rows.item(0).CategoryLevel == 0){
        this.shared.topParent = res.rows.item(0).categoryId;
        this.shared.topParentName = res.rows.item(0).name;
        console.log("Top Parent" , this.shared.topParent , "Name" , this.shared.topParentName);
        console.log("Child Parent" , this.shared.childId , "Name" , this.shared.ChildName);
        this.navCtrl.push(ProductListingPage, {
          Type: 0,
          CatID: this.shared.childId, CatName: this.shared.ChildName, ParentId: this.shared.topParent, ParentCat:this.shared.topParentName
        });
        this.shared.closeMenu();
      }else if(res.rows.item(0).CategoryLevel == 1){
        this.shared.childId = res.rows.item(0).categoryId;
        this.shared.ChildName = res.rows.item(0).name;
      
        this.GetTopParent(res.rows.item(0).parentId);
      }
       else{
        this.GetTopParent(res.rows.item(0).parentId);
      }
      
    }, error => {
      console.log("Error", error);
    });


  }

  SearchProducts() {
    console.log("SearchTerm", this.shared.searchTerm);
    this.renderer.invokeElementMethod(event.target, 'blur');
    if(this.shared.searchTerm == ''){
      console.log("NO SearchTerm PRESENT");
    }else{
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
      this.shared.child = false ;
      console.log('NEW ARRIVALS CLICKED');
      $("left-container").hide();
     
    } else if (id == '1B') {
      console.log('CLEARANCE CLICKED');
      $("left-container").hide();
      this.shared.child = false ;
      this.OpenProductListing(id, name, 1);
    } else if (id == '1C') {
      this.shared.child = false ;
      console.log('FUTURE DELIVERIES CLICKED');
      $("left-container").hide();
      this.OpenProductListing(id, name, 2);
    } else if (id == '1D') {
      this.shared.child = false ;
      console.log('DEACTIVATED CLICKED');
      this.navCtrl.push(DeactivatedProductsPage, {
        Type: 1,
        CatID: id, CatName: name, ParentId: this.shared.parent_cat_id, ParentCat: this.shared.parent_cat
     });
      $("left-container").hide();
    } else {
      // $("#maincat ul").show();
      this.shared.child = true ;
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
          
          this.shared.child = true ;
           $("#sub-menu-"+id).show();
           console.log("**Categories Found");
        }

      }, error => {
        console.log("ERROR", error);
      });

    }

  }

  Logout() {

  this.sessionProvider.SaveValueInSession('userid', 0);
  this.sessionProvider.SaveValueInSession('roleid', '5');
  this.sessionProvider.SaveValueInSession('userEmail', 'NULL');
  this.shared.closeMenu();
  this.appCtrl.getRootNav().setRoot(MainHomePage);
}


OpenHomeRoot(){
  this.appCtrl.getRootNav().setRoot(MainHomePage);
}
}

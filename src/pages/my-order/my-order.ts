import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { ConfigTablesProvider, ProductsProvider, AppUtilsProvider, SessionHelperProvider, AccountsProvider } from '../../providers/providers';
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { MainHomePage } from '../main-home/main-home';
import { ProductListingPage } from '../product-listing/product-listing';
import { CartDetailsPage } from '../cart-details/cart-details';
import { CustomerlistingPage } from '../customerlisting/customerlisting';
import { SyncDataPage } from '../sync-data/sync-data';
import { DeactivatedProductsPage } from '../deactivated-products/deactivated-products';
/**
 * Generated class for the MyOrderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-order',
  templateUrl: 'my-order.html',
})
export class MyOrderPage {

  Orders: any = [];
  UserId: any = "";
  OrderStatusArray: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public accountsProvider: AccountsProvider, public configProvider: ConfigTablesProvider,
    public sessionHelper: SessionHelperProvider, public appUtils: AppUtilsProvider, public shared: SharedhelperProvider, private renderer: Renderer,
    public productsProvider: ProductsProvider, public appCtrl: App) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyOrderPage');
    this.OrderStatusArray.push({ code: 1, name: "New" });
    this.OrderStatusArray.push({ code: 2, name: "InProcess" });
    this.OrderStatusArray.push({ code: 3, name: "Shipped" });
    this.OrderStatusArray.push({ code: 4, name: "Back Order" });
    this.OrderStatusArray.push({ code: 5, name: "Completed" });
    this.OrderStatusArray.push({ code: 6, name: "Packed" });
    this.OrderStatusArray.push({ code: 7, name: "Pending" });
    this.OrderStatusArray.push({ code: -1, name: "Save As Draft" });
    this.OrderStatusArray.push({ code: 0, name: "Ready To Sync" });


    this.sessionHelper.GetValuesFromSession('userid').then(val => {
      console.log("**val", val);
      this.UserId = val;
      this.GetAllOrders(val);
    });


  }


  ExpandItem() {

    console.log('clicked');
    $('.row.show-row').removeClass('show-row');
    // $(".plus").show();
    $("#row-as").addClass('show-row');
    $(".plus").hide();
    $(".minus").show();

  }

  CollapseItem() {

    $("#row-as").removeClass('show-row');
    $('.plus').show();
    $('.minus').hide();

  }


  GetAllOrders(accountID) {

    this.Orders = [];

    let query = 'SELECT * FROM Orders WHERE accountId=' + accountID + ' ORDER BY dateUpdated DESC';
    this.accountsProvider.GetOrders(query).subscribe(ordersRes => {
      console.log("**val", ordersRes);
      for (var i = 0; i < ordersRes.rows.length; i++) {
        let orderObj = { Order: {}, AcDetails: {}, Addresses: {}, OrderStatus: "" };
        console.log("@!", ordersRes.rows.item(i));
        let orderResp = ordersRes.rows.item(i);
        let accountQuery = 'SELECT * FROM Accounts WHERE isActive=? AND accountId=' + orderResp.employeeId;
        this.accountsProvider.GetDetailsFromTable(accountQuery).subscribe(accntRes => {
          console.log("@! ACCOUNT", accntRes);
          orderObj.AcDetails = accntRes.rows.item(0);
          if (!this.appUtils.empty(orderResp.addressId)) {
            let addressQuery = 'SELECT * FROM Addresses WHERE isActive=? AND addressId=' + orderResp.addressId;
            this.accountsProvider.GetDetailsFromTable(addressQuery).subscribe(addrRes => {
              console.log("SHIP TO", addrRes.rows.item(0));
              orderObj.Addresses = addrRes.rows.item(0);
              if (orderResp.statusId == 1) {
                orderObj.OrderStatus = "New";
              } else if (orderResp.statusId == 2) {
                orderObj.OrderStatus = "InProcess";
              }
              else if (orderResp.statusId == 3) {
                orderObj.OrderStatus = "Shipped";
              }
              else if (orderResp.statusId == 4) {
                orderObj.OrderStatus = "Back Order";
              }
              else if (orderResp.statusId == 5) {
                orderObj.OrderStatus = "Completed";
              }
              else if (orderResp.statusId == 6) {
                orderObj.OrderStatus = "Packed";
              }
              else if (orderResp.statusId == 7) {
                orderObj.OrderStatus = "Pending";
              } else if (orderResp.statusId == -1) {
                orderObj.OrderStatus = "Save As Draft";
              } else if (orderResp.statusId == 0) {
                orderObj.OrderStatus = "Ready To Sync";
              }

              orderObj.Order = orderResp;
              this.Orders.push(orderObj);
            });
          }

        });
      }
    });
  }


  filterOrder(param: any) {
    let val: string = param;
    console.log("@! FILTERE VALUE", param);
    if (val !== '') {
      this.Orders = this.Orders.filter((item) => {
        return item.Order.orderNumber.indexOf(val) > -1 || item.AcDetails.userName.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    }
  }

  FilterOrderStatus(param: any){
    let val: string = param;
    console.log("@! FILTERE VALUE", param);
    if (val !== '') {
      this.Orders = this.Orders.filter((item) => {
        console.log("STATUS ID" , item.Order.statusId);
        return (""+item.Order.statusId).indexOf(val) > -1 ;
      })
    }
  }

  EditOrder(orderID) {
    console.log("@! EDIT ORDER ID", orderID);

    this.accountsProvider.GetTempOrderFromID(orderID).subscribe(tempRes => {
      console.log("@! TEMP ORDER RES", tempRes);
      this.navCtrl.push(CartDetailsPage, {
        From: 2,
        ProductDetailsJSON: tempRes.rows.item(0).productsJSON,
        CustomerDetailsJSON: tempRes.rows.item(0).customerJSON,
        OrderData: tempRes.rows.item(0).orderData,
        OrderScales: tempRes.rows.item(0).orderScales,
        OrderSizes: tempRes.rows.item(0).orderSizes
      });
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

    // this.navCtrl.push(MyOrderPage);
    // this.shared.closeMenu();
  }

  OpenCustomers() {

    this.navCtrl.push(CustomerlistingPage);
    this.shared.closeMenu();
  }
  openStatusPage() {
    this.navCtrl.push(SyncDataPage, {
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

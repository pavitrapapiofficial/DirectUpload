import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Toast } from 'ionic-angular';
import { ConfigTablesProvider, ProductsProvider, AppUtilsProvider, SessionHelperProvider, AccountsProvider } from '../../providers/providers';
import { v1 as uuid } from 'uuid';
import { App } from 'ionic-angular';
import { MainHomePage } from '../../pages/main-home/main-home';
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { SyncDataPage } from '../sync-data/sync-data';
import { ProductListingPage } from '../product-listing/product-listing';
import { MyOrderPage } from '../my-order/my-order';
import { CustomerlistingPage } from '../customerlisting/customerlisting';
import { DeactivatedProductsPage } from '../deactivated-products/deactivated-products';

/**
 * Generated class for the CartDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cart-details',
  templateUrl: 'cart-details.html',
})
export class CartDetailsPage {
  From: any;
  cartJSON: any;
  cartItems: any = [];
  Terms: any = [];
  Ship_vias: any = [];
  Tags: any = [];
  AccountID: any;
  selectedTag: any;
  Customers: any = [];
  cart_cloth_details: any = [];
  qty = 0; amt = 0; discount = 0;
  UserDiscount = 0.00;
  SelectedTerm = "";
  SelectedShipVia = "";

  // AccountsJSON = { accountId: 0, firstName: "", lastName: "", userName: "", email: "" };
  // CommunicationsJSON = { communicationId: "", phone: "" };
  // ShipToJSON = { addressId: "", street: "", city: "", state: "", country: "", pincode: "", addressTypeId: "" };
  // SoldToJSON = { addressId: "", street: "", city: "", state: "", country: "", pincode: "", addressTypeId: "" };
  // OptionalInfoJSON = { customerOptionalInfoId: "", customerType: "", discount: "", shipViaId: "" };

  SelectedOrderTag = "";
  OrderJSON = { orderId: "", orderNumber: "", accountId: 9732, createdOn: "", grandTotal: 30, discount: 25, finalAmount: 22.5, employeeId: 9732, addressId: 20600, communicationId: 10074, statusId: 7, originalQty: 1, isSentToQuickBook: false, isDelete: false, dateCreated: "", dateUpdated: "", shippingCost: 0, termId: 0, tagId: 0, confirmStatus: false, packedQty: 0, label: 0 };
  CustomerDetailsJSON = { accountId: 0, firstName: 'loading...', lastName: 'loading...', userName: 'loading...', email: 'loading...', password: '', roleId: 0, isLocal: false, isActive: true, isDelete: false, lastLoginDate: '', dateCreated: '', dateUpdated: '', Communications: {}, SoldToAddresses: {}, ShipToAddresses: {}, Companies: [], CustomerOptionalInfos: {}, SelectedOrderTag: {}, SelectedShipVia: {}, SelectedTerm: {} };
  CustomerDetailsJSONCOPY = {
    accountId: '', firstName: '', lastName: '', userName: '', email: '', password: '', roleId: 0, isLocal: false, isActive: true, isDelete: false, lastLoginDate: '', dateCreated: '', dateUpdated: '',
    Communications: { communicationId: "", phone: "", accountId: "", isActive: true, isDelete: false, dateUpdated: "" }, SoldToAddresses: { addressId: "", street: "", city: "", state: "", country: "", pincode: "", addressTypeId: 0, accountId: '', isActive: true, isDelete: false, dateCreated: "", dateUpdated: "" },
    ShipToAddresses: { addressId: "", street: "", city: "", state: "", country: "", pincode: "", addressTypeId: 0, accountId: '', isActive: true, isDelete: false, dateCreated: "", dateUpdated: "" }, CustomerOptionalInfos: { customerOptionalInfoId: "", customerType: 0, accountId: "", discount: "", shipViaId: "", termId: "", displayName: "", dateCreated: "", dateUpdated: "" }, SelectedOrderTag: {}, SelectedShipVia: {}, SelectedTerm: {},
    Companies: { companyId: '', name: "", accountId: "", isActive: true, isDelete: false, dateCreated: "", dateUpdated: "" }
  };



  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public accountsProvider: AccountsProvider, public appCtrl: App,
    public productsProvider: ProductsProvider, public appUtils: AppUtilsProvider, public sessionHelper: SessionHelperProvider, public configProvider: ConfigTablesProvider,
    public shared: SharedhelperProvider, private renderer: Renderer) {

    this.From = this.navParams.get("From");
    this.shared.GetCaltalogue();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CartDetailsPage');

    this.sessionHelper.GetValuesFromSession('userid').then(val => {
      console.log("**val", val);
      this.AccountID = val;

      if (this.From == 1) {

        this.sessionHelper.GetValuesFromSession('CartCustomer').then(cartVal => {
          if (cartVal == null) {
            this.GetCustomerDetails(this.AccountID);
          } else {

            this.CustomerDetailsJSON = JSON.parse(cartVal);
            this.UserDiscount = JSON.parse(cartVal).CustomerOptionalInfos.discount;
            this.GetFinalTotalAndAmount();
          }
        });


      } else {

        let products = this.navParams.get("ProductDetailsJSON");
        let customer = this.navParams.get("CustomerDetailsJSON");
        this.OrderJSON = JSON.parse(this.navParams.get("OrderData"));
        this.cart_cloth_details = JSON.parse(products);
        this.CustomerDetailsJSON = JSON.parse(customer);
        this.UserDiscount = JSON.parse(customer).CustomerOptionalInfos.discount;
        this.GetFinalTotalAndAmount();

      }
    });

    this.GetProductsOfCart();
    this.GetAllTerms();




  }


  GetCustomerDetails(val) {
    // accountId : 0 , firstName: '' , lastName:'', userName:'',email:'',password:'',roleId:0,isLocal:false,isActive:true,isDelete:false,lastLoginDate:'',dateCreated:'',dateUpdated:'',Communications:[],Addresses:[],Companies:[],CustomerOptionalInfos:[]}
    this.CustomerDetailsJSON.Companies = [];
    this.CustomerDetailsJSON.CustomerOptionalInfos = {};
    let accountQuery = 'SELECT * FROM Accounts WHERE isActive=? AND accountId=' + val;
    this.accountsProvider.GetDetailsFromTable(accountQuery).subscribe(accRes => {
      console.log("**Accounts RES", accRes.rows.item(0));
      this.CustomerDetailsJSON.accountId = accRes.rows.item(0).accountId;
      this.CustomerDetailsJSON.firstName = accRes.rows.item(0).firstName;
      this.CustomerDetailsJSON.lastName = accRes.rows.item(0).lastName;
      this.CustomerDetailsJSON.userName = accRes.rows.item(0).userName;
      this.CustomerDetailsJSON.email = accRes.rows.item(0).email;
      this.CustomerDetailsJSON.password = accRes.rows.item(0).password;
      this.CustomerDetailsJSON.roleId = accRes.rows.item(0).roleId;
      this.CustomerDetailsJSON.isLocal = accRes.rows.item(0).isLocal;
      this.CustomerDetailsJSON.isActive = accRes.rows.item(0).isActive;
      this.CustomerDetailsJSON.isDelete = accRes.rows.item(0).isDelete;
      this.CustomerDetailsJSON.lastLoginDate = accRes.rows.item(0).lastLoginDate;
      this.CustomerDetailsJSON.dateCreated = accRes.rows.item(0).dateCreated;
      this.CustomerDetailsJSON.dateUpdated = accRes.rows.item(0).dateUpdated;

      let communicQuery = 'SELECT * FROM Communications WHERE isActive=? AND accountId=' + val + ' ORDER BY dateUpdated DESC';
      this.accountsProvider.GetDetailsFromTable(communicQuery).subscribe(commRes => {
        console.log("**Communications", commRes);
        if (commRes.rows.length > 0) {
          this.CustomerDetailsJSON.Communications = commRes.rows.item(0);
          this.OrderJSON.communicationId = commRes.rows.item(0).communicationId;
        } else {
          this.CustomerDetailsJSON.Communications = {};
        }

        let addressQuery = 'SELECT * FROM Addresses WHERE isActive=? AND accountId=' + val;
        this.accountsProvider.GetDetailsFromTable(addressQuery).subscribe(addrRes => {
          for (var i = 0; i < addrRes.rows.length; i++) {
            console.log("**Address RES", addrRes.rows.item(i));
            if (addrRes.rows.item(i).addressTypeId == 1) {
              this.CustomerDetailsJSON.SoldToAddresses = addrRes.rows.item(i);
            } else if (addrRes.rows.item(i).addressTypeId == 2) {
              this.CustomerDetailsJSON.ShipToAddresses = addrRes.rows.item(i);
              this.OrderJSON.addressId = addrRes.rows.item(i).addressId;
            }

          }
          let companiesQuery = 'SELECT * FROM Companies WHERE isActive=? AND accountId=' + val;
          this.accountsProvider.GetDetailsFromTable(companiesQuery).subscribe(compRes => {
            for (var i = 0; i < compRes.rows.length; i++) {
              console.log("**Companies RES", compRes.rows.item(i));
              this.CustomerDetailsJSON.Companies.push(compRes.rows.item(i));
            }

            this.accountsProvider.GetCustomerOptionalInfos(val).subscribe(optInfoRes => {
              console.log("**Customer Optional Info RES", optInfoRes);
              if (optInfoRes.rows.length == 0) {
                this.UserDiscount = 0.00;
                this.CustomerDetailsJSON.CustomerOptionalInfos = {};
              } else {
                this.UserDiscount = optInfoRes.rows.item(0).discount;
                this.CustomerDetailsJSON.CustomerOptionalInfos = optInfoRes.rows.item(0);
              }
              this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));
              this.GetFinalTotalAndAmount();
            });
          });
        });
      });
    });



    console.log("**CUSTOMER ALL DETAILS", this.CustomerDetailsJSON);

  }


  GetAllTerms() {

    let termQuery = 'SELECT * FROM Terms WHERE isActive=? AND isDelete=? ORDER BY sortOrder ASC';
    this.configProvider.GetTerms(termQuery).subscribe(termsRes => {
      for (var i = 0; i < termsRes.rows.length; i++) {
        this.Terms.push(termsRes.rows.item(i));
      }
    });

    let ship_viaQuery = 'SELECT * FROM ShipVias WHERE isActive=? AND isDelete=? ORDER BY sortOrder ASC';
    this.configProvider.GetTerms(ship_viaQuery).subscribe(ship_viaRes => {
      for (var i = 0; i < ship_viaRes.rows.length; i++) {
        this.Ship_vias.push(ship_viaRes.rows.item(i));
      }
    });

    let TagQuery = 'SELECT * FROM OrderTags WHERE isActive=? AND isDelete=? ORDER BY sortOrder ASC';
    this.configProvider.GetTerms(TagQuery).subscribe(tagRes => {
      for (var i = 0; i < tagRes.rows.length; i++) {
        this.Tags.push(tagRes.rows.item(i));
      }
    });

    let all_ac = 'SELECT * FROM Accounts WHERE isActive=? AND isDelete=? ORDER BY dateCreated ASC';
    this.configProvider.GetTerms(all_ac).subscribe(cusRes => {
      for (var i = 0; i < cusRes.rows.length; i++) {
        this.Customers.push(cusRes.rows.item(i));
      }
    });

  }



  GetProductsOfCart() {


    this.productsProvider.GetAllFromCart().subscribe(res => {
      if (res.rows.length == 0) {
        console.log("No Products In Cart");
      }
      else {

        for (var i = 0; i < res.rows.length; i++) {
          console.log("**CART DETAILS RES", res.rows.item(i));
          console.log("**CART ITEMS ", JSON.parse(res.rows.item(i).cartData));
          // this.cartItems.push(res.rows.item(i));
          this.cartJSON = JSON.parse(res.rows.item(i).cartData);
          console.log("**CART JSON ", this.cartJSON);
          var img;
          if (this.cartJSON.product_images.length == 0) {
            img = "";
          } else {
            img = this.cartJSON.product_images[0].path;
          }
          console.log("sss", img);
          var price;
          if (this.cartJSON.product_details.DiscountedPrice == null) {
            price = this.cartJSON.product_details.price;
          } else {
            price = this.cartJSON.product_details.DiscountedPrice;
            //  this.product_details.DiscountedPrice = res.rows.item(0).price;
          }
          console.log("FITSS JSON ", this.cartJSON.cart_data);

          this.cart_cloth_details.push({
            id: res.rows.item(i).clothesId,
            style: this.cartJSON.product_details.styleNumber,
            qty: this.cartJSON.total_qty,
            total_pr: this.cartJSON.total_price,
            per_price: price,
            img_path: img,
            Fits: this.cartJSON.cart_data,
          });

        }
        for (var s = 0; s < this.cart_cloth_details.length; s++) {
          this.cartItems.push(this.cart_cloth_details[s]);
        }
        console.log("## JSON IN CART", this.cart_cloth_details);

        this.GetFinalTotalAndAmount();

      }

    }, error => {
      console.log("ERROR", error);
    });

  }


  GetFinalTotalAndAmount() {

    this.qty = 0, this.amt = 0;

    for (var i = 0; i < this.cart_cloth_details.length; i++) {
      this.qty = this.qty + this.cart_cloth_details[i].qty;
      this.amt = this.amt + this.cart_cloth_details[i].total_pr
    }
    console.log("Final Amount And Qty", this.qty, this.amt);
    if (this.appUtils.empty(this.UserDiscount)) {
      this.UserDiscount = 0;
    }
    this.discount = this.amt / 100 * this.UserDiscount;

  }


  change(value: any, maxqty: number, ind: any, parentInd: any, size: any, from: any, clothIndex: any, fitsIndex: any) {
    console.log("Changed Value", value, maxqty);
    console.log("cloth Index", clothIndex, fitsIndex);
    if (value == '') {
      console.log("Value Empty");
    } else {
      if (value > maxqty) {
        if (from == 1) {
          size.cartQty = 0;
          this.UpdateTotalQtyAmount(clothIndex, fitsIndex);
        } else {
          size.groupQty = 0
          this.UpdateTotalQtyAmount(clothIndex, fitsIndex);
        }
        this.presentBasicAlert("Alert", "You cannot order more than " + maxqty + " quantity for this size");

      } else {
        console.log("** CLOTH ID", this.cart_cloth_details[clothIndex].id);
        console.log("**cart Items", this.cartItems);
        let selectedfit = this.cartItems.find(item => item.id === this.cart_cloth_details[clothIndex].id);
        console.log("**OLD JSON", selectedfit);
        console.log("**OLD JSON", selectedfit.Fits);
        selectedfit.Fits = this.cart_cloth_details[clothIndex].Fits;
        console.log("**NEW JSON", this.cart_cloth_details[clothIndex].Fits);
        console.log("**AFTER UPDATE", selectedfit.Fits);

        if (from == 1) {
          let upd = maxqty - value;
          console.log("**REMAINING STOCK", upd);
          this.productsProvider.UpdateStockScale(size.sizeDetails.clothesScaleId, upd);
          this.UpdateTotalQtyAmount(clothIndex, fitsIndex);
        } else {
          let upd = maxqty - value;
          console.log("**REMAINING STOCK", upd);
          this.productsProvider.UpdateStockScale(size.scale.clothesScaleId, upd);
          this.UpdateTotalQtyAmount(clothIndex, fitsIndex);
        }

      }
    }

  }

  UpdateTotalQtyAmount(ind: any, fitIndex: any) {
    console.log("cart Cloth", this.cart_cloth_details[ind].Fits[fitIndex]);
    var total = 0;
    for (var i = 0; i < this.cart_cloth_details[ind].Fits.length; i++) {
      for (var m = 0; m < this.cart_cloth_details[ind].Fits[i].OpenScales.length; m++) {
        console.log("Open Scales", this.cart_cloth_details[ind].Fits[i].OpenScales);
        for (var k = 0; k < this.cart_cloth_details[ind].Fits[i].OpenScales[m].Allsizes.length; k++) {
          var cart = this.cart_cloth_details[ind].Fits[i].OpenScales[m].Allsizes[k].cartQty;
          console.log("Added Into Cart", cart);
          if (cart === "") {
            cart = 0;
          } else {
            cart = this.cart_cloth_details[ind].Fits[i].OpenScales[m].Allsizes[k].cartQty;
          }
          console.log("Added Into Cart", cart);
          var integer_qty = parseInt(cart, 10);
          total = total + integer_qty;
          console.log("OPEN TOTAL", total);
        }

      }

      for (var l = 0; l < this.cart_cloth_details[ind].Fits[i].GroupScales.length; l++) {
        console.log("GROUP START", this.cart_cloth_details[ind].Fits[i].GroupScales[l]);
        var gtotal = 0;
        for (var n = 0; n < this.cart_cloth_details[ind].Fits[i].GroupScales[l].Allsizes.length; n++) {
          var gcart = this.cart_cloth_details[ind].Fits[i].GroupScales[l].Allsizes[n].sizeDetails.quantity;
          gtotal = gtotal + gcart;
        }
        var gr = this.cart_cloth_details[ind].Fits[i].GroupScales[l].groupQty;
        if (gr === "") {
          gr = 0
        } else {
          let max = this.cart_cloth_details[ind].Fits[i].GroupScales[l].scale.invQty;
        }
        console.log("GROUP QTY", gr);
        var groupTotal = gr * gtotal;
        total = total + groupTotal;
        console.log("GROUP TOTAL", total);
      }
    }


    console.log("TOTAL QTY", total);
    console.log("PRICE", this.cart_cloth_details[ind].per_price * total);
    this.cart_cloth_details[ind].total_pr = this.cart_cloth_details[ind].per_price * total;
    this.cart_cloth_details[ind].qty = total;

    this.GetFinalTotalAndAmount();

  }



  presentBasicAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Dismiss']
    });
    alert.present();
  }


  BreakPacket(clothIndex: any, fitsIndex: any, groupIndex: any, groupScale: any) {
    if (groupScale.scale.invQty > 0) {
      for (var i = 0; i < this.cart_cloth_details[clothIndex].Fits[fitsIndex].OpenScales[groupIndex].Allsizes.length; i++) {
        var first = this.cart_cloth_details[clothIndex].Fits[fitsIndex].OpenScales[groupIndex].Allsizes[i].sizeDetails.quantity;
        var s = groupScale.Allsizes[i].sizeDetails.quantity;
        var t = s + first;
        this.cart_cloth_details[clothIndex].Fits[fitsIndex].OpenScales[groupIndex].Allsizes[i].sizeDetails.quantity = t;
      }
      let max = groupScale.scale.invQty;
      var integer_qty = parseInt(max, 10);
      console.log("***", max, 1);
      let upd = integer_qty - 1;
      console.log("**REMAINING STOCK", upd);
      this.productsProvider.UpdateStockScale(groupScale.scale.clothesScaleId, upd);
      
    } else {
      this.appUtils.presentToast('Can not break');
    }
  }

  public selectAll(event): void {
    event.target.select();
  }

  hidepop() {
    document.getElementById('pop-size').style.display = 'none';
  }

  showSize() {
    document.getElementById('pop-size').style.display = 'block';
  }

  AddOrEditNewCustomer(from) {
    document.getElementById('editcustoers').style.display = 'block';
    if (from == 1) {
      this.openCity(event, 'London');
    } else if (from == 2) {
      this.openCity(event, 'Paris');
    } else {
      this.openCity(event, 'Tokyo');
    }

  }
  closeEditcustmers1() {
    document.getElementById('editcustoers').style.display = 'none';
  }


  AddNewCustomer(from) {
    document.getElementById('Newcustoers').style.display = 'block';
    if (from == 1) {
      this.openCity(event, 'London1');
    } else if (from == 2) {
      this.openCity(event, 'Paris1');
    } else {
      this.openCity(event, 'Tokyo1');
    }

  }
  closenewcustmers() {
    document.getElementById('Newcustoers').style.display = 'none';
  }

  cartSearchShow() {
    document.getElementById('crt-search').style.display = 'block';
  }

  closecartSearch() {
    document.getElementById('crt-search').style.display = 'none';
  }
  openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    var d = document.getElementById(cityName);
    d.className += " active";
  }


  onChange(cus) {

    console.log("**CUS CHANGE", cus);
    this.GetCustomerDetails(cus);
  }


  onChangeTerms(termID) {
    console.log("**TERM CHANGE", termID);
    let term = this.Terms.find(t => t.termId == termID);
    this.CustomerDetailsJSON.SelectedTerm = term;
    this.OrderJSON.termId = termID;
    console.log("**SELECTED ORDER TERM", term);
    this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));
  }

  onChangeShipVia(shipID) {
    console.log("**SHIP VIA CHANGE", shipID);
    let ship = this.Ship_vias.find(s => s.shipViaId == shipID);
    this.CustomerDetailsJSON.SelectedShipVia = ship;
    this.OrderJSON.shippingCost = shipID;
    console.log("**SELECTED ORDER TERM", ship);
    this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));
  }

  onChangeTags(tagID) {
    console.log("**ORDER TAG CHANGE", tagID);
    let tag;
    tag = this.Tags.find(item => item.orderTagId == tagID);
    this.CustomerDetailsJSON.SelectedOrderTag = tag;
    this.OrderJSON.tagId = tagID;
    console.log("**SELECTED ORDER TAG", tag);
    this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));

  }

  ChangeCustomer() {
    this.navCtrl.push(CustomerlistingPage, {
      From: 1,
      callback: this.callback
    });
    this.shared.closeMenu();
  }

  callback = data => {
    console.log('***data received from Customer page', data);
    this.GetCustomerDetails(data.accountId);
  };


  OrderSubmit() {
    console.log("#* Cart Product Details", this.cart_cloth_details);
    console.log("#* Customer Details", this.CustomerDetailsJSON);

    if (this.From == 1) {

      if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedTerm)) {
        this.presentBasicAlert('Term', 'Please Select Term');
      } else if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedShipVia)) {
        this.presentBasicAlert('Ship Via', 'Please Select Ship Via');
      } else if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedOrderTag)) {
        this.presentBasicAlert('Tag', 'Please Select Tag');
      } else {

        const rand: string = uuid();
        console.log("#* ORDER RANDM", rand);
        this.OrderJSON.orderId = rand;
        this.OrderJSON.orderNumber = "";
        this.OrderJSON.accountId = this.AccountID;
        this.OrderJSON.createdOn = this.appUtils.GetCurrentDateTime();
        this.OrderJSON.grandTotal = this.amt;
        this.OrderJSON.discount = this.discount;
        this.OrderJSON.finalAmount = this.amt - this.discount;
        this.OrderJSON.employeeId = this.CustomerDetailsJSON.accountId;
        // this.OrderJSON.addressId = this.CustomerDetailsJSON.ShipToAddresses.addressId;
        // this.OrderJSON.communicationId = this.CustomerDetailsJSON.Communications.communicationId;
        this.OrderJSON.statusId = 0;
        this.OrderJSON.originalQty = this.qty;
        this.OrderJSON.isSentToQuickBook = false;
        this.OrderJSON.isDelete = false;
        this.OrderJSON.dateCreated = this.appUtils.GetCurrentDateTime();
        this.OrderJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
        // this.OrderJSON.shippingCost = this.CustomerDetailsJSON.SelectedShipVia.shipViaId;
        // this.OrderJSON.termId = this.CustomerDetailsJSON.SelectedTerm.termId;
        // this.OrderJSON.tagId = this.CustomerDetailsJSON.SelectedOrderTag.orderTagId;


        let OrderScales = [];
        let OrderSizes = [];

        for (var i = 0; i < this.cart_cloth_details.length; i++) {

          for (var k = 0; k < this.cart_cloth_details[i].Fits.length; k++) {

            for (var j = 0; j < this.cart_cloth_details[i].Fits[k].GroupScales.length; j++) {

              let OrderScalesJSON = { orderScaleId: "", orderId: "", clothesScaleId: 1309, quantity: 1, packedQty: 0, dateCreated: "", dateUpdated: "", clothesId: 545 };
              const randScale: string = uuid();
              OrderScalesJSON.orderScaleId = randScale;
              OrderScalesJSON.orderId = rand;
              OrderScalesJSON.clothesScaleId = this.cart_cloth_details[i].Fits[k].GroupScales[j].scale.clothesScaleId;
              OrderScalesJSON.quantity = this.cart_cloth_details[i].Fits[k].GroupScales[j].groupQty;
              OrderScalesJSON.packedQty = 0;
              OrderScalesJSON.dateCreated = this.appUtils.GetCurrentDateTime();
              OrderScalesJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
              OrderScalesJSON.clothesId = this.cart_cloth_details[i].id;
              OrderScales.push(OrderScalesJSON);
            }

            for (var l = 0; l < this.cart_cloth_details[i].Fits[k].OpenScales.length; l++) {

              for (var m = 0; m < this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes.length; m++) {
                let OrderSizesJSON = { orderSizeId: "", orderId: "", clothesSizeId: 0, quantity: 0, dateCreated: "", dateUpdated: "", clothesId: 0 };
                const randSize: string = uuid();
                OrderSizesJSON.orderSizeId = randSize;
                OrderSizesJSON.orderId = rand;
                OrderSizesJSON.clothesSizeId = this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes[m].sizeDetails.clothesScaleSizeId;
                OrderSizesJSON.quantity = this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes[m].cartQty;
                OrderSizesJSON.dateCreated = this.appUtils.GetCurrentDateTime();
                OrderSizesJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
                OrderSizesJSON.clothesId = this.cart_cloth_details[i].id;
                OrderSizes.push(OrderSizesJSON);
              }

            }

          }

        }

        console.log("*# FINAL ORDER JSON", this.OrderJSON);
        console.log("*# FINAL ORDER SCALES", OrderScales);
        console.log("*# FINAL ORDER SIZES", OrderSizes);
        let OrdersArray: any = [];
        OrdersArray.push(this.OrderJSON);

        this.accountsProvider.SaveOrders(OrdersArray).subscribe(OrderRes => {

          this.accountsProvider.SaveOrderScales(OrderScales).subscribe(pos => {
            console.log("**OrderScales COMPLETED", pos);

            this.accountsProvider.SaveOrderSizes(OrderSizes).subscribe(pos => {
              console.log("**OrderSizes COMPLETED", pos);
              this.appUtils.presentBasicAlert('Success', 'Order Saved Successfully');
              this.accountsProvider.SaveTempOrder(this.OrderJSON.orderId, this.cart_cloth_details, this.CustomerDetailsJSON, this.OrderJSON, OrderScales, OrderSizes).subscribe(SaveTempRes => {
                console.log("** CART TEMP ORDER SAVE", SaveTempRes);
                this.DeleteCart();
              });
            });

          });

        });


      }

    } else {

      this.UpDateExistingOrder(0);

    }

  }


  SaveOrder() {

    if (this.From == 1) {

      console.log("#* Cart Product Details", this.cart_cloth_details);
      console.log("#* Customer Details", this.CustomerDetailsJSON);

      if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedTerm)) {
        this.presentBasicAlert('Term', 'Please Select Term');
      } else if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedShipVia)) {
        this.presentBasicAlert('Ship Via', 'Please Select Ship Via');
      } else if (this.appUtils.empty(this.CustomerDetailsJSON.SelectedOrderTag)) {
        this.presentBasicAlert('Tag', 'Please Select Tag');
      } else {

        const rand: string = uuid();
        console.log("#* ORDER RANDM", rand);
        this.OrderJSON.orderId = rand;
        this.OrderJSON.orderNumber = "";
        this.OrderJSON.accountId = this.AccountID;
        this.OrderJSON.createdOn = this.appUtils.GetCurrentDateTime();
        this.OrderJSON.grandTotal = this.amt;
        this.OrderJSON.discount = this.discount;
        this.OrderJSON.finalAmount = this.amt - this.discount;
        this.OrderJSON.employeeId = this.CustomerDetailsJSON.accountId;
        // this.OrderJSON.addressId = this.CustomerDetailsJSON.ShipToAddresses.addressId;
        // this.OrderJSON.communicationId = this.CustomerDetailsJSON.Communications.communicationId;
        this.OrderJSON.statusId = -1;
        this.OrderJSON.originalQty = this.qty;
        this.OrderJSON.isSentToQuickBook = false;
        this.OrderJSON.isDelete = false;
        this.OrderJSON.dateCreated = this.appUtils.GetCurrentDateTime();
        this.OrderJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
        // this.OrderJSON.shippingCost = this.CustomerDetailsJSON.SelectedShipVia.shipViaId;
        // this.OrderJSON.termId = this.CustomerDetailsJSON.SelectedTerm.termId;
        // this.OrderJSON.tagId = this.CustomerDetailsJSON.SelectedOrderTag.orderTagId;

        let OrderScales = [];
        let OrderSizes = [];

        for (var i = 0; i < this.cart_cloth_details.length; i++) {

          for (var k = 0; k < this.cart_cloth_details[i].Fits.length; k++) {

            for (var j = 0; j < this.cart_cloth_details[i].Fits[k].GroupScales.length; j++) {

              let OrderScalesJSON = { orderScaleId: "", orderId: "", clothesScaleId: 1309, quantity: 1, packedQty: 0, dateCreated: "", dateUpdated: "", clothesId: 545 };
              const randScale: string = uuid();
              OrderScalesJSON.orderScaleId = randScale;
              OrderScalesJSON.orderId = rand;
              OrderScalesJSON.clothesScaleId = this.cart_cloth_details[i].Fits[k].GroupScales[j].scale.clothesScaleId;
              OrderScalesJSON.quantity = this.cart_cloth_details[i].Fits[k].GroupScales[j].groupQty;
              OrderScalesJSON.packedQty = 0;
              OrderScalesJSON.dateCreated = this.appUtils.GetCurrentDateTime();
              OrderScalesJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
              OrderScalesJSON.clothesId = this.cart_cloth_details[i].id;
              OrderScales.push(OrderScalesJSON);
            }

            for (var l = 0; l < this.cart_cloth_details[i].Fits[k].OpenScales.length; l++) {

              for (var m = 0; m < this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes.length; m++) {
                let OrderSizesJSON = { orderSizeId: "", orderId: "", clothesSizeId: 0, quantity: 0, dateCreated: "", dateUpdated: "", clothesId: 0 };
                const randSize: string = uuid();
                OrderSizesJSON.orderSizeId = randSize;
                OrderSizesJSON.orderId = rand;
                OrderSizesJSON.clothesSizeId = this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes[m].sizeDetails.clothesScaleSizeId;
                OrderSizesJSON.quantity = this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes[m].cartQty;
                OrderSizesJSON.dateCreated = this.appUtils.GetCurrentDateTime();
                OrderSizesJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
                OrderSizesJSON.clothesId = this.cart_cloth_details[i].id;
                OrderSizes.push(OrderSizesJSON);
              }

            }

          }

        }

        console.log("*# FINAL ORDER JSON", this.OrderJSON);
        console.log("*# FINAL ORDER SCALES", OrderScales);
        console.log("*# FINAL ORDER SIZES", OrderSizes);
        let OrdersArray: any = [];
        OrdersArray.push(this.OrderJSON);

        this.accountsProvider.SaveOrders(OrdersArray).subscribe(OrderRes => {

          this.accountsProvider.SaveOrderScales(OrderScales).subscribe(pos => {
            console.log("**OrderScales COMPLETED", pos);

            this.accountsProvider.SaveOrderSizes(OrderSizes).subscribe(pos => {
              console.log("**OrderSizes COMPLETED", pos);
              this.appUtils.presentToast('Order Saved Successfully');
              this.accountsProvider.SaveTempOrder(this.OrderJSON.orderId, this.cart_cloth_details, this.CustomerDetailsJSON, this.OrderJSON, OrderScales, OrderSizes).subscribe(SaveTempRes => {
                console.log("** CART TEMP ORDER SAVE", SaveTempRes);
                this.DeleteCart();
              });

            });

          });

        });

      }

    } else {

      this.UpDateExistingOrder(-1);

    }




  }


  UpDateExistingOrder(orderstatus) {

    console.log("#*TO UPDATE Cart Product Details", this.cart_cloth_details);
    console.log("#*TO UPDATE Customer Details", this.CustomerDetailsJSON);
    let OldOrderData = JSON.parse(this.navParams.get("OrderData"));
    let OldOrderScales = JSON.parse(this.navParams.get("OrderScales"));
    let OldOrderSizes = JSON.parse(this.navParams.get("OrderSizes"));
    console.log("#* OLD ORDER DATA", OldOrderData);
    console.log("#* OLD ORDER SCALES", OldOrderScales);
    console.log("#* OLD ORDER SIZES", OldOrderSizes);

    OldOrderData.accountId = this.AccountID;
    OldOrderData.grandTotal = this.amt;
    OldOrderData.discount = this.discount;
    OldOrderData.finalAmount = this.amt - this.discount;
    OldOrderData.employeeId = this.CustomerDetailsJSON.accountId;
    OldOrderData.statusId = orderstatus;
    OldOrderData.originalQty = this.qty;
    OldOrderData.dateUpdated = this.appUtils.GetCurrentDateTime();
    OldOrderData.addressId = this.OrderJSON.addressId;
    OldOrderData.communicationId = this.OrderJSON.communicationId;
    OldOrderData.shippingCost = this.OrderJSON.shippingCost;
    OldOrderData.termId = this.OrderJSON.termId;
    OldOrderData.tagId = this.OrderJSON.tagId;


    let OrderScales = [];
    let OrderSizes = [];

    for (var i = 0; i < this.cart_cloth_details.length; i++) {

      for (var k = 0; k < this.cart_cloth_details[i].Fits.length; k++) {

        for (var j = 0; j < this.cart_cloth_details[i].Fits[k].GroupScales.length; j++) {

          OldOrderScales[j].quantity = this.cart_cloth_details[i].Fits[k].GroupScales[j].groupQty;
          OldOrderScales[j].dateUpdated = this.appUtils.GetCurrentDateTime();

          OrderScales.push(OldOrderScales[j]);
        }

        for (var l = 0; l < this.cart_cloth_details[i].Fits[k].OpenScales.length; l++) {

          for (var m = 0; m < this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes.length; m++) {
            OldOrderSizes[m].quantity = this.cart_cloth_details[i].Fits[k].OpenScales[l].Allsizes[m].cartQty;
            OldOrderSizes[m].dateUpdated = this.appUtils.GetCurrentDateTime();

            OrderSizes.push(OldOrderSizes[m]);
          }

        }

      }

    }

    console.log("*# UPDATED ORDER JSON", OldOrderData);
    console.log("*# UPDATED ORDER SCALES", OrderScales);
    console.log("*# UPDATED ORDER SIZES", OrderSizes);

    let OrdersArray: any = [];
    OrdersArray.push(OldOrderData);

    this.accountsProvider.SaveOrders(OrdersArray).subscribe(OrderRes => {

      this.accountsProvider.SaveOrderScales(OrderScales).subscribe(pos => {
        console.log("**OrderScales COMPLETED", pos);
        this.accountsProvider.SaveOrderSizes(OrderSizes).subscribe(pos => {
          console.log("**OrderSizes COMPLETED", pos);
          this.appUtils.presentToast('Order Saved Successfully');
          this.accountsProvider.SaveTempOrder(this.OrderJSON.orderId, this.cart_cloth_details, this.CustomerDetailsJSON, this.OrderJSON, OrderScales, OrderSizes).subscribe(SaveTempRes => {
            console.log("** CART TEMP ORDER SAVE", SaveTempRes);
            this.appUtils.presentToast('Order Saved Successfully');
            this.sessionHelper.SaveValueInSession('CartCustomer', null);
          });

        });

      });

    });

  }

  DeleteCart() {

    this.productsProvider.DeleteCartQty().subscribe(deleteRes => {
      this.sessionHelper.SaveValueInSession('CartCustomer', null);
      this.appCtrl.getRootNav().setRoot(MainHomePage);
    });

  }


  UpdateAccountDetails() {

    console.log("UPDATE", this.CustomerDetailsJSON);
    this.CustomerDetailsJSON.dateUpdated = this.appUtils.GetCurrentDateTime();
    let Accounts = [];
    Accounts.push(this.CustomerDetailsJSON);
    this.accountsProvider.SaveAccounts(Accounts).subscribe(UpdateAccountsRes => {
      let Communications = [];
      Communications.push(this.CustomerDetailsJSON.Communications);
      this.accountsProvider.UpdateCommunications(this.CustomerDetailsJSON.Communications).subscribe(CommRes => {
        console.log("**COMM UPDATE", CommRes);
        this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));

      });
    });


  }

  UpdateAddressDetails() {
    console.log("UPDATE ADDRESS SHIP", this.CustomerDetailsJSON.ShipToAddresses);
    console.log("UPDATE ADDRESS SOLD", this.CustomerDetailsJSON.SoldToAddresses);
    let Addresses = [];
    Addresses.push(this.CustomerDetailsJSON.ShipToAddresses);
    Addresses.push(this.CustomerDetailsJSON.SoldToAddresses);
    this.accountsProvider.SaveAddresses(Addresses).subscribe(UpdateAddressRes => {
      console.log("**ADDRESS UPDATE", UpdateAddressRes);
      this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));
    });

  }

  UpdateOther() {
    console.log("UPDATE CUSTOMER OPTIONAL INFOS", this.CustomerDetailsJSON.CustomerOptionalInfos);
    let OptionalInfos = [];
    OptionalInfos.push(this.CustomerDetailsJSON.CustomerOptionalInfos);
    this.accountsProvider.SaveCustomerOptionalInfos(OptionalInfos).subscribe(OptInfosRes => {
      console.log("**ADDRESS UPDATE", OptInfosRes);
      // this.UserDiscount = this.CustomerDetailsJSON.CustomerOptionalInfos.discount ;
      this.sessionHelper.SaveValueInSession('CartCustomer', JSON.stringify(this.CustomerDetailsJSON));
      this.GetFinalTotalAndAmount();
    });

  }

  SaveNewAccont() {
    if (this.CustomerDetailsJSONCOPY.email == "") {
      this.appUtils.presentToast('Please Enter General Details');
    } else if (this.CustomerDetailsJSONCOPY.ShipToAddresses.street == "") {
      this.appUtils.presentToast('Please Enter Address Details');
    } else if (this.CustomerDetailsJSONCOPY.SoldToAddresses.street == "") {
      this.appUtils.presentToast('Please Enter Sold To Address Details');
    } else if (this.CustomerDetailsJSONCOPY.CustomerOptionalInfos.discount == "") {
      this.appUtils.presentToast('Please Enter Customer Optional Info');
    } else {
      const AcRand: string = uuid();
      this.CustomerDetailsJSONCOPY.accountId = "LOC-" + AcRand;
      this.CustomerDetailsJSONCOPY.dateCreated = this.appUtils.GetCurrentDateTime();
      this.CustomerDetailsJSONCOPY.dateUpdated = this.appUtils.GetCurrentDateTime();
      this.CustomerDetailsJSONCOPY.lastLoginDate = this.appUtils.GetCurrentDateTime();
      console.log("SAVE ACCOUNT", this.CustomerDetailsJSONCOPY);
      this.accountsProvider.SaveNewAccount(this.CustomerDetailsJSONCOPY).subscribe(NewAcRes => {
        this.accountsProvider.SaveAccountMapping(this.CustomerDetailsJSONCOPY.accountId, '').subscribe(mapRes => {

          this.CustomerDetailsJSONCOPY.Communications.accountId = this.CustomerDetailsJSONCOPY.accountId;
          const CommRand: string = uuid();
          this.CustomerDetailsJSONCOPY.Communications.communicationId = "LOC-" + CommRand;
          this.CustomerDetailsJSONCOPY.Communications.dateUpdated = this.appUtils.GetCurrentDateTime();
          console.log("SAVE COMMUNICATION", this.CustomerDetailsJSONCOPY.Communications);
          let communications = [];
          communications.push(this.CustomerDetailsJSONCOPY.Communications);
          this.accountsProvider.SaveCommunications(communications).subscribe(CommunicationRes => {

            const AddShipRand: string = uuid();
            this.CustomerDetailsJSONCOPY.ShipToAddresses.addressTypeId = 2;
            this.CustomerDetailsJSONCOPY.ShipToAddresses.addressId = "LOC-" + AddShipRand;
            this.CustomerDetailsJSONCOPY.ShipToAddresses.accountId = this.CustomerDetailsJSONCOPY.accountId;
            this.CustomerDetailsJSONCOPY.ShipToAddresses.dateCreated = this.appUtils.GetCurrentDateTime();
            this.CustomerDetailsJSONCOPY.ShipToAddresses.dateUpdated = this.appUtils.GetCurrentDateTime();
            console.log("SAVE SHIP TO", this.CustomerDetailsJSONCOPY.ShipToAddresses);

            const AddSoldRand: string = uuid();
            this.CustomerDetailsJSONCOPY.SoldToAddresses.addressTypeId = 1;
            this.CustomerDetailsJSONCOPY.SoldToAddresses.addressId = "LOC-" + AddSoldRand;
            this.CustomerDetailsJSONCOPY.SoldToAddresses.accountId = this.CustomerDetailsJSONCOPY.accountId;
            this.CustomerDetailsJSONCOPY.SoldToAddresses.dateCreated = this.appUtils.GetCurrentDateTime();
            this.CustomerDetailsJSONCOPY.SoldToAddresses.dateUpdated = this.appUtils.GetCurrentDateTime();
            console.log("SAVE SOLD TO", this.CustomerDetailsJSONCOPY.SoldToAddresses);
            let addresses = [];
            addresses.push(this.CustomerDetailsJSONCOPY.ShipToAddresses);
            addresses.push(this.CustomerDetailsJSONCOPY.SoldToAddresses);
            this.accountsProvider.SaveAddresses(addresses).subscribe(AddressRes => {

              this.accountsProvider.SaveAddressIDMapping(this.CustomerDetailsJSONCOPY.accountId, '', this.CustomerDetailsJSONCOPY.ShipToAddresses.addressId, '', this.CustomerDetailsJSONCOPY.SoldToAddresses.addressId, '').subscribe(AddMapRes => {

                const CompaniesRand: string = uuid();
                this.CustomerDetailsJSONCOPY.Companies.accountId = this.CustomerDetailsJSONCOPY.accountId;
                this.CustomerDetailsJSONCOPY.Companies.companyId = "LOC-" + CompaniesRand;
                this.CustomerDetailsJSONCOPY.Companies.dateCreated = this.appUtils.GetCurrentDateTime();
                this.CustomerDetailsJSONCOPY.Companies.dateUpdated = this.appUtils.GetCurrentDateTime();
                console.log("SAVE COMPANIES", this.CustomerDetailsJSONCOPY.Companies);
                let companies = [];
                companies.push(this.CustomerDetailsJSONCOPY.Companies);
                this.accountsProvider.SaveCompanies(companies).subscribe(companiesRes => {

                  const CoptInfo: string = uuid();
                  this.CustomerDetailsJSONCOPY.CustomerOptionalInfos.accountId = this.CustomerDetailsJSONCOPY.accountId;
                  this.CustomerDetailsJSONCOPY.CustomerOptionalInfos.customerOptionalInfoId = "LOC-" + CoptInfo;
                  this.CustomerDetailsJSONCOPY.CustomerOptionalInfos.dateCreated = this.appUtils.GetCurrentDateTime();
                  this.CustomerDetailsJSONCOPY.CustomerOptionalInfos.dateUpdated = this.appUtils.GetCurrentDateTime();
                  console.log("SAVE ACCOUNT", this.CustomerDetailsJSONCOPY.CustomerOptionalInfos);
                  let infos = [];
                  infos.push(this.CustomerDetailsJSONCOPY.CustomerOptionalInfos);
                  this.accountsProvider.SaveCustomerOptionalInfos(infos).subscribe(infoRes => {
                    this.appUtils.presentToast("Customer Saved");
                    this.closenewcustmers();
                  });

                });

              });

            })


          });

        });

      });

    }

  }

  // SaveNewAddresses() {
  //   console.log("SAVE SHIP TO ADDRESSES", this.CustomerDetailsJSONCOPY.ShipToAddresses);
  //   console.log("SAVE SOLD TO ADDRESSES", this.CustomerDetailsJSONCOPY.SoldToAddresses);

  // }

  // UpdateOptionalInfos() {
  //   console.log("SAVE OPTIONAL INFOS", this.CustomerDetailsJSONCOPY.CustomerOptionalInfos);

  // }



  ////////////////////////////////////


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

    // this.navCtrl.push(CartDetailsPage,{
    //   From: 1 
    // });
    this.shared.closeMenu();
  }

  OpenMyOrders() {

    this.navCtrl.push(MyOrderPage);
    this.shared.closeMenu();
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

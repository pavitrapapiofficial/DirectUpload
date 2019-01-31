import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Events, ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { MainHomePage } from '../main-home/main-home';
import { ProductListingPage } from '../product-listing/product-listing';
import { CartDetailsPage } from '../cart-details/cart-details';
import * as $ from "jquery";
import { MyOrderPage } from '../my-order/my-order';
import { CustomerlistingPage } from '../customerlisting/customerlisting';
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { ConfigTablesProvider, ProductsProvider, AppUtilsProvider, SessionHelperProvider } from '../../providers/providers';
import { SyncDataPage } from '../sync-data/sync-data';
import { DeactivatedProductsPage } from '../deactivated-products/deactivated-products';
/**
 * Generated class for the ProductDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {

  product_id: any;

  product_details = { categoryId: '', styleNumber: 'Loading...', price: 0.00, DiscountedPrice: 0.00, clothesDescription: '', color: '' };
  product_images: any = [];
  all_product_scales: any = [];
  details_of_product: any;
  //more_products : any = [] ;
  cart_total_price: number = 0;
  cart_total_qty: number = 0;
  FitIds: any = new Set();
  InseamIds: any = new Set();
  screen_headers: any = [];
  hideFits = false;
  hideScaleGroup = false;
  FilteredOpen: any = [];
  FilteredGroup: any = [];

  page = 0;
  perPage = 24;
  totalData = 0;
  totalPage = 0;
  loaderHide = true;

  OpenSizes: any = [];
  GroupSizes: any = [];


  constructor(public navCtrl: NavController, public navParams: NavParams, public productsProvider: ProductsProvider, public configProvider: ConfigTablesProvider,
    private file: File, public appUtils: AppUtilsProvider, public alertCtrl: AlertController, platform: Platform, private toastCtrl: ToastController,
    private renderer: Renderer, public sessionProvider: SessionHelperProvider, public appCtrl: App, public events: Events,
    public shared: SharedhelperProvider) {

    // platform.registerBackButtonAction(() => {
    //   console.log("backPressed 1");
    //     this.navCtrl.pop();
    // },1);

  }




  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductDetailsPage');

    //this.screen_headers = [] ;
    this.product_id = this.navParams.get("ProductID");
    // this.screen_headers = this.navParams.get("ScreenHeaders");
    console.log("headers", this.navParams.get("ScreenHeaders"));
    this.product_images = [];
    // let folderName = 'Products/';

    this.productsProvider.GetBaseImageOfproduct(this.product_id).subscribe(res => {
      if (res.rows.length == 0) {
        console.log("No Image Of Product");
        this.product_images.push({
          path: "assets/imgs/no_image.jpg"
        });
      }
      else {
        console.log("Image Length", res.rows.length);
        for (var i = 0; i < res.rows.length; i++) {
          this.product_images.push({
            path: normalizeURL(this.file.dataDirectory + res.rows.item(i).imagePath),
            isActive: res.rows.item(i).isActive,
            sortOrder: res.rows.item(i).sortOrder,
            clothesImageId: res.rows.item(i).clothesImageId
          });
        }
      }

    }, error => {
      console.log("ERROR", error);
    });

    this.productsProvider.GetProductDetailsFromId(this.product_id).subscribe(res => {
      console.log("Product Details Res", res.rows.item(0));
      this.details_of_product = res.rows.item(0);
      this.product_details.styleNumber = res.rows.item(0).styleNumber;
      this.product_details.categoryId = res.rows.item(0).categoryId;
      this.product_details.color = res.rows.item(0).color;
      this.GetParentAndChildHeaders();

      if (res.rows.item(0).DiscountedPrice == null) {
        this.product_details.price = res.rows.item(0).price;
      } else {
        this.product_details.price = res.rows.item(0).DiscountedPrice;
        this.product_details.DiscountedPrice = res.rows.item(0).price;
      }

      var Title = $("<textarea/>").html(res.rows.item(0).clothesDescription).text();
      this.product_details.clothesDescription = Title;
      this.product_details.clothesDescription = this.product_details.clothesDescription.replace(/<\/?p[^>]*>/g, "");
    }, error => {
      console.log("ERROR", error);
    });

    this.GetScales();



  }

  ionViewWillEnter() {

    // this.AddScreenHeader(this.product_details.styleNumber, "ProductDetails", this.product_id);


  }





  GetScales() {

    this.all_product_scales = [];
    this.OpenSizes = [];
    this.GroupSizes = [];

    this.productsProvider.GetScalesOfProduct(this.product_id).subscribe(res => {
      if (res.rows.length == 0) {
        console.log("", "NO SCALES");
      } else {
        var clothsscalesID = [];
        var clothsScaleRes = [];
        for (var i = 0; i < res.rows.length; i++) {

          console.log("##PRODUCT SCALES", res.rows.item(i));

          clothsscalesID.push(res.rows.item(i).clothesScaleId);
          clothsScaleRes.push(res.rows.item(i));
          this.FitIds.add(res.rows.item(i).fitId);

          if (res.rows.item(i).inseamId == null) {

          } else {
            this.InseamIds.add(res.rows.item(i).inseamId);
          }
        }
        this.GetSizesOfScale(clothsscalesID, clothsScaleRes);

      }
    }, error => {
      console.log("ERROR", error);
    });

  }


  // GetMoreProductsCount(){

  //   this.productsProvider.GetCountProductsOfCategory(this.product_details.categoryId).subscribe(count => {
  //     this.totalData = count;
  //     console.log("Total Data", this.totalData, "Count", count);
  //     if (this.totalData == 0) {
  //       console.log("No Product Found");
  //     } else {
  //       let total = Math.floor(this.totalData / this.perPage);
  //       let mod = this.totalData % this.perPage;
  //       if (mod == 0) {
  //         this.totalPage = total;
  //       } else {
  //         this.totalPage = total + 1;
  //       }
  //       console.log("Total Data:-", this.totalData, "Total Page:-", total, "MODULAS:-", mod, "Final Total page:-", this.totalPage);
  //       this.GetMoreProducts(this.perPage * this.page, this.perPage);

  //       if(this.totalData < this.perPage){
  //        console.log("HIDE LOADER");
  //        this.loaderHide = false ;
  //       }else{
  //         this.loaderHide = true ;
  //       }

  //     }
  //   }, error => {
  //     console.log("ERROR", error);
  //   });

  // }



  // GetMoreProducts(startpageIndex, perpage){

  //   this.productsProvider.GetAllProductsOfCategory(this.product_details.categoryId, startpageIndex, perpage).subscribe(res => {
  //     if (res.rows.length == 0) {
  //       console.log("", "NO MORE PRODUCTS");
  //     } else {
  //      for(var i = 0 ; i < res.rows.length ; i++){
  //       let temp = res.rows.item(i);
  //       let imgepath = '';
  //       this.productsProvider.GetBaseImageOfproduct(res.rows.item(i).clothesId).subscribe(res => {
  //         //   console.log("PRODUCTS IMAGES" , temp.styleNumber, "Images" ,res);
  //         if (res.rows.length == 0) {

  //           imgepath = 'no_image';

  //         }
  //         else {
  //          // imgepath = res.rows.item(0).imagePath;
  //           var imagePath1 = this.file.dataDirectory + res.rows.item(0).imagePath;
  //           imgepath = normalizeURL(imagePath1);

  //         }

  //         this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

  //           if (val == 5) {

  //             if (temp.DiscountedPrice == null) {
  //               this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.msrp, Discount: '', img:  imgepath,
  //               futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });

  //             } else {
  //               this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedMSRP, Discount: temp.msrp, img: imgepath,
  //               futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  //             }

  //           }else{

  //             if (temp.DiscountedPrice == null) {
  //               this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.price, Discount: '', img: imgepath,
  //               futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });

  //             } else {
  //               this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedPrice, Discount: temp.price, img: imgepath,
  //               futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  //             }

  //           }

  //         }).catch(error => {
  //           console.log("API ERROR", error);
  //         });

  //       }, error => {
  //         console.log("ERROR", error);
  //       });
  //       } 
  //     }
  //   }, error => {
  //     console.log("ERROR", error);
  //   });

  // }

  // doInfinite(infiniteScroll) {
  //   console.log("Infinite Scroll", infiniteScroll);
  //   this.page = this.page + 1;
  //   console.log("Page", this.page, "start index", this.perPage * this.page);

  //   setTimeout(() => {

  //     this.productsProvider.GetAllProductsOfCategory(this.product_details.categoryId, this.perPage * this.page, this.perPage).subscribe(res => {
  //       if (res.rows.length == 0) {
  //         console.log("", "NO MORE PRODUCTS");
  //       } else {
  //        for(var i = 0 ; i < res.rows.length ; i++){
  //         let temp = res.rows.item(i);
  //         let imgepath = '';
  //         this.productsProvider.GetBaseImageOfproduct(res.rows.item(i).clothesId).subscribe(res => {
  //           //   console.log("PRODUCTS IMAGES" , temp.styleNumber, "Images" ,res);
  //           if (res.rows.length == 0) {

  //             imgepath = 'no_image';

  //           }
  //           else {
  //             var imagePath1 = this.file.dataDirectory + res.rows.item(0).imagePath;
  //             imgepath = normalizeURL(imagePath1);

  //           }

  //           this.sessionProvider.GetValuesFromSession('roleid').then((val) => {

  //             if (val == 5) {

  //               if (temp.DiscountedPrice == null) {
  //                 this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.msrp, Discount: '', img: imgepath,
  //                 futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });

  //               } else {
  //                 this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedMSRP, Discount: temp.msrp, img:  imgepath,
  //                 futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  //               }

  //             }else{

  //               if (temp.DiscountedPrice == null) {
  //                 this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.price, Discount: '', img:  imgepath,
  //                 futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });

  //               } else {
  //                 this.more_products.push({ categoryId: temp.categoryId, style: temp.styleNumber, price: temp.DiscountedPrice, Discount: temp.price, img:  imgepath,
  //                 futureDelivery: temp.futureDeliveryDate, id: temp.clothesId });
  //               }

  //             }

  //           }).catch(error => {
  //             console.log("API ERROR", error);
  //           });

  //         }, error => {
  //           console.log("ERROR", error);
  //         });
  //         } 
  //       }
  //     }, error => {
  //       console.log("ERROR", error);
  //     });

  //     console.log('Async operation has ended');
  //     infiniteScroll.complete();
  //   }, 100);

  // }



  OnChangeFits() {
    var x = (<HTMLInputElement>document.getElementById("fitSelect")).value;
    console.log("ON CHANGE FITS", x);
    //  console.log("PRODUCT" , this.all_product_scales[0].FitID);
    let selectedfit = this.all_product_scales.find(item => item.FitID.name === x);
    console.log("ON CHANGE FITS", selectedfit);


    this.FilteredOpen = selectedfit.OpenScales;
    console.log("First FIT DATA", this.FilteredOpen);

    this.FilteredGroup = selectedfit.GroupScales;
    console.log("FIRST GROUP FIT DATA", this.FilteredGroup);

  }




  GetSizesOfScale(scaleIds, scaleRes) {
    var sizeIds = [];
    var sizesRes = [];
    var sizeNames = [];
    var fits = [];
    var Inseams = [];
    console.log("***Scales", scaleIds);
    this.productsProvider.GetScaleSizesOfScale(scaleIds).subscribe(sizesScaleRes => {
      console.log("***ALL SIZES", sizesScaleRes);
      for (var i = 0; i < sizesScaleRes.rows.length; i++) {
        console.log("***ALL SIZES", sizesScaleRes);
        sizeIds.push(sizesScaleRes.rows.item(i).sizeId);
        sizesRes.push(sizesScaleRes.rows.item(i));
      }
      this.productsProvider.GetSizeDetailsFromID(sizeIds).subscribe(sizeDetailsres => {
        for (var i = 0; i < sizeDetailsres.rows.length; i++) {
          console.log("***SIZE DETAILS", sizesScaleRes);
          sizeNames.push({
            Name: sizeDetailsres.rows.item(i).name,
            id: sizeDetailsres.rows.item(i).sizeId
          });
        }
        console.log("***sizes", sizeNames);
        var myArr = [];
        myArr = Array.from(this.FitIds);
        this.productsProvider.GetFitsDataFromID(myArr).subscribe(fitsres => {
          console.log("**FITS RES", fitsres);

          if (fitsres.rows.length == 0) {
            this.hideFits = false;
            fits.push({
              fitId: 0
            });
          } else {
            this.hideFits = true;
            for (var i = 0; i < fitsres.rows.length; i++) {
              fits.push(fitsres.rows.item(i));
            }
          }

          var myArr1 = [];
          myArr1 = Array.from(this.InseamIds);
          this.productsProvider.GetInseamDataFromID(myArr1).subscribe(Inseamres => {
            console.log("** INSEAMS RES", Inseamres);
            for (var i = 0; i < Inseamres.rows.length; i++) {
              Inseams.push(Inseamres.rows.item(i));
            }

            for (var i = 0; i < fits.length; i++) {
              var FitsData = [];
              var opensizesAndScales = [];
              var groupsizesAndScales = [];
              for (var j = 0; j < scaleRes.length; j++) {

                if (scaleRes[j].fitId == null) {
                  console.log("** NULL FITS IDS IN SCALE");
                  scaleRes[j].fitId = 0;
                }
                console.log("** FITS IDS IN SCALE", scaleRes[j].fitId, fits[i].fitId);
                if (fits[i].fitId === scaleRes[j].fitId) {
                  console.log("** FITS IDS IN SCALE", fits[i].fitId, scaleRes[j].fitId);
                  if (scaleRes[j].isOpenSize == 'true') {
                    var opensizes = [];
                    var groupSizes = [];
                    for (var k = 0; k < sizesRes.length; k++) {
                      // console.log("** CLOTHES SCALE", scaleRes[j].clothesScaleId, sizesRes[k].clothesScaleId);
                      if (scaleRes[j].clothesScaleId === sizesRes[k].clothesScaleId) {
                        let sizeNAME = sizeNames.find(item => item.id === sizesRes[k].sizeId);
                        opensizes.push({
                          nameofSize: sizeNAME.Name,
                          sizeDetails: sizesRes[k],
                          cartQty: ''
                        });
                      }

                    }

                    var openData1 = { scale: "", InSeam: "", Allsizes: [] };
                    let ins;
                    if (Inseams.length == 0) {
                      openData1.scale = scaleRes[j];
                      openData1.InSeam = '';
                      openData1.Allsizes = opensizes;
                      opensizesAndScales.push(openData1);
                    } else {
                      if (scaleRes[j].inseamId == null) {

                      } else {
                        ins = Inseams.find(item => item.inseamId === scaleRes[j].inseamId);
                        openData1.scale = scaleRes[j];
                        openData1.InSeam = ins.name;
                        openData1.Allsizes = opensizes;
                        opensizesAndScales.push(openData1);
                      }
                    }

                  }

                  else {
                    // var opensizes1 = [];
                    var groupSizes1 = [];
                    for (var k = 0; k < sizesRes.length; k++) {
                      if (scaleRes[j].clothesScaleId === sizesRes[k].clothesScaleId) {
                        let sizeNAME = sizeNames.find(item => item.id === sizesRes[k].sizeId);
                        groupSizes1.push({
                          nameofSize: sizeNAME.Name,
                          sizeDetails: sizesRes[k]
                        });
                      }
                    }

                    var openData2 = { scale: "", InSeam: "", Allsizes: [], groupQty: '' };
                    let ins;
                    if (Inseams.length == 0) {
                      openData2.scale = scaleRes[j];
                      openData2.InSeam = '';
                      openData2.Allsizes = groupSizes1;
                      groupsizesAndScales.push(openData2);
                    } else {
                      if (scaleRes[j].inseamId == null) {

                      } else {
                        ins = Inseams.find(item => item.inseamId === scaleRes[j].inseamId);
                        openData2.scale = scaleRes[j];
                        openData2.InSeam = ins.name;
                        openData2.Allsizes = groupSizes1;
                        groupsizesAndScales.push(openData2);
                      }
                    }
                  }

                }

              }
              this.all_product_scales.push({
                FitID: fits[i],
                OpenScales: opensizesAndScales,
                GroupScales: groupsizesAndScales
              });

            }
            console.log("***NEW SCALES WITH FITS", this.all_product_scales);
            this.GetAllOpenSizes();
          }, error => {
            console.log("ERROR", error);
          });

        }, error => {
          console.log("ERROR", error);
        });


      }, error => {

      });


    }, error => {

    });

  }


  GetAllOpenSizes() {

    for (var i = 0; i < this.all_product_scales[0].OpenScales[0].Allsizes.length; i++) {
      this.OpenSizes.push(this.all_product_scales[0].OpenScales[0].Allsizes[i].nameofSize);
    }

    this.sessionProvider.GetValuesFromSession('roleid').then((val) => {
      if (val == 1) {
        this.hideScaleGroup = true;
        for (var i = 0; i < this.all_product_scales[0].GroupScales[0].Allsizes.length; i++) {
          this.GroupSizes.push(this.all_product_scales[0].GroupScales[0].Allsizes[i].nameofSize);
        }

        this.FilteredGroup = this.all_product_scales[0].GroupScales;
        console.log("FIRST GROUP FIT DATA", this.FilteredGroup);
      } else {
        this.hideScaleGroup = false;
        this.FilteredGroup = [];

      }

    }).catch(error => {
      console.log("API ERROR", error);
    });


    this.FilteredOpen = this.all_product_scales[0].OpenScales;
    console.log("First FIT DATA", this.FilteredOpen);
    // this.GetMoreProductsCount();
  }




  change(value: any, maxqty: number, ind: any, parentInd: any, clothscalesizeID: any, from: any) {
    console.log("Changed Value", value, maxqty);
    // var regex = /^[0-9]+$/;
    // if (!value.match(regex)) {
    //   if (from == 1) {
    //     this.FilteredOpen[parentInd].Allsizes[ind].cartQty = 0;
    //   } else {
    //     this.FilteredGroup[parentInd].groupQty = 0;
    //   }

    //   this.presentBasicAlert("Alert", "Input Number Only");
    //   return false;
    // } else {

    if (value == '') {
      console.log("Value Empty");
    } else {
      if (value > maxqty) {
        if (from == 1) {
          this.FilteredOpen[parentInd].Allsizes[ind].cartQty = 0;
          $('#object-' + ind).val(null);
          console.log("**", $('#object-' + ind).val());
          this.CartPriceAndQty();
          console.log("**OPEN INDEX CART", this.FilteredOpen[parentInd].Allsizes[ind]);

        } else {
          this.FilteredGroup[parentInd].groupQty = 0;
          this.CartPriceAndQty();
          $('#object-' + ind).val(null);
          console.log("**", $('#object-' + ind).val());
        }
        this.presentBasicAlert("Alert", "You cannot order more than " + maxqty + " quantity for this size");
        //this.presentToast("You cannot order more than " + maxqty + " quantity for this size");
      } else {
        if (from == 1) {
          console.log("FROM OPEN Changed", this.FilteredOpen[parentInd]);
          this.CartPriceAndQty();
        } else {
          console.log("FROM GROUP Changed", this.FilteredGroup[parentInd]);
          this.CartPriceAndQty();
        }


        //  this.CartPriceAndQty(parentInd , ind);
        //   console.log("Changed" , this.FilteredOpen[parentInd].Allsizes[ind]);
      }
    }


    // }

  }

  EnterPressed(value: number, maxqty: number, ind: any, parentInd: any) {
    // console.log("Changed Value", value, maxqty);
    // console.log("Changed Index", ind);
    // console.log("Changed JSON VALUE", this.open_product_scales[parentInd].Sizes);
    // this.CartPriceAndQty();
    this.renderer.invokeElementMethod(event.target, 'blur');
  }

  presentBasicAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  CartPriceAndQty() {
    var total = 0;
    for (var i = 0; i < this.all_product_scales.length; i++) {
      //console.log("PRODUCT PARENT", this.all_product_scales[i]);
      for (var j = 0; j < this.all_product_scales[i].OpenScales.length; j++) {
        // console.log("PRODUCT SIZES", this.all_product_scales[i].OpenScales[j]);
        for (var k = 0; k < this.all_product_scales[i].OpenScales[j].Allsizes.length; k++) {
          var cart = this.all_product_scales[i].OpenScales[j].Allsizes[k].cartQty;
          if (cart === "") {
            cart = 0;
          } else {
            cart = this.all_product_scales[i].OpenScales[j].Allsizes[k].cartQty;
          }
          var integer_qty = parseInt(cart, 10);
          total = total + integer_qty;
        }
      }

      for (var l = 0; l < this.all_product_scales[i].GroupScales.length; l++) {
        var gtotal = 0;
        for (var k = 0; k < this.all_product_scales[i].GroupScales[l].Allsizes.length; k++) {
          var gcart = this.all_product_scales[i].GroupScales[l].Allsizes[k].sizeDetails.quantity;
          gtotal = gtotal + gcart;
        }
        var gr = this.all_product_scales[i].GroupScales[l].groupQty;
        if (gr === "") {
          gr = 0
        } else {
          gr = this.all_product_scales[i].GroupScales[l].groupQty;
        }
        var groupTotal = gr * gtotal;
        total = total + groupTotal;

      }

    }
    this.cart_total_qty = total;
    console.log("TOTAL QTY", this.cart_total_qty);
    console.log("PRICE", this.product_details.price * this.cart_total_qty);
    this.cart_total_price = this.product_details.price * this.cart_total_qty;

  }



  BreakPacket(groupIndex: any, groupScale: any) {
    console.log("**GROUP SCALE", groupScale);
    console.log("**GROUP INDEX", groupIndex);
    console.log("**FILTERED GROUP", this.FilteredGroup);
    if (groupScale.scale.invQty > 0) {
      for (var i = 0; i < this.FilteredOpen[groupIndex].Allsizes.length; i++) {
        var first = this.FilteredOpen[groupIndex].Allsizes[i].sizeDetails.quantity;
        var s = groupScale.Allsizes[i].sizeDetails.quantity;
        var t = s + first;
        this.FilteredOpen[groupIndex].Allsizes[i].sizeDetails.quantity = t;
      }
      let max = groupScale.scale.invQty;
      var integer_qty = parseInt(max, 10);
      console.log("***", max, 1);
      let upd = integer_qty - 1;
      console.log("**REMAINING STOCK", upd);
      this.productsProvider.UpdateStockScale(groupScale.scale.clothesScaleId, upd);
      this.GetScales();
    } else {
      this.appUtils.presentToast('Can not break');
    }


  }


  // OpenCustomerListing() {
  //   console.log("method chla");
  //   //this.navCtrl.push('CustomerlistingPage');

  // }

  AddScreenHeader(title, type, typeid) {

    this.screen_headers.push({
      header_title: title,
      header_type: type,
      header_type_id: typeid
    });

  }
  onHeaderClick(header) {
    console.log("Header click", header);
    if (header.header_type == 'Home') {
      this.appCtrl.getRootNav().setRoot(MainHomePage);
    } else if (header.header_type == 'ProductListing') {
      this.navCtrl.popTo(this.navCtrl.getByIndex(1));
    }

  }

  OpenRelatedDetails(prodID) {

    this.navCtrl.push(ProductDetailsPage, {
      ProductID: prodID,
      ScreenHeaders: this.screen_headers
    });

  }


  GetParentAndChildHeaders() {

    let parent, child;
    this.configProvider.GetCategoryDetails(this.product_details.categoryId).subscribe(res => {
      console.log("**", res.rows.item(0));
      if (res.rows.item(0).CategoryLevel == 2) {
        this.configProvider.GetCategoryDetails(res.rows.item(0).parentId).subscribe(res1 => {
          child = res1.rows.item(0);
          this.configProvider.GetCategoryDetails(res1.rows.item(0).parentId).subscribe(res2 => {
            parent = res2.rows.item(0);
            this.AddScreenHeader("home", "Home", "");
            this.AddScreenHeader(parent.name, "ProductListing", parent.categoryId);
            this.AddScreenHeader(child.name, "ProductListing", child.categoryId);
            this.AddScreenHeader(this.product_details.styleNumber, "ProductDetails", this.product_id);
          }, error => {

          });
        }, error => {

        });

      } else if (res.rows.item(0).CategoryLevel == 1) {
        child = res.rows.item(0);

        this.configProvider.GetCategoryDetails(res.rows.item(0).parentId).subscribe(res1 => {
          parent = res1.rows.item(0);
          this.AddScreenHeader("home", "Home", "");
          this.AddScreenHeader(parent.name, "ProductListing", parent.categoryId);
          this.AddScreenHeader(child.name, "ProductListing", child.categoryId);
          this.AddScreenHeader(this.product_details.styleNumber, "ProductDetails", this.product_id);
        }, error => {

        });

      }

    }, error => {

    });

  }


  AddToCart() {

    if (this.cart_total_qty == 0) {
      this.presentBasicAlert("Error", "Enter Quantity");
    } else {

      var cartJson = { product_id: "", product_details: "", product_images: [], cart_data: [], total_price: 0, total_qty: 0 };
      let bc = 0;
      let bc1 = 0;
      let all_cart = [];

      for (var i = 0; i < this.all_product_scales.length; i++) {
        console.log("PRODUUCT LENGTH", this.all_product_scales[i]);
        var groupScales = [];
        var openScales = [];
        for (var j = 0; j < this.all_product_scales[i].GroupScales.length; j++) {
          console.log("GROUP QTY", this.all_product_scales[i].GroupScales[j].groupQty);
          bc1 = this.all_product_scales[i].GroupScales[j].groupQty;
          // if(bc1 == 0){
          //   console.log("GROUP IFF"); 
          // }else{
          //   console.log("GROUP ELSE"); 
          let max = this.all_product_scales[i].GroupScales[j].scale.invQty;
          var integer_qty = parseInt(max, 10);
          console.log("***", max, bc1);
          let upd = integer_qty - bc1;
          console.log("**REMAINING STOCK", upd);
          this.productsProvider.UpdateStockScale(this.all_product_scales[i].GroupScales[j].scale.clothesScaleId, upd);
          groupScales.push(this.all_product_scales[i].GroupScales[j]);
          //  }
        }
        for (var k = 0; k < this.all_product_scales[i].OpenScales.length; k++) {
          let scales = {};
          for (var l = 0; l < this.all_product_scales[i].OpenScales[k].Allsizes.length; l++) {
            bc = this.all_product_scales[i].OpenScales[k].Allsizes[l].cartQty;
            //  if(bc == 0){
            //    console.log("OPEN IFF");
            //  //  scales = [];
            //  }else{
            //   console.log("OPEN ELSE");
            let max = this.all_product_scales[i].OpenScales[k].Allsizes[l].sizeDetails.quantity;
            var integer_qty1 = parseInt(max, 10);
            console.log("***", max, bc);
            let upd = integer_qty1 - bc;
            console.log("**REMAINING STOCK", upd);
            this.productsProvider.UpdateStockOfSize(this.all_product_scales[i].OpenScales[k].Allsizes[l].sizeDetails.clothesScaleSizeId, upd);
            scales = this.all_product_scales[i].OpenScales[k];
            //   }
          }
          openScales.push(scales);

        }

        all_cart.push({
          fitId: this.all_product_scales[i].FitID,
          GroupScales: groupScales,
          OpenScales: openScales
        });


      }

      cartJson.product_id = this.product_id;
      cartJson.product_images = this.product_images;
      cartJson.product_details = this.details_of_product;
      cartJson.cart_data = all_cart;
      cartJson.total_price = this.cart_total_price;
      cartJson.total_qty = this.cart_total_qty;

      console.log("##CART JSON ", cartJson);

      this.productsProvider.SaveIntoCart(this.product_id, cartJson).subscribe(rs => {
        this.GetScales();
        this.presentBasicAlert("Success", "Product added to cart successfully");
      }, error => {
        console.log("SOMETHING WRONG WITH ADD TO CART");
      });

    }

  }


  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }



  ///////////////////////////////Shared Methods


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

    this.sessionProvider.SaveValueInSession('userid', 0);
    this.sessionProvider.SaveValueInSession('roleid', '5');
    this.sessionProvider.SaveValueInSession('userEmail', 'NULL');
    this.shared.closeMenu();
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }


  OpenHomeRoot() {
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }



}

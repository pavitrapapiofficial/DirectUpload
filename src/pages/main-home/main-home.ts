import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { SessionHelperProvider, AppUtilsProvider, ProductsProvider, ConfigTablesProvider, ApiHelperProvider, AccountsProvider } from '../../providers/providers';
import { Events, App } from 'ionic-angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { normalizeURL, ToastController, AlertController } from 'ionic-angular';
import { SharedhelperProvider } from '../../providers/sharedhelper/sharedhelper';
import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ProductListingPage } from '../product-listing/product-listing';
import { CartDetailsPage } from '../cart-details/cart-details';
import { MyOrderPage } from '../my-order/my-order';
import { CustomerlistingPage } from '../customerlisting/customerlisting';
import * as $ from "jquery";
import { SyncDataPage } from '../sync-data/sync-data';
import { DeactivatedProductsPage } from '../deactivated-products/deactivated-products';

/**
 * Generated class for the MainHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-main-home',
  templateUrl: 'main-home.html',
})
export class MainHomePage {

  sliderImages = [];

  data = { title: '', description: '', date: '', time: '' };

  productIndex = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, platform: Platform, public events: Events, private transfer: FileTransfer, public configProvider: ConfigTablesProvider,
    public sessionProvider: SessionHelperProvider, public appUtils: AppUtilsProvider, private file: File, public productsProvider: ProductsProvider, public ApiHelper: ApiHelperProvider,
    public backgroundMode: BackgroundMode, public localNotification: LocalNotifications, public toastctrl: ToastController, public alertCtrl: AlertController, private renderer: Renderer,
    public shared: SharedhelperProvider, public appCtrl: App, public accountsProvider: AccountsProvider) {
    console.log("HOME PAGE")
    // platform.registerBackButtonAction(() => {
    //   console.log("backPressed 1");
    //     this.navCtrl.popAll();
    // },1);

    backgroundMode.setDefaults({
      title: 'Downloading',
      text: 'Data Downloading',
      icon: 'icon',
      color: '#F14F4D',
      resume: true,
      hidden: true,
      bigText: true
    });

    this.shared.GetCaltalogue();

  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad MainHomePage');


    this.backgroundMode.enable();
    this.backgroundMode.on("EVENT").subscribe(event => {
      console.log("** Event Changed", event);
    });



    // this.sessionProvider.GetBackImages().then((val)=>{
    //   let slider = val.split(','); 
    //   this.sliderImages.push(normalizeURL(slider[0])); 
    //   this.sliderImages.push(normalizeURL(slider[1])); 
    //   }).catch(error =>{
    //     console.log("API ERROR" , error);
    //   });

    //  this.readFile(this.sliderImages[0]);

    this.appUtils.AddScreenHeader("home", "Home", "");

    var date = new Date(this.data.date + " " + this.data.time);


  }


  openStatusPage() {
    this.navCtrl.push(SyncDataPage, {
      From: 2
    });
  }


  readFile(fileEntry) {
    fileEntry.file(function (file) {
      var reader = new FileReader();

      reader.onloadend = function () {

        console.log("Successful file read: " + this.result);
        // displayFileData(fileEntry.fullPath + ": " + this.result);

      };

      reader.readAsText(file);

    });
  }


  public BackgroundImagesDownload() {
    this.backgroundMode.disableWebViewOptimizations();
    console.log("**", "Background called");
    this.backgroundMode.on("activate").subscribe(() => {
      // this.nativeAudio.play("audio1");  
      console.log("**", "Play Background Playing");
    });
    console.log("**", "Background Playing");
    // this.nativeAudio.play("audio1"),() => console.log('audio1 is done playing'));
    this.SaveProductsImagesOffline();
  }




  SaveProductsImagesOffline() {

    this.productsProvider.GetAllImagesFromDB().subscribe(res => {
      console.log("Products Images Length", res.rows.length);
      if (res.rows.length == 0) {
        console.log("**NO Products Images Found", "");
      } else {
        this.DownloadProductImages(res.rows.item(this.productIndex).imagePath, this.productIndex, res.rows.length, res);
      }

    }, error => {
      console.log("ERROR", error);
    });

  }

  DownloadProductImages(Fname, pos, size, response) {
    Fname = encodeURIComponent(Fname.trim())
    const fileUrl = "http://50.63.172.206/Library/Uploads/WebThumb/" + Fname;
    console.log("File Url", fileUrl);
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(fileUrl, this.file.dataDirectory + Fname).then((entry) => {
      console.log('download complete: ' + entry.toURL(), pos, size);
      // resolve(entry.toURL);
      this.configProvider.UpdateImportEntity(5, 'Product Images', 2, pos, '', this.appUtils.GetCurrentDateTime());
      // this.checkFile(Fname);
      if (this.productIndex + 1 == size) {
        console.log("**All done");
        this.configProvider.UpdateImportEntity(5, 'Product Images', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());

        this.presentToast(this.productIndex);

      } else {
        this.productIndex = this.productIndex + 1;
        this.presentToast(this.productIndex);
        this.DownloadProductImages(response.rows.item(this.productIndex).imagePath, this.productIndex, response.rows.length, response);
      }
      // this.readFile(entry);
    }, (error) => {
      // handle error
      console.log('**download error: ', Fname);
      this.productIndex = this.productIndex + 1;
      this.DownloadProductImages(response.rows.item(this.productIndex).imagePath, this.productIndex, response.rows.length, response);
      // resolve(error);
    });


  }


  presentToast(ind) {

    let toast = this.toastctrl.create({
      message: "RUN " + ind,
      duration: 2000,
      position: 'top'
    });
    toast.onDidDismiss(() => {

    });
    toast.present();

  }


  //////////////////////////////

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

    this.navCtrl.push(CustomerlistingPage);
    this.shared.closeMenu();
  }

  OpenDeactivatedProducts() {
    this.navCtrl.push(DeactivatedProductsPage);
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
      //  this.OpenDeactivatedProducts(id, name, 2);
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

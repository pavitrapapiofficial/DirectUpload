import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, App, ToastController, NavParams } from 'ionic-angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { MainHomePage } from '../main-home/main-home';
import { BackgroundMode } from '@ionic-native/background-mode';
import { ApiHelperProvider, SessionHelperProvider, ConfigTablesProvider, AppUtilsProvider, ProductsProvider, AccountsProvider } from '../../providers/providers';
/**
 * Generated class for the SyncDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-sync-data',
  templateUrl: 'sync-data.html',

})
export class SyncDataPage {

  BackImages: any = [];
  data = { UserId: 0, Mode: 0, SubMode: 7, DeviceInfo: 'Test Device', SyncDate: '2010-04-16 14:00:00.000' };
  backImagesPath: any = [];
  productIndex = 0;
  statusLoading = 'Loading';
  productImagesStatus = 'In Queue';
  SyncFromDate: "";
  From: any;
  TempLastSyncTime = "";
  TempArrayNewAccounts: any = [];

  constructor(public navCtrl: NavController, public ApiHelper: ApiHelperProvider, public loadingCtrl: LoadingController, public backgroundMode: BackgroundMode,
    private transfer: FileTransfer, private file: File, public sessionHelper: SessionHelperProvider, public appCtrl: App, public toastctrl: ToastController, public navParams: NavParams,
    public configProvider: ConfigTablesProvider, public appUtils: AppUtilsProvider, public productsProvider: ProductsProvider, public accountsProvider: AccountsProvider
  ) {

    backgroundMode.setDefaults({
      title: 'Downloading',
      text: 'Data Downloading',
      icon: 'icon',
      color: '#F14F4D',
      resume: true,
      hidden: true,
      bigText: true
    });

  }

  ionViewDidLoad() {

    this.From = this.navParams.get("From");

    this.backgroundMode.enable();
    this.backgroundMode.on("EVENT").subscribe(event => {
      console.log("** Event Changed", event);
    });

    console.log('ionViewDidLoad SyncDataPage');

    this.sessionHelper.GetValuesFromSession('LastSync').then((val) => {
      if (this.From == 1) {
        if (val == null) {
          this.SyncData('2010-04-16 14:00:00.000');
        } else {
          this.SyncData(val);
        }
      } else {

        this.PostIpadSync("");
        // this.sessionHelper.GetValuesFromSession('LastSyncLocal').then((localSync) => {
        //   if (localSync == null) {
        //     this.PostSyncStart(val);
        //     this.TempLastSyncTime = val;
        //   } else {
        //     this.TempLastSyncTime = localSync;
        //     this.PostSyncStart(localSync);
        //   }
        // })

      }

    });


    // this.sessionHelper.GetValuesFromSession('SYNCJSON').then((val) => {
    //   if (val == null) {
    //     this.SyncData();
    //   } 
    // }).catch(error => {
    //   console.log("API ERROR", error);
    // });



  }


  SyncData(fromDate) {

    this.sessionHelper.GetValuesFromSession('userid').then((val) => {
      this.data.UserId = val;
      this.data.Mode = 0;
      this.data.SubMode = 0;
      this.data.DeviceInfo = 'Test Device';
      this.data.SyncDate = fromDate;
      this.statusLoading = 'API Running';

      console.log("**API POST DATA", this.data);

      this.ApiHelper.RequestPostHttp(this.data, 'FullSync', false).then(result => {
        //here you have the analog success function from an ajax call 
        //use the received data
        console.log("@@ RESPONS ", result);
        if (result.Success == true) {
          if (this.From == 1) {
            this.sessionHelper.SaveValueInSession("LastSync", result.ServerDate);
            this.sessionHelper.SaveValueInSession("SYNCJSON", result);
          } else if (this.From == 2) {
            this.sessionHelper.SaveValueInSession("LastSyncLocal", result.ServerDate);
          } else if (this.From == 3) {
            this.sessionHelper.SaveValueInSession("LastSyncLocal", result.ServerDate);
          }
          this.presentToast("Api Run Successfully" + this.appUtils.GetCurrentDateTime());
          this.statusLoading = 'Got Response';
          this.SaveTermsInDB(result);
        } else {
          this.presentToast('Something happened wrong with api');
        }

      },
        error => {
          //here you have the analog error function from an ajax call 
          //treat the error
          this.statusLoading = 'API Failed';
          console.log("ERROR", error);
        }
      );

    });





  }


  SaveCategoriesInDB(result) {
    if (result.Categories.length > 0) {
      this.configProvider.SaveCategoryINDB(result.Categories).subscribe(pos => {
        console.log("**CATEGORIES COMPLETED", pos);
        this.presentToast("categories Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveProductsInDB(result);
      }, error => {
        console.log("SAVE CATEGORIES ERROR", error);
      });
    } else {
      this.SaveProductsInDB(result);
    }


  }

  SaveProductsInDB(result) {
    if (result.Clothes.length > 0) {
      this.productsProvider.SaveProducts(result.Clothes).subscribe(pos => {
        console.log("**PRODUCTS COMPLETED", pos);
        this.presentToast("Products Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveProductImages(result);

      }, error => {
        console.log("SAVE PRODUCTS ERROR", error);
      });
    } else {
      this.SaveProductImages(result);
    }
  }


  SaveProductImages(result) {
    if (result.ClothesImages.length > 0) {
      this.productsProvider.SaveImagesInTable(result.ClothesImages).subscribe(pos => {
        console.log("**PRODUCT IMAGES COMPLETED", pos);
        this.presentToast("Product Images Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveProductScales(result);

      }, error => {
        console.log("SAVE CATEGORIES ERROR", error);
      });
    } else {
      this.SaveProductScales(result);
    }

  }

  SaveProductScales(result) {
    if (result.ClothesScales.length > 0) {
      this.productsProvider.SaveClothScales(result.ClothesScales).subscribe(pos => {
        console.log("**SCALES COMPLETED", pos);
        this.presentToast("Product Scales Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveProductScaleSizes(result);

      }, error => {
        console.log("SAVE PRODUCT SCALES ERROR", error);
      });
    } else {
      this.SaveProductScaleSizes(result);

    }
  }

  SaveProductScaleSizes(result) {
    if (result.ClothesScaleSizes.length > 0) {
      this.productsProvider.SaveScaleSizes(result.ClothesScaleSizes).subscribe(pos => {
        console.log("**SCALE SIZES COMPLETED", pos);
        this.presentToast("Product Scale Sizes Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveSizesMasterInDB(result);
      }, error => {
        console.log("SAVE PRODUCT SCALE SIZES ERROR", error);
      });
    } else {
      this.SaveSizesMasterInDB(result);
    }
  }

  SaveSizesMasterInDB(result) {
    if (result.Sizes.length > 0) {
      this.productsProvider.SaveSizesMaster(result.Sizes).subscribe(pos => {
        console.log("**MASTER SIZES COMPLETED", pos);
        this.presentToast("Sizes Master Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveFitsMasterInDB(result);

      }, error => {
        console.log("SAVE SIZE MASTER ERROR", error);
      });
    } else {
      this.SaveFitsMasterInDB(result);

    }
  }

  SaveFitsMasterInDB(result) {
    if (result.Fits.length > 0) {
      this.productsProvider.SaveFitsMaster(result.Fits).subscribe(pos => {
        console.log("**MASTER FITS COMPLETED", pos);
        this.presentToast("Fits Master Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveInseamMasterInDB(result);

      }, error => {
        console.log("SAVE FITS MASTER ERROR", error);
      });
    } else {
      this.SaveInseamMasterInDB(result);

    }
  }
  SaveInseamMasterInDB(result) {
    if (result.Inseams.length > 0) {
      this.productsProvider.SaveInseamMaster(result.Inseams).subscribe(pos => {
        console.log("**MASTER INSEAM COMPLETED", pos);
        this.presentToast("Inseam Master Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveSizeGroupMasterInDB(result);
      }, error => {
        console.log("SAVE INSEAM MASTER ERROR", error);
      });
    } else {
      this.SaveSizeGroupMasterInDB(result);
    }
  }

  SaveSizeGroupMasterInDB(result) {
    if (result.SizeGroups.length > 0) {
      this.productsProvider.SaveSizeGroupMaster(result.SizeGroups).subscribe(pos => {
        console.log("**MASTER SIZE GOUPS COMPLETED", pos);
        this.presentToast("Sizes Group Master Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveAccounts(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveAccounts(result);
    }
  }

  SaveAccounts(result) {
    if (result.Accounts.length > 0) {
      this.accountsProvider.SaveAccounts(result.Accounts).subscribe(pos => {
        console.log("**Accounts COMPLETED", pos);
        this.presentToast("Accounts Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveCommunications(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });

    } else {
      this.SaveCommunications(result);
    }

  }

  SaveCommunications(result) {
    if (result.Communications.length > 0) {
      this.accountsProvider.SaveCommunications(result.Communications).subscribe(pos => {
        console.log("**Communications COMPLETED", pos);
        this.presentToast("Communications Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveCompanies(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveCompanies(result);
    }
  }

  SaveCompanies(result) {
    if (result.Companies.length > 0) {
      this.accountsProvider.SaveCompanies(result.Companies).subscribe(pos => {
        console.log("**Companies COMPLETED", pos);
        this.presentToast("Companies Successfully" + this.appUtils.GetCurrentDateTime());

        if (this.From == 1) {
          this.SaveCustomerOptionalInfos(result);
        } else if (this.From == 2) {
          console.log("@@ SHOULD BE DELETE BLOCK", "");
          var localIds = [];
          for (var i = 0; i < this.TempArrayNewAccounts.length; i++) {
            let ServerACID = this.TempArrayNewAccounts[i];
            console.log("@@ SERVER AC ID", ServerACID);
            this.accountsProvider.GetLocAccountID(ServerACID).subscribe(LocIDRes => {
              console.log("@@ LOCAL IDS TO ACCONTS", LocIDRes.rows.item(0).LocAccountId, ServerACID);
              localIds.push(LocIDRes.rows.item(0).LocAccountId);
              this.accountsProvider.UpdateUserIDinAddressMapping(LocIDRes.rows.item(0).LocAccountId, ServerACID).subscribe(UpdateRes => {
                console.log("@@ LOCAL IDS UPDATED IN ADDRESS MAP", UpdateRes);
              });
            });
          }
          console.log("@@ LOCAL IDS TO DELETE", localIds);
          let query = 'DELETE FROM Accounts WHERE accountId IN (?)';
          this.accountsProvider.DeleteLocalIdEntries(localIds, query).subscribe(Delres => {
            console.log("@@ ACCOUNTS DELETED", Delres);
            let query = 'DELETE FROM Communications WHERE accountId IN (?)';
            this.accountsProvider.DeleteLocalIdEntries(localIds, query).subscribe(DelCommRes => {
              console.log("@@ COMMUNICATIONS DELETED", DelCommRes);
              let query = 'DELETE FROM Companies WHERE accountId IN (?)';
              this.accountsProvider.DeleteLocalIdEntries(localIds, query).subscribe(DelCompRes => {
                console.log("@@ COMPANIES DELETED", DelCompRes);
                this.SaveCustomerOptionalInfos(result);

              });
            });

          });
        } else if (this.From == 3) {
          this.SaveCustomerOptionalInfos(result);
        }

        // this.SaveCustomerOptionalInfos(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveCustomerOptionalInfos(result);
    }
  }

  SaveCustomerOptionalInfos(result) {
    if (result.CustomerOptionalInfos.length > 0) {
      this.accountsProvider.SaveCustomerOptionalInfos(result.CustomerOptionalInfos).subscribe(pos => {
        console.log("**CustomerOptionalInfos COMPLETED", pos);
        this.presentToast("CustomerOptionalInfos Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveAddresses(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveAddresses(result);
    }
  }

  SaveAddresses(result) {
    if (result.Addresses.length > 0) {
      this.accountsProvider.SaveAddresses(result.Addresses).subscribe(pos => {
        console.log("**Addresses COMPLETED", pos);
        this.presentToast("Addresses Successfully" + this.appUtils.GetCurrentDateTime());
        if (this.From == 1) {
          this.SaveRelatedClothes(result);
        } else if (this.From == 2) {

          //  var localIds = [];
          for (var i = 0; i < this.TempArrayNewAccounts.length; i++) {
            this.accountsProvider.GetLocAddressMapping(this.TempArrayNewAccounts[i]).subscribe(LocIDRes => {
              console.log("@@ADDRESS MAP RESULT", LocIDRes.rows.item(0));
              //    localIds.push(LocIDRes.rows.item(0).LocSoldToAddressID);
              this.accountsProvider.DeleteAddressType1(LocIDRes.rows.item(0).LocSoldToAddressID).subscribe(DelAddressesRes => {
                console.log("@@ ADDRESS INFO DELETED", DelAddressesRes);
               
              });
            });
          }
          this.DataIpadSync(1);

        } else if (this.From == 3) {

          for (var j = 0; j < this.TempArrayNewAccounts.length; j++) {
            this.accountsProvider.GetLocAddressMapping(this.TempArrayNewAccounts[j]).subscribe(LocIDRes => {
              console.log("@@ADDRESS2 MAP RESULT", LocIDRes.rows.item(0));
              this.accountsProvider.DeleteAddressType1(LocIDRes.rows.item(0).LocAddressID).subscribe(DelAddressesRes => {
                console.log("@@ ADDRESS2 INFO DELETED", DelAddressesRes);

              });
            });
          }

          this.DataIpadSync(2);

        }
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveRelatedClothes(result);
    }
  }



  SaveRelatedClothes(result) {
    if (result.RelatedClothes.length > 0) {
      this.accountsProvider.SaveRelatedClothes(result.RelatedClothes).subscribe(pos => {
        console.log("**RelatedClothes COMPLETED", pos);
        this.presentToast("RelatedClothes Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveOrders(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveOrders(result);
    }
  }

  SaveOrders(result) {
    if (result.Orders.length > 0) {
      this.accountsProvider.SaveOrders(result.Orders).subscribe(pos => {
        console.log("**Orders COMPLETED", pos);
        this.presentToast("Orders Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveOrderScales(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveOrderScales(result);
    }
  }

  SaveOrderScales(result) {
    if (result.OrderScales.length > 0) {
      this.accountsProvider.SaveOrderScales(result.OrderScales).subscribe(pos => {
        console.log("**OrderScales COMPLETED", pos);
        this.presentToast("OrderScales Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveOrderSizes(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveOrderSizes(result);
    }
  }

  SaveOrderSizes(result) {
    if (result.OrderSizes.length > 0) {
      this.accountsProvider.SaveOrderSizes(result.OrderSizes).subscribe(pos => {
        console.log("**OrderSizes COMPLETED", pos);
        this.presentToast("OrderSizes Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveOrderStatus(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveOrderStatus(result);
    }
  }

  SaveOrderStatus(result) {
    if (result.OrderStatus.length > 0) {
      this.accountsProvider.SaveOrderStatus(result.OrderStatus).subscribe(pos => {
        console.log("**OrderStatus COMPLETED", pos);
        this.presentToast("OrderStatus Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveCustomerItemPrices(result);
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.SaveCustomerItemPrices(result);
    }


  }

  SaveCustomerItemPrices(result) {
    if (result.CustomerItemPrices.length > 0) {
      this.accountsProvider.SaveCustomerCustomerItemPrices(result.CustomerItemPrices).subscribe(pos => {
        console.log("**CustomerItemPrices COMPLETED", pos);
        this.presentToast("CustomerItemPrices Successfully" + this.appUtils.GetCurrentDateTime());
        if (this.From == 1) {
          this.BackgroundImagesDownload();
          this.openMainPage();
        } else {
          console.log("##POST SYNC", " TO BE START");
          // this.PostSyncStart();
        }
      }, error => {
        console.log("SAVE SIZE GROUP MASTER ERROR", error);
      });
    } else {
      this.presentToast("CustomerItemPrices Successfully" + this.appUtils.GetCurrentDateTime());
      if (this.From == 1) {
        this.BackgroundImagesDownload();
        this.openMainPage();
      } else {
        console.log("##POST SYNC", " TO BE START");
        // this.PostSyncStart();
      }

    }
  }



  SaveProductsImagesOffline() {
    this.productImagesStatus = 'Downloading Images Offline Started';
    this.presentToast("All Completed, Images Start In Background Successfully" + this.appUtils.GetCurrentDateTime());
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










  openMainPage() {
    this.appCtrl.getRootNav().setRoot(MainHomePage);
  }



  SaveTermsInDB(result) {

    if (result.Terms.length > 0) {
      this.configProvider.SaveTermsEntity(result.Terms).subscribe(res => {
        console.log("**TERMS COMPLETED", res);
        this.SaveShipViasInDB(result);
        this.presentToast("Terms Saved Successfully" + this.appUtils.GetCurrentDateTime());
      }, error => {
        console.log("**INSERTION COMPLETED", error);
      });

    } else {
      this.SaveShipViasInDB(result);
    }


  }


  SaveShipViasInDB(result) {

    if (result.ShipVias.length > 0) {
      this.configProvider.SaveShipViasEntity(result.ShipVias).subscribe(pos => {
        console.log("**SHIPVIAS COMPLETED", pos);
        this.SaveOrderTagsInDB(result);
        this.presentToast("Ship Via's Saved Successfully" + this.appUtils.GetCurrentDateTime());
      }, error => {
        console.log("SAVE SHIPVIAS ERROR", error);
      });
    } else {
      this.SaveOrderTagsInDB(result);
    }


  }

  SaveOrderTagsInDB(result) {
    if (result.OrderTags.length > 0) {
      this.configProvider.SaveOrderTagsEntity(result.OrderTags).subscribe(pos => {
        console.log("**ORDER TAGS COMPLETED", pos);
        this.presentToast("Order Tags Saved Successfully" + this.appUtils.GetCurrentDateTime());
        this.SaveCategoriesInDB(result);
      }, error => {
        console.log("SAVE Order Tags ERROR", error);
      });
    } else {
      this.SaveCategoriesInDB(result);
    }
  }

  DownloadProductImages(Fname, pos, size, response) {
    Fname = encodeURIComponent(Fname.trim())
    const fileUrl = "http://50.63.172.206/Library/Uploads/WebThumb/" + Fname;
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(fileUrl, this.file.dataDirectory + Fname).then((entry) => {
      console.log('download complete: ' + entry.toURL(), pos, size);
      // resolve(entry.toURL);
      this.productImagesStatus = 'Image Downloaded' + this.productIndex;
      this.configProvider.UpdateImportEntity(5, 'Product Images', 2, pos, '', this.appUtils.GetCurrentDateTime());
      // this.checkFile(Fname);
      if (this.productIndex + 1 == size) {
        console.log("**All done");
        this.productImagesStatus = 'Image Download Completed';
        this.configProvider.UpdateImportEntity(5, 'Product Images', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());

        this.presentToast("Image Downloading Completed");

      } else {
        this.productIndex = this.productIndex + 1;
        console.log("**", this.productIndex / 10);
        if (this.productIndex % 10 == 0) {
          this.presentToast("Image Downloading :- " + this.productIndex + " / " + size);
        }
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


  public BackgroundImagesDownload() {
    this.backgroundMode.disableWebViewOptimizations();
    console.log("**", "Background called");
    this.backgroundMode.on("activate").subscribe(() => {
      // this.nativeAudio.play("audio1");  
      console.log("**", "Play Background Playing");
    });
    console.log("**", "Background Playing");
    this.SaveProductsImagesOffline();
  }


  presentToast(ind) {

    let toast = this.toastctrl.create({
      message: ind,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {

    });
    toast.present();

  }



  PostSyncStart(date) {
    this.TempArrayNewAccounts = [];
    let query = 'SELECT * FROM Accounts WHERE dateUpdated>=?';
    this.accountsProvider.GetAccountsToSync(date, query).subscribe(AcRes => {
      console.log("SYNC ACCOUNTS", AcRes);
      for (var i = 0; i < AcRes.rows.length; i++) {
        var accID = "" + AcRes.rows.item(i).accountId;
        var sub = accID.substring(0, 4);
        console.log("SUBB", sub);
        if (sub === 'LOC-') {
          let RegisterDATA = { CompanyName: "", UserName: "", Password: "", FirstName: "", LastName: "", PhoneNumber: "", Email: "", City: "", Address: "" };
          console.log("NEW ACCOUNT", AcRes.rows.item(i));
          let Account = AcRes.rows.item(i);
          this.accountsProvider.GetCompanyInfoAccountID(Account.accountId).subscribe(CompRes => {
            RegisterDATA.CompanyName = CompRes.rows.item(0).name;
            this.accountsProvider.GetCommunicationsAccountID(Account.accountId).subscribe(OptRes => {
              RegisterDATA.PhoneNumber = OptRes.rows.item(0).phone;
              this.accountsProvider.GetAddressesAccountId(Account.accountId, 1).subscribe(AddressRes => {
                console.log("Address RES", AddressRes);
                console.log("Address RES", AddressRes.rows.item(0));
                RegisterDATA.City = AddressRes.rows.item(0).city;
                RegisterDATA.Address = AddressRes.rows.item(0).street + ", " + AddressRes.rows.item(0).state + ", " + AddressRes.rows.item(0).country;
                RegisterDATA.Email = Account.email;
                RegisterDATA.FirstName = Account.firstName;
                RegisterDATA.LastName = Account.lastName;
                RegisterDATA.Password = Account.password;
                RegisterDATA.UserName = Account.userName;

                console.log("Register Data", RegisterDATA);
                this.ApiHelper.RequestPostHttp(RegisterDATA, 'Register', false).then(result => {
                  console.log("Register RESPONSE", result);
                  if (result.Status == true) {
                    this.UpdateUserId(result.UserId, Account.accountId, date);
                  } else {
                    this.presentToast('Time Out Api');
                  }

                },
                  error => {

                    console.log("ERROR", error);
                  }
                );
              })
            });
          });
        } else {
          console.log("UPDATE ACCOUNT", AcRes.rows.item(i));

        }

      }
    });
  }

  UpdateUserId(userID, locAccountID, date) {
    console.log("Accont To Update" + locAccountID, userID);
    this.accountsProvider.UpdateUserIDinMaping(locAccountID, userID).subscribe(AccUpdateRes => {
      this.TempArrayNewAccounts.push(userID);
      console.log("ACC UPDATE", AccUpdateRes);
      this.appUtils.presentToast('Account ID Updated Success');
      this.SyncData(date);
    });

  }


  DataIpadSync(which) {

    if (which == 1) {
      let SyncJSONObj = {Addresses: [] , UserId: 2} ;
      console.log("*TEMP ACCOUNTS", this.TempArrayNewAccounts);
      for (var i = 0; i < this.TempArrayNewAccounts.length; i++) {
        let AccountServerID = this.TempArrayNewAccounts[i];
        this.accountsProvider.GetLocAddressMapping(this.TempArrayNewAccounts[i]).subscribe(AdRes => {
          console.log("**LOCAL ADDRESS", AdRes.rows.item(0));
          let addressOBj = { street: "", city: "", state: "", country: "", pincode: "", addressTypeId: "", accountId: "", isActive: "", isDelete: "" };
          if (AdRes.rows.length > 0) {
            this.accountsProvider.GetAddressFromAddressID(AdRes.rows.item(0).LocAddressID).subscribe(AddRes => {
              console.log("**LOCAL ADDRESS", AddRes.rows.item(0));
              console.log("**ACCUNT SERVER ID" , AccountServerID);
              addressOBj.street = AddRes.rows.item(0).street;
              addressOBj.city = AddRes.rows.item(0).city;
              addressOBj.state = AddRes.rows.item(0).state;
              addressOBj.country = AddRes.rows.item(0).country;
              addressOBj.pincode = AddRes.rows.item(0).pincode;
              addressOBj.addressTypeId = AddRes.rows.item(0).addressTypeId;
              addressOBj.accountId = AccountServerID;
              addressOBj.isActive = AddRes.rows.item(0).isActive;
              addressOBj.isDelete = AddRes.rows.item(0).isDelete;
              SyncJSONObj.Addresses.push(addressOBj);
            })
          }
        });
      }
      console.log("**All ADDRESS", SyncJSONObj);
      this.PostIpadSync(SyncJSONObj);
    }else{



    }

  }



  PostIpadSync(SyncJSON) {
    let SyncJSONObj = {Addresses: [] , UserId: 2} ;
    let addressOBj = { street: "sd", city: "dfg", state: "dfb", country: "dv", pincode: "12345", addressTypeId: "2", accountId: 16749, isActive:true, isDelete:false};
    SyncJSONObj.Addresses.push(addressOBj);
    console.log("SYNC POST JSON", JSON.stringify(SyncJSONObj));

    this.ApiHelper.RequestPostHttp(SyncJSONObj, 'iPadSync', false).then(result => {
      console.log("IPAD SYNC RESPONSE" , result);
      if (result.Status == true) {
      //  this.From = 3;
       // this.SyncData(this.TempLastSyncTime);
      } else {
        this.presentToast('Time Out Api');
      }

    },
      error => {
        console.log("ERROR", error);
      }
    );

  }




}

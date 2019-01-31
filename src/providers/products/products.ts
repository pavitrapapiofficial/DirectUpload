import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Observable } from 'rxjs/Observable';
import { AppUtilsProvider } from '../../providers/app-utils/app-utils'
import { ConfigTablesProvider } from '../../providers/config-tables/config-tables'
import { AccountsProvider } from '../../providers/accounts/accounts';
import { Searchbar,Events } from 'ionic-angular';

/*
  Generated class for the ProductsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProductsProvider {

  public db: SQLiteObject;

  constructor(public sqlite: SQLite, public appUtils: AppUtilsProvider, public accountsProvider: AccountsProvider,
    public configProvider: ConfigTablesProvider, public events: Events) {
    console.log('Hello ProductsProvider Provider');
    this.CreateProductsTable();
  }





  CreateProductsTable() {

    this.sqlite.create({
      name: 'Platini.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.db = db;
        db.executeSql('CREATE TABLE IF NOT EXISTS Products(clothesId INTEGER, styleNumber TEXT, color TEXT, price INTEGER, clothesDescription TEXT, tags TEXT, categoryId INTEGER, isActive TEXT , clearance INTEGER, brandId INTEGER, sortOrder INTEGER, sizeGroupId INTEGER, productCost INTEGER, originalQty INTEGER, msrp INTEGER, isDelete TEXT, adjustQty INTEGER, dateChanged TEXT, dateCreated TEXT, dateUpdated TEXT, DiscountedPrice INTEGER, DiscountedMSRP INTEGER, futureDeliveryDate TEXT)', [])
          .then(res => {
            console.log('PRODUCTS ENTITY CREATED')
            this.CreateProductImagesTable();
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

  }

  SaveProducts(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO Products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [item.clothesId, item.styleNumber,item.color, item.price, item.clothesDescription, item.tags, item.categoryId,
            item.isActive, item.clearance, item.brandId, item.sortOrder, item.sizeGroupId, item.productCost,
            item.originalQty, item.msrp, item.isDelete, item.adjustQty, item.dateChanged, item.dateCreated,
            item.dateUpdated, item.DiscountedPrice, item.DiscountedMSRP, item.futureDeliveryDate]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(4, 'Products', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );


  }

  CreateProductImagesTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS ProductImages(clothesImageId INTEGER, clothesId INTEGER, imageName TEXT, imagePath TEXT, isActive boolean, isDelete BOOLEAN, sortOrder INTEGER , dateCreated TEXT, dateUpdated TEXT)', [])
      .then(res => {
        console.log('PRODUCT IMAGES ENTITY CREATED');
        this.CreateProductScalesTable();
      })
      .catch(e => console.log(e));

  }


  CreateProductScalesTable() {
    this.db.executeSql('CREATE TABLE IF NOT EXISTS ClothesScales(clothesScaleId INTEGER, name TEXT , fitId INTEGER ,inseamId INTEGER, clothesId INTEGER, isOpenSize boolean, invQty INTEGER, isActive boolean, isDelete boolean, dateCreated TEXT , dateUpdated TEXT)', [])
      .then(res => {
        console.log('CLOTH SCALES ENTITY CREATED');
        this.CreateProductScaleSizes();
      })
      .catch(e => console.log(e));

  }

  CreateProductScaleSizes() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS ClothesScaleSizes(clothesScaleSizeId INTEGER, clothesScaleId INTEGER, sizeId INTEGER, quantity INTEGER, isActive boolean, isDelete boolean, dateCreated TEXT , dateUpdated TEXT)', [])
      .then(res => {
        console.log('CLOTH SCALES ENTITY CREATED');
        this.CreateSizesMasterTable();
      })
      .catch(e => console.log(e));

  }

  CreateCartTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS ProductCart(clothesId INTEGER, cartData TEXT)', [])
      .then(res => {
        console.log('CART ENTITY CREATED');
        this.accountsProvider.CreateAccountsTable();
      })
      .catch(e => console.log(e));

  }

  SaveIntoCart(clothID, cartData) {
    console.log("CART ADD", cartData, clothID);
    return Observable.create(observer => {
      console.log("query ");
      this.db.executeSql('SELECT * FROM ProductCart WHERE clothesId=?', [clothID])
        .then(res => {
          
          if (res.rows.length == 0) {
            console.log("PRODUCT NOT EXIST");
            this.db.executeSql('INSERT INTO ProductCart VALUES(?,?)', [clothID, JSON.stringify(cartData)])
              .then(res1 => {
                console.log("SAVED", res1.insertId);
                observer.next(res1.insertId);
                this.CheckCountInCart();
              })
              .catch(e => {
                console.log(e);
              }).catch(e => {
                console.log(e);

              });
          } else {
            console.log("PRODUCT EXIST");

            this.db.executeSql('UPDATE ProductCart SET cartData=? WHERE clothesId=?', [JSON.stringify(cartData), clothID])
              .then(updateres => {
                console.log("UPDATED", updateres);
                observer.next(updateres.rows.length);
                this.CheckCountInCart();
              })
              .catch(e => console.log(e));

          }
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  GetAllFromCart() {
    return Observable.create(observer => {
    this.db.executeSql('SELECT * FROM ProductCart', [])
    .then(updateres => {
    observer.next(updateres);
    }) .catch(e => {
    observer.next(e);
    });
    }, );
    }

    DeleteCartQty(){
      let query = 'DELETE FROM ProductCart';
      console.log("QUERY", query);
      return Observable.create(observer => {
        this.db.executeSql(query, [])
          .then(res => {
            console.log("DELETE CART RES" , res);
            observer.next(res);
            this.CheckCountInCart();
          })
          .catch(e => {
            console.log("DELETE CART ERROR" , e);
            observer.next(e);
            console.log(e);
          });
   
      }, );
   
     }

  CheckCountInCart(){

    let query = 'SELECT COUNT(*) AS total FROM ProductCart';
    this.db.executeSql(query, [])
        .then(res => {
          this.events.publish('cart:added',res.rows.item(0).total, Date.now());
        })
        .catch(e => {
          console.log(e);
        });

  }


  SaveClothScales(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO ClothesScales VALUES(?,?,?,?,?,?,?,?,?,?,?)',
          [item.clothesScaleId, item.name, item.fitId, item.inseamId, item.clothesId, item.isOpenSize, item.invQty, item.isActive, item.isDelete,
            item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(6, 'Product Scales', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetScalesOfProduct(prodId) {

    return Observable.create(observer => {
      this.db.executeSql('SELECT * FROM ClothesScales WHERE clothesId=? ORDER BY clothesScaleId ASC', [prodId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  UpdateStockScale(clothscaleid , qty){

    this.db.executeSql('UPDATE ClothesScales SET invQty=? WHERE clothesScaleId=?',[qty , clothscaleid])
    .then(res => {
      console.log('Stock Updated' , res);
   
    })
      .catch(e => console.log(e));


  }



  SaveScaleSizes(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO ClothesScaleSizes VALUES(?,?,?,?,?,?,?,?)',
          [item.clothesScaleSizeId, item.clothesScaleId, item.sizeId, item.quantity, item.isActive, item.isDelete,
            item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(7, 'Product Scales Sizes', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );


  }

  GetScaleSizesOfScale(scaleId) {

    let abc = scaleId.join();
    let query = 'SELECT * FROM ClothesScaleSizes WHERE isActive=? AND clothesScaleId IN(' + abc + ') ORDER BY sizeId ASC';
    return Observable.create(observer => {
      this.db.executeSql(query, [true])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );


  }


  UpdateStockOfSize(clothsizescaleid , qty){

    this.db.executeSql('UPDATE ClothesScaleSizes SET quantity=? WHERE clothesScaleSizeId=?',[qty , clothsizescaleid])
    .then(res => {
      console.log('Stock Updated' , res);
   
    })
      .catch(e => console.log(e));


  }






  SaveImagesInTable(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO ProductImages VALUES(?,?,?,?,?,?,?,?,?)',
          [item.clothesImageId, item.clothesId, item.imageName, item.imagePath, item.isActive, item.isDelete,
            item.sortOrder, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(5, 'Product Images', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetAllProductsOfCategory(catid , startpage, limit) {
  let  query = 'SELECT * FROM Products WHERE categoryId=? ORDER BY dateCreated ASC LIMIT ' + startpage + ',' + limit;
  console.log("QUERY" , query);
    return Observable.create(observer => {
      this.db.executeSql(query, [catid])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  GetCountProductsOfCategory(catid) {
    
    let query = 'SELECT COUNT(*) AS total FROM Products WHERE categoryId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [catid])
        .then(res => {
            observer.next(res.rows.item(0).total);
        })
        .catch(e => {
          observer.next(0);
          console.log(e);
        });
    }, );

  }


  GetThirdLevelProducts(catid, startpage, limit, typeCat, clearance) {
    let query = '';
    if (typeCat == 1) {
      query = 'SELECT * FROM Products WHERE clearance=? ORDER BY dateCreated DESC LIMIT ' + startpage + ',' + limit;

    } else if (typeCat == 2) {
      query = 'SELECT * FROM Products WHERE clearance=? AND futureDeliveryDate not null ORDER BY dateCreated DESC LIMIT ' + startpage + ',' + limit;

    }
    else {
      let abc = catid.join();
      query = 'SELECT * FROM Products WHERE clearance=? AND categoryId IN(' + abc + ') ORDER BY dateCreated DESC LIMIT ' + startpage + ',' + limit;

    }

    console.log("QUERY PRODUCTS", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [clearance])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);

        });

    }, );

  }


  GetAllDeactivateProducts(catid, startpage, limit, typeCat, clearance) {
    let query = '';
     query = 'SELECT * FROM Products WHERE isActive=? ORDER BY dateCreated DESC LIMIT ' + startpage + ',' + limit;
    console.log("QUERY PRODUCTS", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [false])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);

        });

    }, );

  }

  GetThirdLevelProductCount(catid, clearance) {
    let abc = catid.join();
    let query = 'SELECT COUNT(*) AS total FROM Products WHERE clearance=? AND categoryId IN(' + abc + ')';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [clearance])
        .then(res => {
          //  console.log("Total" , res.rows.item(0).total);
          observer.next(res.rows.item(0).total);
        })
        .catch(e => {
          observer.next(0);
          console.log(e);
        });
    }, );

  }

  GetClearanceProductCount() {
    let query = 'SELECT COUNT(*) AS total FROM Products WHERE clearance=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [1])
        .then(res => {
          observer.next(res.rows.item(0).total);
        })
        .catch(e => {
          observer.next(0);
          console.log(e);
        });

    }, );

  }

  GetDeactivateProductCount() {
    let query = 'SELECT COUNT(*) AS total FROM Products WHERE isActive=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [false])
        .then(res => {
          observer.next(res.rows.item(0).total);
        })
        .catch(e => {
          observer.next(0);
          console.log(e);
        });

    }, );

  }

  GetFutureDeliveriesProductCount() {
    let query = 'SELECT COUNT(*) AS total FROM Products WHERE futureDeliveryDate not null';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [])
        .then(res => {
          console.log("RESS", res);
          observer.next(res.rows.item(0).total);
        })
        .catch(e => {
          observer.next(0);
          console.log(e);
        });
    }, );

  }

  SearchProductsFromDB(search) {

    let query = 'SELECT * FROM Products WHERE styleNumber LIKE ?';
    console.log("QUERY SEARCH  PRODUCTS", query);
    return Observable.create(observer => {
      this.db.executeSql(query, ['%' + search + '%'])
        .then(res => {
          console.log("Search RES", res);
          observer.next(res);
        })
        .catch(e => {
          console.log(e);
          observer.next(e);


        });

    }, );
  }




  GetBaseImageOfproduct(prodId) {

    return Observable.create(observer => {
      this.db.executeSql('SELECT * FROM ProductImages WHERE clothesId=? ORDER BY sortOrder ASC', [prodId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });
    }, );

  }

  GetProductDetailsFromId(prodId) {

    return Observable.create(observer => {
      this.db.executeSql('SELECT * FROM Products WHERE clothesId=? ORDER BY dateCreated ASC LIMIT 1', [prodId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }


  GetAllImagesFromDB() {

    return Observable.create(observer => {
      this.db.executeSql('SELECT * FROM ProductImages ORDER BY dateCreated ASC', [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });
    }, );

  }


  CreateSizesMasterTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS SizesMaster(sizeId INTEGER, name TEXT, sizeGroupId INTEGER, categoryId INTEGER, isActive boolean, isDelete BOOLEAN, sortOrder INTEGER , dateCreated TEXT, dateUpdated TEXT)', [])
      .then(res => {
        console.log('SIZES MASTER ENTITY CREATED');
        this.CreateFitsMasterTable();
      })
      .catch(e => console.log(e));

  }

  SaveSizesMaster(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO SizesMaster VALUES(?,?,?,?,?,?,?,?,?)',
          [item.sizeId, item.name, item.sizeGroupId, item.categoryId, item.isActive, item.isDelete, item.sortOrder, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(8, 'Sizes Master', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetSizeDetailsFromID(sizeId) {

    let abc = sizeId.join();
    let query = 'SELECT * FROM SizesMaster WHERE sizeId IN(' + abc + ')';
    console.log("QUERY", query);

    return Observable.create(observer => {
      this.db.executeSql(query, [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }





  CreateFitsMasterTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS FitsMaster(fitId INTEGER, name TEXT, isActive boolean, isDelete BOOLEAN, sortOrder INTEGER , dateCreated TEXT, dateUpdated TEXT)', [])
      .then(res => {
        console.log('FITS MASTER ENTITY CREATED');
        this.CreateInseamsMasterTable();
      })
      .catch(e => console.log(e));

  }

  SaveFitsMaster(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO FitsMaster VALUES(?,?,?,?,?,?,?)',
          [item.fitId, item.name, item.isActive, item.isDelete, item.sortOrder, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(9, 'Fits Master', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetFitsDataFromID(fitId) {
    let abc = fitId.join();
    let query = 'SELECT * FROM FitsMaster WHERE fitId IN(' + abc + ')';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  GetInseamDataFromID(inseamId) {
    let abc = inseamId.join();
    let query = 'SELECT * FROM InseamsMaster WHERE inseamId IN(' + abc + ')';
    return Observable.create(observer => {
      this.db.executeSql(query, [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }





  CreateInseamsMasterTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS InseamsMaster(inseamId INTEGER, name TEXT, isActive boolean, isDelete BOOLEAN, sortOrder INTEGER , dateCreated TEXT, dateUpdated TEXT)', [])
      .then(res => {
        console.log('INSEAM MASTER ENTITY CREATED');
        this.CreateSizeGroupsMasterTable();
      })
      .catch(e => console.log(e));

  }

  SaveInseamMaster(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO InseamsMaster VALUES(?,?,?,?,?,?,?)', 
          [item.inseamId, item.name, item.isActive, item.isDelete, item.sortOrder, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(10, 'Inseam Master', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }


  CreateSizeGroupsMasterTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS SizeGroupsMaster(sizeGroupId INTEGER, name TEXT, categoryId INTEGER, isActive boolean, isDelete BOOLEAN, sortOrder INTEGER , dateCreated TEXT, dateUpdated TEXT)', [])
      .then(res => {
        console.log('SIZE GROUP MASTER ENTITY CREATED');
        this.CreateCartTable();
      })
      .catch(e => console.log(e));

  }

  SaveSizeGroupMaster(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT INTO SizeGroupsMaster VALUES(?,?,?,?,?,?,?,?)',
          [item.sizeGroupId, item.name, item.categoryId, item.isActive, item.isDelete, item.sortOrder, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        this.configProvider.UpdateImportEntity(11, 'Size Group Master', "3", 'ALL', '', this.appUtils.GetCurrentDateTime());
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }



}

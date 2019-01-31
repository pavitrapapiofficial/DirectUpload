import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Observable } from 'rxjs/Observable';
import { AppUtilsProvider } from '../../providers/app-utils/app-utils'
import { ConfigTablesProvider } from '../../providers/config-tables/config-tables'
import { Searchbar, Events } from 'ionic-angular';

/*
  Generated class for the AccountsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AccountsProvider {

  public db: SQLiteObject;

  constructor(public sqlite: SQLite, public appUtils: AppUtilsProvider) {
    console.log('Hello AccountsProvider Provider');
    this.CreateAccountsTable();
  }


  CreateAccountsTable() {

    this.sqlite.create({
      name: 'Platini.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.db = db;
        db.executeSql('CREATE TABLE IF NOT EXISTS Accounts(accountId INTEGER, firstName TEXT, lastName TEXT, userName TEXT, email TEXT, password TEXT, roleId INTEGER, isLocal TEXT , isActive TEXT, isDelete TEXT, lastLoginDate TEXT, dateCreated TEXT, dateUpdated TEXT, CONSTRAINT account_unique UNIQUE (accountId))', [])
          .then(res => {
            console.log('Accounts ENTITY CREATED')
            this.CreateCommunicationsTable();
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

  }

  CreateCommunicationsTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS Communications(communicationId INTEGER, phone TEXT, accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN, dateUpdated TEXT, CONSTRAINT communicationId_unique UNIQUE (communicationId))', [])
      .then(res => {
        console.log('Communications ENTITY CREATED');
        this.CreateAddressesTable();
      })
      .catch(e => console.log(e));

  }

  CreateAddressesTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS Addresses(addressId INTEGER, street TEXT, city TEXT, state TEXT, country TEXT, pincode TEXT, addressTypeId INTEGER,accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN,dateCreated TEXT, dateUpdated TEXT, CONSTRAINT addressId_unique UNIQUE (addressId))', [])
      .then(res => {
        console.log('Addresses ENTITY CREATED');
        this.CreateCompaniesTable();
      })
      .catch(e => console.log(e));

  }

  CreateCompaniesTable() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS Companies(companyId INTEGER, name TEXT, accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN,dateCreated TEXT, dateUpdated TEXT, CONSTRAINT companyId_unique UNIQUE (companyId))', [])
      .then(res => {
        console.log('Companies ENTITY CREATED');
        this.CreateCustomerOptionalInfo();
      })
      .catch(e => console.log(e));

  }

  CreateCustomerOptionalInfo() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS CustomerOptionalInfos(customerOptionalInfoId INTEGER, customerType INTEGER, accountId INTEGER, shipViaId INTEGER, discount INTEGER,termId INTEGER,displayName TEXT,dateCreated TEXT, dateUpdated TEXT, CONSTRAINT companyId_unique UNIQUE (customerOptionalInfoId))', [])
      .then(res => {
        console.log('CustomerOptionalInfos ENTITY CREATED');
        this.CreateOrders();
      })
      .catch(e => console.log(e));

  }


  CreateOrders() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS Orders(orderId TEXT, orderNumber TEXT, accountId INTEGER, createdOn TEXT, grandTotal INTEGER,discount INTEGER, finalAmount INTEGER,employeeId INTEGER, addressId INTEGER, communicationId INTEGER, statusId INTEGER,confirmStatus BOOLEAN, originalQty INTEGER,packedQty INTEGER,label INTEGER,isSentToQuickBook BOOLEAN, isDelete BOOLEAN,dateCreated TEXT,dateUpdated TEXT, shippingCost INTEGER,tagId INTEGER, CONSTRAINT orderId_unique UNIQUE (orderId))', [])
      .then(res => {
        console.log('Orders ENTITY CREATED');
        this.CreateOrderScales();
      })
      .catch(e => console.log(e));

  }

  CreateOrderScales() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS OrderScales(orderScaleId TEXT, orderId TEXT, clothesScaleId INTEGER, quantity INTEGER, packedQty INTEGER,dateCreated TEXT,dateUpdated TEXT, isConfirmed BOOLEAN,clothesId INTEGER, CONSTRAINT orderScaleId_unique UNIQUE (orderScaleId))', [])
      .then(res => {
        console.log('OrderScales ENTITY CREATED');
        this.CreateOrderSizes();
      })
      .catch(e => console.log(e));

  }

  CreateOrderSizes() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS OrderSizes(orderSizeId TEXT, orderId TEXT, clothesSizeId INTEGER, quantity INTEGER, packedQty INTEGER,dateCreated TEXT,dateUpdated TEXT, clothesId INTEGER, CONSTRAINT orderSizeId_unique UNIQUE (orderSizeId))', [])
      .then(res => {
        console.log('OrderSizes ENTITY CREATED');
        this.CreateOrderStatus();
      })
      .catch(e => console.log(e));

  }

  CreateOrderStatus() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS OrderStatus(orderStatusId INTEGER, status TEXT, dateCreated TEXT,dateUpdated TEXT, CONSTRAINT orderStatusId_unique UNIQUE (orderStatusId))', [])
      .then(res => {
        console.log('OrderStatus ENTITY CREATED');
         this.CreateCustomerItemPrices();
      })
      .catch(e => console.log(e));

  }

  CreateCustomerItemPrices() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS CustomerItemPrices(customerItemPriceId INTEGER, accountId INTEGER, clothesId INTEGER,price TEXT,dateCreated TEXT, dateUpdated TEXT, CONSTRAINT customerItemPriceId_unique UNIQUE (customerItemPriceId))', [])
      .then(res => {
        console.log('CustomerItemPrices ENTITY CREATED');
      this.CreateRelatedClothes();
      })
      .catch(e => console.log(e));

  }

  CreateRelatedClothes() {

    this.db.executeSql('CREATE TABLE IF NOT EXISTS RelatedClothes(relatedClothesId INTEGER, clothesId INTEGER, relClothesId INTEGER,categoryId INTEGER,isActive BOOLEAN ,isDelete BOOLEAN, dateCreated TEXT, dateUpdated TEXT, CONSTRAINT relatedClothesId_unique UNIQUE (relatedClothesId))', [])
      .then(res => {
        console.log('RelatedClothes ENTITY CREATED');
        this.CreateTempOrderTable();
      })
      .catch(e => console.log(e));

  }

  CreateTempOrderTable(){

    this.db.executeSql('CREATE TABLE IF NOT EXISTS TempOrder(orderId TEXT, productsJSON TEXT, customerJSON TEXT,orderData TEXT, orderScales TEXT, orderSizes TEXT, CONSTRAINT orderID_unique UNIQUE (orderId))', [])
    .then(res => {
      console.log('TEMP ORDER ENTITY CREATED');
     this.CreateTempAccountMappingTable();
    })
    .catch(e => console.log(e));

  }

  CreateTempAccountMappingTable(){

    this.db.executeSql('CREATE TABLE IF NOT EXISTS AccountMapping(LocAccountId TEXT, AccountId TEXT)', [])
    .then(res => {
      console.log('ACCOUNT MAPPING ENTITY CREATED');
     this.CreateAddressIDMappingTable();
    })
    .catch(e => console.log(e));

  }
  CreateAddressIDMappingTable(){

    this.db.executeSql('CREATE TABLE IF NOT EXISTS AddressMapping(LocAccountId TEXT, AccountId TEXT, LocAddressID TEXT, AddressId TEXT, LocSoldToAddressID TEXT, SoldToAddressId TEXT)', [])
    .then(res => {
      console.log('ACCOUNT MAPPING ENTITY CREATED');

    })
    .catch(e => console.log(e));

  }

  SaveAccountMapping(localAccountID, AccountId){

    let query = 'INSERT INTO AccountMapping VALUES(?,?)';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [localAccountID , AccountId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  UpdateUserIDinMaping(locID , ServerAccountID){

    let query = 'UPDATE AccountMapping SET AccountId=? WHERE LocAccountId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [ServerAccountID , locID])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }


  GetLocAccountID(serverAccountId){

    let query = 'SELECT * FROM AccountMapping WHERE AccountId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [serverAccountId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }


  SaveAddressIDMapping(LocAccountId, AccountId, LocAddressID, AddressId, LocsoldToAddressId, SoldToAddressID){
   // LocAccountId TEXT, AccountId TEXT, LocAddressID TEXT, AddressId TEXT, LocSoldToAddressID TEXT, SoldToAddressId TEXT
    let query = 'INSERT INTO AddressMapping VALUES(?,?,?,?,?,?)';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [LocAccountId , AccountId, LocAddressID,AddressId,LocsoldToAddressId,SoldToAddressID])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  UpdateUserIDinAddressMapping(locID , ServerAccountID){
  //  LocAccountId TEXT, AccountId TEXT, LocAddressID TEXT, AddressId TEXT, LocSoldToAddressID TEXT, SoldToAddressId TEXT
    let query = 'UPDATE AddressMapping SET AccountId=? WHERE LocAccountId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
     this.db.executeSql(query, [ServerAccountID , locID])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });
      }, );
  }

  GetLocAddressMapping(AccountId){

    let query = 'SELECT * FROM AddressMapping WHERE AccountId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [AccountId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );
       
  }


  SaveTempOrder(orderID, productsJSON, customerJSON, orderData, orderScales, orderSizes){

    let query = 'INSERT OR REPLACE INTO TempOrder VALUES(?,?,?,?,?,?)';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [orderID , JSON.stringify(productsJSON), JSON.stringify(customerJSON), JSON.stringify(orderData), JSON.stringify(orderScales), JSON.stringify(orderSizes)])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

   GetTempOrderFromID(orderId){

    let query = 'SELECT * FROM TempOrder WHERE orderId=?';
    console.log("QUERY", query);
    return Observable.create(observer => {
      this.db.executeSql(query, [orderId])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

   }


  SaveAccounts(data) {

    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO Accounts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [item.accountId, item.firstName, item.lastName, item.userName, item.email, item.password, item.roleId, item.isLocal, item.isActive,
          item.isDelete, item.lastLoginDate, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }


  DeleteLocalIdEntries(IDS, query) {
    console.log("IDS TO DELETE" , IDS);
    let abc = IDS.join();
    console.log("DELETE QUERY" , query , abc);
    return Observable.create(observer => {
      this.db.executeSql(query, [abc])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  

  DeleteAddressType1(IDS){
    let query = 'DELETE FROM Addresses WHERE addressId=?';
  //  let abc = IDS.join();
    console.log("TO BE DELETE IDSS",IDS);
   // console.log("DELETE QUERY Addresses"+query , abc);
    return Observable.create(observer => {
      this.db.executeSql(query, [IDS])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });
    }, );

  }


  GetAccountsToSync(date, query){

    return Observable.create(observer => {
      this.db.executeSql(query,[date]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );


  }

  SaveNewAccount(data) {
    
    return Observable.create(observer => {
      let query = 'INSERT OR REPLACE INTO Accounts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)';
      this.db.executeSql(query,[data.accountId, data.firstName, data.lastName, data.userName, data.email, data.password, data.roleId, data.isLocal, data.isActive,
        data.isDelete, data.lastLoginDate, data.dateCreated, data.dateUpdated]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SearchAccountsFromDB(search) {

    let query = 'SELECT * FROM Accounts WHERE email LIKE ?';
    console.log("QUERY SEARCH  PRODUCTS", query + search);
    return Observable.create(observer => {
      this.db.executeSql(query, ['%' + search + '%'])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          console.log(e);
          observer.next(e);
        });

    }, );
  }

  UpdateCommunications(comm){
    console.log("TO UPDATE COMM", comm);
    return Observable.create(observer => {
    let d = this.appUtils.GetCurrentDateTime();
    this.db.executeSql('UPDATE Communications SET phone=?,dateUpdated=? WHERE communicationId=?',[comm.phone, d, comm.communicationId])
    .then(res => {
      observer.next(res);
    })
      .catch(e => console.log(e));
    }, );
  }






  SaveCommunications(data) {
    //  Communications(communicationId INTEGER, phone TEXT, accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN, dateUpdated TEXT
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO Communications VALUES(?,?,?,?,?,?)',
          [item.communicationId, item.phone, item.accountId, item.isActive, item.isDelete, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetCommunicationsAccountID(AcID){

    return Observable.create(observer => {
      let query = 'SELECT * FROM Communications WHERE accountId=?';
      this.db.executeSql(query,[AcID]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  

  SaveAddresses(data) {
    // Addresses(addressId INTEGER, street TEXT, city TEXT, state TEXT, country TEXT, pincode TEXT, addressTypeId INTEGER,accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN,dateCreated TEXT, dateUpdated TEXT
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO Addresses VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
          [item.addressId, item.street, item.city, item.state, item.country, item.pincode, item.addressTypeId, item.accountId, item.isActive, item.isDelete, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetAddressesAccountId(AcID , addressType){

    return Observable.create(observer => {
      let query = 'SELECT * FROM Addresses WHERE accountId=? AND addressTypeId=?';
      this.db.executeSql(query,[AcID, addressType]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetAddressFromAddressID(AdID){

    return Observable.create(observer => {
      let query = 'SELECT * FROM Addresses WHERE addressId=?';
      this.db.executeSql(query,[AdID]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveCompanies(data) {
    // Companies(companyId INTEGER, name TEXT, accountId INTEGER, isActive BOOLEAN, isDelete BOOLEAN,dateCreated TEXT, dateUpdated TEXT
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO Companies VALUES(?,?,?,?,?,?,?)',
          [item.companyId, item.name, item.accountId, item.isActive, item.isDelete, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  GetCompanyInfoAccountID(acId){
    
    return Observable.create(observer => {
      let query = 'SELECT * FROM Companies WHERE accountId=?';
      this.db.executeSql(query,[acId]).then((result) => {
        observer.next(result);
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveCustomerOptionalInfos(data) {
   // customerOptionalInfoId INTEGER, customerType INTEGER, accountId INTEGER, shipViaId INTEGER, discount INTEGER,termId INTEGER,displayName TEXT,dateCreated TEXT, dateUpdated
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO CustomerOptionalInfos VALUES(?,?,?,?,?,?,?,?,?)',
          [item.customerOptionalInfoId, item.customerType, item.accountId, item.shipViaId, item.discount,item.termId,item.displayName, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }


  SaveCustomerCustomerItemPrices(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO CustomerItemPrices VALUES(?,?,?,?,?,?)',
          [item.customerItemPriceId, item.accountId, item.clothesId, item.price, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveOrderStatus(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO OrderStatus VALUES(?,?,?,?)',
          [item.orderStatusId, item.status, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveOrderSizes(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO OrderSizes VALUES(?,?,?,?,?,?,?,?)',
          [item.orderSizeId, item.orderId, item.clothesSizeId, item.quantity, item.packedQty, item.dateCreated, item.dateUpdated, item.clothesId]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveOrderScales(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO OrderScales VALUES(?,?,?,?,?,?,?,?,?)',
          [item.orderScaleId, item.orderId, item.clothesScaleId, item.quantity, item.packedQty, item.dateCreated, item.dateUpdated, item.isConfirmed, item.clothesId]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }

  SaveOrders(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO Orders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [item.orderId, item.orderNumber, item.accountId, item.createdOn, item.grandTotal, item.discount, item.finalAmount, item.employeeId, item.addressId,
            item.communicationId, item.statusId, item.confirmStatus, item.originalQty, item.packedQty, item.label, item.isSentToQuickBook, item.isDelete, item.dateCreated,
            item.dateUpdated, item.shippingCost, item.tagId]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        console.log("SAVE ORDER RES" , result);
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }


  GetOrders(accountId){
   
    console.log("QUERY" , accountId);
    return Observable.create(observer => {
      this.db.executeSql(accountId, [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

  

  
  SaveRelatedClothes(data) {
    return Observable.create(observer => {
      let insertRows = [];
      data.forEach(item => {
        insertRows.push([
          'INSERT OR REPLACE INTO RelatedClothes VALUES(?,?,?,?,?,?,?,?)',
          [item.relatedClothesId, item.clothesId, item.relClothesId, item.categoryId, item.isActive, item.isDelete, item.dateCreated, item.dateUpdated]
        ]);
      });
      this.db.sqlBatch(insertRows).then((result) => {
        observer.next("SUCCESS");
        observer.complete();
      }).catch(e => {
        console.log(e);
        observer.throw(e);
      });
    }, );

  }


  GetDetailsFromTable(query){

    console.log("QUERY", query);
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

  GetCustomerOptionalInfos(acID){
    let optinfoQuery = 'SELECT * FROM CustomerOptionalInfos WHERE accountId=' + acID;
    console.log("QUERY", optinfoQuery);
    return Observable.create(observer => {
      this.db.executeSql(optinfoQuery, [])
        .then(res => {
          observer.next(res);
        })
        .catch(e => {
          observer.next(e);
          console.log(e);
        });

    }, );

  }

 

}

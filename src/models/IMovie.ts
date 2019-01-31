export class IMovie {
  
   Products:Scales[];

  }

  export interface Scales {
    clothesScaleId: number;
    clothesId: number;
    fitId: number;
    isOpenSize: boolean;
    invQty: number;
    isActive: boolean;
    isDelete: boolean;
    dateCreated: string;
    dateUpdated: string;
    Sizes: Size[];
}

  export interface Size {
    clothesScaleSizeId: number;
    clothesScaleId: number;
    sizeId: number;
    quantity: number;
    isActive: boolean;
    isDelete: boolean;
    dateCreated: string;
    dateUpdated: string;
}
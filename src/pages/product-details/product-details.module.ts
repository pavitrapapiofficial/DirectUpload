import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
//import { ProductDetailsPage } from './product-details';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
  //  ProductDetailsPage,
  ],
  imports: [
  //  IonicPageModule.forChild(ProductDetailsPage),
    ComponentsModule,
    PipesModule
  ],
})
export class ProductDetailsPageModule {}

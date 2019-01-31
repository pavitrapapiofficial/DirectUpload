import { NgModule } from '@angular/core';
import { SharedViewComponent } from './shared-view/shared-view';
import { IonicPageModule } from 'ionic-angular';
@NgModule({
	declarations: [SharedViewComponent],
	imports: [IonicPageModule.forChild(SharedViewComponent)],
	exports: [SharedViewComponent]
})
export class ComponentsModule {}

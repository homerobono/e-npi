import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { FileManagerComponent } from './file-manager.component';
import { ExplorerComponent } from './explorer/explorer.component'
import { UploaderComponent } from './uploader/uploader.component';
import { InputDialogComponent } from './modals/input-dialog/input-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FileService } from '../services/file.service';
import { FileUploadModule } from 'ng2-file-upload';
import { ModalModule } from 'ngx-bootstrap';
import { PreviewComponent } from './modals/preview/preview.component';
import { FileButtonComponent } from './file-button/file-button.component';
//import { RoutingModule } from './routing.module'

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule, 
    FlexLayoutModule,
    MatIconModule,
    MatGridListModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    FileUploadModule,
    ModalModule.forRoot()
    //RoutingModule
  ],
  declarations: [
    FileManagerComponent,
    ExplorerComponent, 
    UploaderComponent, 
    FileButtonComponent,
    InputDialogComponent, PreviewComponent, FileButtonComponent
  ],
  exports: [
    FileManagerComponent,
    FileButtonComponent
  ],
  entryComponents: [
    ExplorerComponent, 
    UploaderComponent, 
    InputDialogComponent,
    PreviewComponent
  ],
  providers: [FileService],
})
export class FileManagerModule {}
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
import { NewFolderDialogComponent } from './modals/new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from './modals/rename-dialog/rename-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FileService } from '../services/file.service';
import { FileUploadModule } from 'ng2-file-upload';
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
    FileUploadModule
    //RoutingModule
  ],
  declarations: [
    FileManagerComponent,
    ExplorerComponent, 
    NewFolderDialogComponent, 
    RenameDialogComponent
  ],
  exports: [
    FileManagerComponent
  ],
  entryComponents: [
    ExplorerComponent, 
    NewFolderDialogComponent, 
    RenameDialogComponent],
  providers: [FileService],
})
export class FileManagerModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

@NgModule({
    exports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MaterialModule
    ]
})
export class SharedModule { }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { EditPersonalInfoComponent } from './edit-personal-info/edit-personal-info.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
    standalone: true,
    selector: 'app-profile-page',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        EditPersonalInfoComponent,
        ChangePasswordComponent
    ],
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  
    constructor() {}

    ngOnInit(): void {
    }
}

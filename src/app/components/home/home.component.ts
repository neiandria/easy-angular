import { Component } from '@angular/core';
import { HomeFeaturesComponent } from '../home-features/home-features.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HomeFeaturesComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { SessionVaultService } from './core';
import { startup } from './store/actions';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private session: SessionVaultService,
    private store: Store,
  ) {}

  async ngOnInit() {
    Device.setHideScreenOnBackground(true);
    SplashScreen.hide();
    if (!this.platform.is('hybrid') || (!(await this.session.isEmpty()) && !(await this.session.isLocked()))) {
      this.store.dispatch(startup());
    }
  }
}

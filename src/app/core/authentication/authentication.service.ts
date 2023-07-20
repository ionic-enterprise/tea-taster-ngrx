import { Injectable, NgZone } from '@angular/core';
import { AuthConnect, AuthResult, CognitoProvider, ProviderOptions, TokenType } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

import { mobileAuthConfig, webAuthConfig } from '@env/environment';
import { User } from '@app/models';
import { SessionVaultService } from '../session-vault/session-vault.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public authenticationChange$: Observable<boolean>;
  private authenticationChange: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private readonly provider = new CognitoProvider();

  private isNative;
  private authOptions: ProviderOptions;
  private authResult: AuthResult | null = null;
  private vaultService: SessionVaultService;
  private initializing: Promise<void> | undefined;

  // @ts-ignore
  constructor(
    vaultService: SessionVaultService,
    platform: Platform,
    private ngZone: NgZone,
  ) {
    this.isNative = platform.is('hybrid');
    this.authOptions = this.isNative ? mobileAuthConfig : webAuthConfig;
    this.vaultService = vaultService;
    this.initialize();

    this.authenticationChange$ = this.authenticationChange.asObservable();
  }

  public async login(): Promise<void> {
    await this.initialize();
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
    await this.saveAuthResult(this.authResult);
  }

  public async logout(): Promise<void> {
    await this.initialize();
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
      await this.saveAuthResult(null);
    }
  }

  public async refreshAuth(authResult: AuthResult): Promise<AuthResult | null> {
    let newAuthResult: AuthResult | null = null;
    if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
      try {
        newAuthResult = await AuthConnect.refreshSession(this.provider, authResult);
      } catch (err) {
        return null;
      }
      this.saveAuthResult(newAuthResult);
    }

    return newAuthResult;
  }

  public async getAuthResult(): Promise<AuthResult | null> {
    this.authResult = await this.vaultService.getSession();
    if (this.authResult && (await AuthConnect.isAccessTokenExpired(this.authResult))) {
      this.authResult = await this.refreshAuth(this.authResult);
    }

    return this.authResult;
  }

  public async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return !!(await this.getAuthResult());
  }

  public async getAccessToken(): Promise<string | undefined> {
    await this.initialize();
    const res = await this.getAuthResult();
    return res?.accessToken;
  }

  async getUserInfo(): Promise<User | undefined> {
    const res = await this.getAuthResult();
    const idToken = (await AuthConnect.decodeToken(TokenType.id, res)) as any;
    if (!idToken) {
      return;
    }

    let email = idToken.email;
    if (idToken.emails instanceof Array) {
      email = idToken.emails[0];
    }

    return {
      id: idToken.sub,
      email,
      firstName: idToken.firstName,
      lastName: idToken.lastName,
    };
  }

  private initialize(): Promise<void> {
    if (!this.initializing) {
      this.initializing = new Promise((resolve) => {
        this.setup().then(() => resolve());
      });
    }
    return this.initializing;
  }

  private setup(): Promise<void> {
    return AuthConnect.setup({
      platform: this.isNative ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  }

  private async onAuthChange(isAuthenticated: boolean): Promise<void> {
    this.ngZone.run(() => {
      this.authenticationChange.next(isAuthenticated);
    });
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.vaultService.setSession(authResult);
    } else {
      await this.vaultService.clearSession();
    }
    this.onAuthChange(!!authResult);
  }
}

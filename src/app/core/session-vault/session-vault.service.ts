import { Injectable } from '@angular/core';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import { sessionLocked } from '@app/store/actions';
import { AuthResult } from '@ionic-enterprise/auth';
import { BrowserVault, DeviceSecurityType, Vault, VaultType } from '@ionic-enterprise/identity-vault';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { VaultFactoryService } from './vault-factory.service';

export type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

const vaultKey = 'auth-result';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  vault: Vault | BrowserVault;

  constructor(private modalController: ModalController, store: Store, vaultFactory: VaultFactoryService) {
    this.vault = vaultFactory.create({
      key: 'com.kensodemann.teataster',
      type: VaultType.SecureStorage,
      lockAfterBackgrounded: 5000,
      shouldClearVaultAfterTooManyFailedAttempts: true,
      customPasscodeInvalidUnlockAttempts: 2,
      unlockVaultOnLoad: false,
    });

    this.vault.onLock(() => store.dispatch(sessionLocked()));

    this.vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) =>
      this.onPasscodeRequest(isPasscodeSetRequest)
    );
  }

  async canUnlock(): Promise<boolean> {
    return !(await this.vault.isEmpty()) && (await this.vault.isLocked());
  }

  public getSession(): Promise<AuthResult | null> {
    return this.vault.getValue<AuthResult>(vaultKey);
  }

  public setSession(value: AuthResult): Promise<void> {
    return this.vault.setValue(vaultKey, value);
  }

  async clearSession(): Promise<void> {
    return this.vault.clear();
  }

  isLocked(): Promise<boolean> {
    return this.vault.isLocked();
  }

  unlock(): Promise<void> {
    return this.vault.unlock();
  }

  setUnlockMode(unlockMode: UnlockMode): Promise<void> {
    let type: VaultType;
    let deviceSecurityType: DeviceSecurityType;

    switch (unlockMode) {
      case 'Device':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Both;
        break;

      case 'SessionPIN':
        type = VaultType.CustomPasscode;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      case 'ForceLogin':
        type = VaultType.InMemory;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      case 'NeverLock':
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      default:
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
    }

    return this.vault.updateConfig({
      ...this.vault.config,
      type,
      deviceSecurityType,
    });
  }

  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    this.vault.setCustomPasscode(data || '');
  }
}

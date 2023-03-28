import { SessionVaultService } from './session-vault.service';

export const createSessionVaultServiceMock = () =>
  jasmine.createSpyObj<SessionVaultService>('SessionVaultService', {
    clearSession: Promise.resolve(),
    canUnlock: Promise.resolve(false),
    getSession: Promise.resolve(null),
    setSession: Promise.resolve(),
    isLocked: Promise.resolve(false),
    setUnlockMode: Promise.resolve(),
    unlock: Promise.resolve(),
  });

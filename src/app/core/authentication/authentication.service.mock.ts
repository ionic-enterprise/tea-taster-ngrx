import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    login: Promise.resolve(),
    logout: Promise.resolve(),
    isAuthenticated: Promise.resolve(false),
    getUserInfo: Promise.resolve(undefined),
    getAuthResult: Promise.resolve(undefined),
  });

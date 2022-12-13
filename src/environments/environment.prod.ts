import { IonicAuthOptions } from '@ionic-enterprise/auth';

const baseConfig = {
  authConfig: 'cognito' as 'cognito',
  clientID: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  scope: 'openid email profile',
  audience: '',
};

export const mobileAuthConfig: IonicAuthOptions = {
  ...baseConfig,
  redirectUri: 'msauth://login',
  logoutUrl: 'msauth://login',
  platform: 'capacitor',
  iosWebView: 'private',
};

export const webAuthConfig: IonicAuthOptions = {
  ...baseConfig,
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
};

export const environment = {
  production: true,
  dataService: 'https://cs-demo-api.herokuapp.com',
};

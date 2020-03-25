import KeycloakTokenAuth from './index';

(async () => {
  const keycloakTokenAuth = new KeycloakTokenAuth(
    {
      clientId: '',
      name: '',
      password: '',
      username: ''
    },
    {
      baseUrl: '',
      realmName: ''
    }
  );
  await keycloakTokenAuth.authClient({
    email: '',
    token: '',
    username: ''
  });
})();

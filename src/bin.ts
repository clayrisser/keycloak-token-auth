import KeycloakTokenAuth from './index';

(async () => {
  const keycloakTokenAuth = new KeycloakTokenAuth(
    {
      clientId: process.env.KEYCLOAK_CLIENT_ID || '',
      name: process.env.KEYCLOAK_CLIENT_NAME || '',
      password: process.env.KEYCLOAK_CLIENT_PASSWORD || '',
      username: process.env.KEYCLOAK_CLIENT_USERNAME || ''
    },
    {
      baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
      realmName: process.env.KEYCLOAK_REALM_NAME || 'master'
    }
  );
  await keycloakTokenAuth.authClient({
    email: process.env.KEYCLOAK_USER_EMAIL || process.argv?.[2] || '',
    token: process.env.KEYCLOAK_USER_TOKEN || process.argv?.[3] || '',
    username: process.env.KEYCLOAK_USER_USERNAME || process.argv?.[4] || ''
  });
})();

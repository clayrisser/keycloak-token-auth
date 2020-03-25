import KeycloakTokenAuth from './index';

(async () => {
  const keycloakTokenAuth = new KeycloakTokenAuth(
    {
      adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || '',
      adminUsername: process.env.KEYCLOAK_ADMIN_USERNAME || '',
      clientId: process.env.KEYCLOAK_CLIENT_ID || '',
      clientName: process.env.KEYCLOAK_CLIENT_NAME || '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || ''
    },
    {
      baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
      realmName: process.env.KEYCLOAK_REALM_NAME || 'master'
    }
  );
  await keycloakTokenAuth.authClient({
    username: process.env.KEYCLOAK_USER_USERNAME || process.argv?.[2] || '',
    email: process.env.KEYCLOAK_USER_EMAIL || process.argv?.[3] || '',
    token: process.env.KEYCLOAK_USER_TOKEN || process.argv?.[4] || ''
  });
})();

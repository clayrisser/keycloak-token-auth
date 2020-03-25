import KeycloakAdmin from 'keycloak-admin';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { ConnectionConfig } from 'keycloak-admin/lib/client';

export interface FindOrCreateUserOptions {
  clientToken?: string;
  email: string;
  username: string;
}

export interface AuthClient {
  email: string;
  token: string;
  username: string;
}

export type KeycloakConnectionConfig = ConnectionConfig;

export interface AuthConfig {
  adminPassword: string;
  adminUsername: string;
  clientId: string;
  clientName: string;
  clientSecret: string;
}

export default class KeycloakTokenAuth {
  keycloakAdmin: KeycloakAdmin;

  keycloakAuthenticated = false;

  tokenName: string;

  constructor(
    private clientConfig: AuthConfig,
    private keycloakConnectionConfig?: KeycloakConnectionConfig
  ) {
    if (!this.clientConfig.clientName) {
      this.clientConfig.clientName = this.clientConfig.clientId;
    }
    this.keycloakAdmin = new KeycloakAdmin(this.keycloakConnectionConfig);
    this.tokenName = `${this.clientConfig.clientName}.token`;
  }

  async authKeycloak() {
    if (this.keycloakAuthenticated) return;
    await this.keycloakAdmin.auth({
      clientId: this.clientConfig.clientId,
      clientSecret: this.clientConfig.clientSecret,
      grantType: 'client_credentials',
      password: this.clientConfig.adminPassword,
      username: this.clientConfig.adminUsername
    });
    this.keycloakAuthenticated = true;
  }

  async findOrCreateUser({
    clientToken,
    email,
    username
  }: FindOrCreateUserOptions): Promise<UserRepresentation | null> {
    await this.authKeycloak();
    const users = await this.keycloakAdmin.users.find({
      email,
      username
    });
    const user = users?.[0];
    if (user) return user;
    await this.keycloakAdmin.users.create({
      email,
      username,
      ...(clientToken ? { attributes: { [this.tokenName]: clientToken } } : {})
    });
    return (
      (
        await this.keycloakAdmin.users.find({
          email,
          username
        })
      )?.[0] || null
    );
  }

  async authClient({
    email,
    username,
    token
  }: AuthClient): Promise<UserRepresentation | null> {
    await this.authKeycloak();
    const user = await this.findOrCreateUser({
      clientToken: token,
      email,
      username
    });
    if (!user?.id?.length) throw new Error('failed to get user');
    if (!user?.attributes?.[this.tokenName]) {
      await this.keycloakAdmin.users.update(
        {
          id: user.id
        },
        {
          attributes: {
            ...user.attributes,
            [this.tokenName]: token
          }
        }
      );
      return user;
    }
    if (token === user.attributes[this.tokenName]) return user;
    return null;
  }
}

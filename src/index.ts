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

export interface ClientConfig {
  clientId: string;
  name: string;
  password: string;
  username: string;
}

export default class KeycloakTokenAuth {
  keycloakAdmin: KeycloakAdmin;

  keycloakAuthenticated = false;

  tokenName: string;

  constructor(
    private clientConfig: ClientConfig,
    private keycloakConnectionConfig?: KeycloakConnectionConfig
  ) {
    this.keycloakAdmin = new KeycloakAdmin(this.keycloakConnectionConfig);
    this.tokenName = `${this.clientConfig.name}.token`;
  }

  async authKeycloak() {
    await this.keycloakAdmin.auth({
      clientId: this.clientConfig.clientId,
      grantType: 'password',
      password: this.clientConfig.password,
      username: this.clientConfig.username
    });
    this.keycloakAuthenticated = true;
  }

  async findOrCreateUser({
    clientToken,
    email,
    username
  }: FindOrCreateUserOptions): Promise<UserRepresentation | null> {
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

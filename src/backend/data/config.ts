export interface Config {
  ip: string;
  port: number;

  sessionExpTime: number;

  db_host: string;
  db_port: number;
  db: string;

  clientID: number;
  clientSecret: string;
  redirectUri: string;
}

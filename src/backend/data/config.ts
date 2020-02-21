export interface Config {
  ip: string;
  port: number;

  sessionExpTime: number;
  heartbeatTimeout: number;

  db_host: string;
  db_port: number;
  db: string;

  clientID: string;
  clientSecret: string;
  redirectUri: string;
}

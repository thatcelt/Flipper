declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      DATABASE_HOST: string;
      DATABASE_PORT: number;
      BOT_TOKEN: string;
      BOT_ID: string;
      DEVELOPER_ID: string;
      BIG_BRO_URL: string;
    }
  }
}
export {};

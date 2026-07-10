declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DATABASE_HOST: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;

      BOT_TOKEN: string;
      BOT_ID: string;
      DEVELOPER_ID: string;

      CHAT_URL: string;
    }
  }
}

export {};

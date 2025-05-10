import { ConfigFactory } from "@nestjs/config";
import * as process from "node:process";

interface APP_ENV {
  readonly API_PORT: number;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
}

const appConfigFactory: ConfigFactory<APP_ENV> = () => ({
  API_PORT: parseInt(process.env.API_PORT ?? "", 10) || 3001,
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
});

export { appConfigFactory, APP_ENV };

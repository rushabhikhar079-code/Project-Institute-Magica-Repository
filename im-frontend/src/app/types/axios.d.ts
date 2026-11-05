import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    showLoader?: boolean;
  }
}

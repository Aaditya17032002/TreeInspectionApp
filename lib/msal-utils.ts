import { AccountInfo } from "@azure/msal-browser";
import { msalInstance } from "./msal-config";

export const getUserInfo = (): { name: string; email: string } | null => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    const account: AccountInfo = accounts[0];
    const name = account.name || account.username.split('@')[0];
    const email = account.username;
    return { name, email };
  }
  return null;
};


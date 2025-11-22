import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    // Ensure conf.appwriteUrl ends with /v1 (or include /v1 here)
    this.client
      .setEndpoint(conf.appwriteUrl) // e.g. 'https://fra.cloud.appwrite.io/v1'
      .setProject(conf.appwriteProjectId);

    this.account = new Account(this.client);
  }

  // Helper to call create-session in a version-tolerant way
  async _createEmailSession(email, password) {
    try {
      // Prefer createEmailPasswordSession if present
      if (typeof this.account.createEmailPasswordSession === 'function') {
        // try object signature first (newer SDKs)
        try {
          return await this.account.createEmailPasswordSession({ email, password });
        } catch (errInner) {
          // fallback to positional if object signature fails
          return await this.account.createEmailPasswordSession(email, password);
        }
      }

      // older SDKs might have createEmailSession
      if (typeof this.account.createEmailSession === 'function') {
        try {
          return await this.account.createEmailSession({ email, password });
        } catch (errInner) {
          return await this.account.createEmailSession(email, password);
        }
      }

      // final fallback: createSession (very old)
      if (typeof this.account.createSession === 'function') {
        return await this.account.createSession(email, password);
      }

      throw new Error('No compatible Appwrite session method found on account object.');
    } catch (error) {
      // rethrow with more info
      error.__where = '_createEmailSession';
      throw error;
    }
  }

  async createAccount({ email, password, name }) {
    try {
      // use object signature for create (most versions)
      const userAccount = await this.account.create({
        userId: ID.unique(),
        email,
        password,
        name
      });
      // auto-login after create (if you want)
      if (userAccount) return this.login({ email, password });
      return userAccount;
    } catch (error) {
      console.error('createAccount error:', formatAppwriteError(error));
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      const session = await this._createEmailSession(email, password);
      return session;
    } catch (error) {
      console.error('login error:', formatAppwriteError(error));
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      // Inspect Appwrite error object
      console.warn('getCurrentUser error:', formatAppwriteError(error));
      return null;
    }
  }

  async logout() {
    try {
      // deleteSessions deletes all sessions for this user
      await this.account.deleteSessions();
    } catch (error) {
      console.error('logout error:', formatAppwriteError(error));
    }
  }
}

function formatAppwriteError(err) {
  // err may contain .code, .message and optionally .response / .body
  try {
    return {
      message: err?.message ?? String(err),
      code: err?.code ?? null,
      body: err?.response ?? err?.body ?? null,
      raw: err
    };
  } catch (e) {
    return { message: String(err), raw: err };
  }
}

const authService = new AuthService();
export default authService;

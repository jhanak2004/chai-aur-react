// service.js — corrected minimal version
import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      const documentId = slug || ID.unique();
      const data = { title, slug, content, featuredImage, status, userId };
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId,
        data
      );
    } catch (error) {
      console.error("Appwrite service :: createPost :: error", error);
      return null;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      if (!slug) throw new Error("updatePost requires a slug/documentId");
      const data = { title, content, featuredImage, status };
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        data
      );
    } catch (error) {
      console.error("Appwrite service :: updatePost :: error", error);
      return null;
    }
  }

  async deletePost(slug) {
    try {
      if (!slug) throw new Error("deletePost requires a slug/documentId");
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return true;
    } catch (error) {
      console.error("Appwrite service :: deletePost :: error", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      if (!slug) throw new Error("getPost requires a slug/documentId");
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      console.error("Appwrite service :: getPost :: error", error);
      return null;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.error("Appwrite service :: getPosts :: error", error);
      return null;
    }
  }

  async uploadFile(file) {
    try {
      if (!file) throw new Error("uploadFile requires a File/Blob");
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.error("Appwrite service :: uploadFile :: error", error);
      return null;
    }
  }

  async deleteFile(fileId) {
    try {
      if (!fileId) throw new Error("deleteFile requires fileId");
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.error("Appwrite service :: deleteFile :: error", error);
      return false;
    }
  }

  getFilePreview(fileId) {
    if (!fileId) throw new Error("getFilePreview requires fileId");
    return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  }
}

const service = new Service();
export default service;

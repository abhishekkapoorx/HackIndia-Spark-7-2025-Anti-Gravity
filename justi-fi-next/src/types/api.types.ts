
// User types
export interface UserResponse {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Space types
export interface SpaceResponse {
  _id: string;
  spaceName: string;
  owner: string;
  threads: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceRequest {
  spaceName: string;
}

// Thread types
export interface ThreadResponse {
  _id: string;
  space: string;
  title: string;
  createdBy: string;
  messages: MessageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
}

// Message types
export interface MessageResponse {
  _id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

export interface CreateMessageRequest {
  content: string;
  role?: "user" | "agent";
}

// Document types
export interface DocumentResponse {
  _id: string;
  space: string;
  title: string;
  fileType: string;
  fileSize: number;
  publicId: string;
  secureUrl: string;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// CloudinaryUploadResponse
export interface CloudinaryUploadResponse {
  publicId: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  resourceType: string;
}

// API Error response
export interface ApiErrorResponse {
  error: string;
}
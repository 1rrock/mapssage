export interface Trace {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TraceWithUser extends Trace {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface TraceWithDistance extends TraceWithUser {
  distance: number;
}

export interface CreateTraceInput {
  title: string;
  content: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
}

export interface UploadResponse {
  fileUrl: string;
}

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  traceId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  user: CommentUser;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

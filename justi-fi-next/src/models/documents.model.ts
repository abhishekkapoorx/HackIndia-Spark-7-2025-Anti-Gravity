import mongoose , { Document, Schema, Model, Types } from "mongoose";

export interface IDocument extends Document {
  space: Types.ObjectId;       
  title: string;
  fileType: string;            
  fileSize: number;            
  publicId: string;           
  secureUrl: string;           
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId;   
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    space:       { type: Schema.Types.ObjectId, ref: "Space", required: true },
    title:       { type: String, required: true, trim: true },
    fileType:    { type: String, required: true },
    fileSize:    { type: Number, required: true },
    publicId:    { type: String, required: true },
    secureUrl:   { type: String, required: true },
    metadata:    { type: Schema.Types.Mixed },
    createdBy:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);



export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

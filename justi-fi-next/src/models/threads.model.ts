
import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IMessage {
  role:     "user" | "agent";  
  content:  string;            
  createdAt: Date;             
}

export interface IThread extends Document {
  space:     Types.ObjectId;   
  title:     string;           
  createdBy: Types.ObjectId;   
  createdAt: Date;
  updatedAt: Date;
}


const ThreadSchema = new Schema<IThread>(
  {
    space: {
      type: Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   
  },
  { timestamps: true }
);

const Thread: Model<IThread> =
  mongoose.models.Thread ||
  mongoose.model<IThread>("Thread", ThreadSchema);

export default Thread;

// models/message.model.ts

import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IMessage extends Document {
  thread:    Types.ObjectId;           // which thread this message belongs to
  space:     Types.ObjectId;           // the parent space
  sender:    Types.ObjectId;           // which user (clerk) sent it
  role:      "HumanMessage" | "AIMessage";         // same as before
  content:   string;                   // the message text
  createdAt: Date;                     // auto-timestamp
  updatedAt: Date;                     // auto-timestamp
}

const MessageSchema = new Schema<IMessage>(
  {
    thread: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: "Space",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "agent"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,  // auto-manages createdAt & updatedAt
  }
);

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

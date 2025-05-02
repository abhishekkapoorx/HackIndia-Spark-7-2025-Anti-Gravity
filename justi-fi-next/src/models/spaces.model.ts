import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface ISpace extends Document {
  spaceName: string;                // Name of the space
  owner: Types.ObjectId;            // User ID of the owner
  threads: Types.ObjectId[];        // Array of Thread IDs
  documents: Types.ObjectId[];      // Array of Document IDs
  createdAt: Date;
  updatedAt: Date;
}

const SpaceSchema = new Schema<ISpace>(
  {
    spaceName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    threads: {
      type: [Schema.Types.ObjectId],
      ref: "Thread",
      default: [],
    },
    documents: {
      type: [Schema.Types.ObjectId],
      ref: "Document",
      default: [],
    },
  },
  { timestamps: true }
);

// Export both the interface and the model
export const Space: Model<ISpace> =
  mongoose.models.Space || mongoose.model<ISpace>("Space", SpaceSchema);
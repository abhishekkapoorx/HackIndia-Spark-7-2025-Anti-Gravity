import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IRebuttal {
  counterargument: string;
  legal_basis:     string;
  tactical_approach: string;
  alternative_positions?: string;
}

export interface INegativePoint {
  argument:    string;
  explanation: string;
  severity:    "Critical" | "Significant" | "Moderate" | "Minor";
  area:        string;
  rebuttal?:   IRebuttal;
}

export interface IInsight extends Document {
  space:        Types.ObjectId;        
  thread?:      Types.ObjectId;        
  createdBy:    Types.ObjectId;        
  summary:      string;                
  positives:    string[];              
  negatives:    INegativePoint[];      
  citations:    {                       
    label: string;
    url:   string;
  }[];
  createdAt:    Date;
  updatedAt:    Date;
}

const RebuttalSchema = new Schema<IRebuttal>(
  {
    counterargument:   { type: String, required: true, trim: true },
    legal_basis:       { type: String, required: true, trim: true },
    tactical_approach: { type: String, required: true, trim: true },
    alternative_positions: { type: String, trim: true },
  },
  { _id: false } 
);

const NegativePointSchema = new Schema<INegativePoint>(
  {
    argument:    { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    severity:    {
      type: String,
      enum: ["Critical", "Significant", "Moderate", "Minor"],
      required: true,
    },
    area:        { type: String, required: true, trim: true },
    rebuttal:    { type: RebuttalSchema },
  },
  { _id: true }
);

const InsightSchema = new Schema<IInsight>(
  {
    space: {
      type: Schema.Types.ObjectId,
      ref: "Space",
      required: true,
      index: true,
    },
    thread: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    positives: {
      type: [String],
      default: [],
    },
    negatives: {
      type: [NegativePointSchema],
      default: [],
    },
    citations: [
      {
        label: { type: String, required: true },
        url:   { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const Insight: Model<IInsight> =
  mongoose.models.Insight ||
  mongoose.model<IInsight>("Insight", InsightSchema);

export default Insight;

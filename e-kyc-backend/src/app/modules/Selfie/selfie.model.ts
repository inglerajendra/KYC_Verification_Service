import { Schema, model } from "mongoose";
import {
  type ISelfieDocument,
  type SelfieModel,
  SelfieStatus,
} from "./selfie.interface";

const selfieSchema = new Schema<ISelfieDocument, SelfieModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    selfieImageUrl: {
      type: String,
      required: [true, "Selfie image URL is required"],
    },
    status: {
      type: String,
      enum: Object.values(SelfieStatus),
      default: SelfieStatus.PENDING,
    },
    rejectionReason: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

selfieSchema.statics.findByUserId = async function (
  userId: string
): Promise<ISelfieDocument | null> {
  return this.findOne({ user: userId });
};

// selfieSchema.index({ user: 1 }, { unique: true })
// selfieSchema.index({ status: 1 })

export const Selfie = model<ISelfieDocument, SelfieModel>(
  "Selfie",
  selfieSchema
);

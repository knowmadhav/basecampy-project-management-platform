import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
    {
        title: {
            title: String,
            required: true,
            trim: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
        },
        isCompleted: {
            type: Boolean,
            default: fals,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true },
);

export const subtask = mongoose.model("subTask", subTaskSchema);

import mongoose, { Mongoose, Schema } from "mongoose";
import { AvailableTaskStatus, AvailableUserRole, TaskStatusEnum, UserRoleEnum } from "../utils/constants";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: AvailableTaskStatus,
            default: TaskStatusEnum.TODO,
        },
        attachment: {
            type: [
                {
                    url: String,
                    MimeType: String,
                    size: Number,
                },
            ],
            default: [],
        },
    },
    { timestamps: true },
);

export const task = mongoose.model("Task", taskSchema);

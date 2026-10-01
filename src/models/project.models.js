import mongoose, { Mongoose, Schema } from "mongoose";

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unqiue: true,
        },
        description: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const Project = mongoose.model("Project", projectSchema);

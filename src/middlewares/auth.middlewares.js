import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

import { projectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorised request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken -emailVerification -emailVerificationExpiry",
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token");
    }
    next();
});

export const validateProjectPermission = (roles = []) => {
    asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(409, "Project id is required");
        }

        const projectMemberDoc = await projectMember.findOne({
            user: new mongoose.Types.ObjectId(req.user._id),
            project: new mongoose.Types.ObjectId(projectId),
        });

        if (!projectMemberDoc) {
            throw new ApiError(409, "Project with the user doesnt exist");
        }

        const givenRole = projectMemberDoc?.role;
        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            throw new ApiError(
                403,
                "you dont have permission to perform action ",
            );
        }

        next();
    });
};

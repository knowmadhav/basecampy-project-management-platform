import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { projectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEnum, AvailableUserRole } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const user = req.user._id;

    if (!name || !description) {
        throw new ApiError(
            409,
            "Project name or Project description is required.",
        );
    }
    if (!user) {
        throw new ApiError(409, "User is required.");
    }

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id), // req.user._id might give in string format but we want to be assured thats its a mongo db object id.. thats why mongoose.Type.ObjectId(<objectId>)
    });

    await projectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRoleEnum.ADMIN,
    });

    res.status(201).json(
        new ApiResponse(201, project, "project created successfully"),
    );
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, "project doesn't exist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, project, "project was updated"));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete({
        _id: projectId,
    });

    if (!project) {
        throw new ApiError(409, "project do not exist ");
    }

    await projectMember.deleteMany({
        project: projectId,
    });

    return res.status(200).json(new ApiResponse(200, "project deleted"));
});

///
const getProjects = asyncHandler(async (req, res) => {
    const project = await projectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                foreignField: "_id",
                localField: "project",
                as: "projectDetails",

                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "projectDetails",
        },
        {
            $projectDetails: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdBy: 1,
                    createdAt: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById({ projectId });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project sent successfully"));
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { email, role } = req.body;

    const user = await User.findOne({
        email,
    });
    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    if (!AvailableUserRole.includes(role)) {
        throw new ApiError(404, "Invalid user role");
    }

    const projectMemberDoc = await projectMember.create({
        user,
        project: projectId,
        role,
    });

    // await projectMember.findByIdAndUpdate(
    //     /// shouldn't it be projectMember.create()
    //     {
    //         user: new mongoose.Types.ObjectId(user_id), //shouldn't it be req.user._id
    //         project: new mongoose.Types.ObjectId(projectId),
    //     },
    //     {
    //         user: new mongoose.Types.ObjectId(user_id), //shouldn't it be req.user._id
    //         project: new mongoose.Types.ObjectId(projectId),
    //         role,
    //     },
    //     {
    //         new: true, //update the projectmember document and respond the updated one
    //         upsert: true, //create new document if it doesnt exist
    //     },
    // );

    res.status(200).json(
        new ApiResponse(200, { projectMemberDoc }, "Member added successfully"),
    );
});

///
const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(409, "Project not found");
    }

    const projectMembers = await projectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",

                pipeline: [
                    {
                        $project: {
                            avtar: 1,
                            username: 1,
                            email: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                user: {
                    $arrayEleAt: ["$user", 0],
                },
            },
        },
        {
            $project: {
                user: 1,
                project: 1,
                createdAt: 1,
                role: 1,
                updatedAt: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, projectMembers, "project members fetched"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { role, user } = req.body;

    if (!AvailableUserRole.includes(role)) {
        throw new ApiError(409, "Invalid Role");
    }

    const doUserExist = User.findOne({ username: user });
    const doProjectExist = Project.findOne({ _id: projectId });

    if (!doUserExist || !doProjectExist) {
        return new ApiError(400, "Project or User do not exist");
    }

    doProjectExistWithUser = await projectMember.findOne({
        user: new mongoose.Types.ObjectId(user._id),
        project: projectId,
    });

    if (!doProjectExistWithUser) {
        throw new ApiError(404, "User with the given project doesn't exist");
    }

    await projectMember.findOneAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role,
        },
        {
            new: true,
        },
    );

    return res.status(200).json(new ApiResponse(200, {}, "User role updated"));
});

const deleteMember = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const { projectid } = req.params;

    if (!userId || !projectid) {
        throw new ApiError(409, "User or Project field couldn't be empty");
    }

    const project = Project.findById({ _id: projectid });
    const user = User.findById({ _id: userId });

    if (!project || !user) {
        throw new ApiError(409, "User or Project doesn't exist");
    }

    await projectMember.findByIdAndDelete({
        user: new mongoose.Types.ObjectId(userId),
        project: new mongoose.Types.ObjectId(projectid),
    });

    res.status(200).json(
        new ApiResponse(200, {}, "User has been removed from project"),
    );
});

export {
    getProjects,
    createProject,//
    getProjectById,
    updateProject,//
    deleteProject,
    getProjectMembers,
    addMemberToProject,//
    updateMemberRole,//
    deleteMember,//
};

/*

const getProjectMemberss = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(404, "Project doesn't exist");
    }

    const projmem = await projectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId), //filter all those projectmember document which matches with project as the given projectId
            },
        },
        {
            $lookup: {
                // adding an array of object where each object represent the user .. within those projectmember document,
                from: "users", // its collection in the db from which we want to match
                foreignField: "_id",
                localField: "user",
                as: "userInfoInThisProject",

                pipeline: [
                    // we are not yet in array ,we are adding another pipeline which will go through each of matched user
                    {
                        $project: {
                            //for each of the user , I dont want all the field
                            avtar: 1,
                            _id: 0, //we dont want _id of that particular user
                            username: 1,
                            email: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        }, //here we will array of object of those matched user
        {
            $unwind: "$userInfoInThisProject", //unwinding those array of object as single object represeting each user..
        },
        {
            $project: {
                // here we are having projectmember document along with the added userInfoInThisProject field
                _id: 0, // we dont want _id of the projectmember document
                userInfoInThisProject: 1, // we want the added field of those user which belong to this project
                role: 1, // along with the role
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, projmem, "Member fetched successfully"));
});

const getPROJECTmembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const projectmem = await projectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "user",
                as: "userInThisProject",

                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            fullName: 1,
                            email: 1,
                            avtar: 1,
                            password: 0,
                            isEmailVerified: 0,
                            refreshToken: 0,
                            forgotPasswordToken: 0,
                            forgotPasswordExpiry: 0,
                            emailVerificationToken: 0,
                            emailVerificationExpiry: 0,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$userInThisProject",
        },
        {
            $project: {
                userInThisProject: 1,
                _id: 0,
                role: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                projectmem,
                "Project member fetched successfully",
            ),
        );
});

*/

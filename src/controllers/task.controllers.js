import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

import { Project } from "../models/project.models.js";
import { task } from "../models/task.models.js";
import { subtask } from "../models/subtask.models.js";
import mongoose from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants";
import { User } from "../models/user.models.js";

export const createTaskByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, email } = req.body;

    if (!projectId || !title || !description || !email) {
        throw new ApiError(
            404,
            "ProjectId or title or description or email is missing",
        );
    }
    const assignedTo = await User.findOne({
        email,
    });

    if (!assignedTo) {
        throw new ApiError(404, "User doesnt exist");
    }

    

    const doTaskExist = await task.findOne({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
    });

    if (doTaskExist) {
        throw new ApiError(409, "Task already exist");
    }

    const Task = await task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        status: TaskStatusEnum.TODO,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, Task, "Task has been created successfully"));
});

export const getTaskDetailsbyProjectId = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    if (!projectId || !taskId) {
        throw new ApiError(402, "TaskId or ProjectId is missing");
    }
    const taskDetails = await task.findOne({
        project: projectId,
        _id: taskId,
    });
    if (!taskDetails) {
        throw new ApiError(409, "Task doesn't exist");
    }

    res.status(200).json(
        new ApiResponse(200, taskDetails, "Task fetched successfully"),
    );
});

export const getTaskByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(404, "ProjectId is required");
    }

    const doProjectExist = await Project.findById(projectId);

    if (!doProjectExist) {
        throw new ApiError(404, "Project doesn't exist");
    }

    const taskDetails = await task.aggregate([
        {
            $match: {
                project: "$projectId",
            },
        },
    ]);

    //taskDetails will be array of object where each object represents the different task being present in that project

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                taskDetails,
                "Task assigned to all defined project have been fetched successfully",
            ),
        );
});

export const updateTaskbyProjectId = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title, description, email, status } = req.body;

    if (!projectId || !taskId) {
        throw new ApiError(404, "Project id or task id is missing");
    }

    if (!AvailableTaskStatus.includes(status)) {
        throw new ApiError(404, "Task status is invalid");
    }
    const assigningTo = await User.findOne({
        email,
    });

    if (!assigningTo) {
        throw new ApiError(404, "User doesn't exist");
    }

    const updatedTask = await task.findByIdAndUpdate(
        taskId,
        {
            title,
            description,
            assignedTo: assigningTo,
            status,
        },
        {
            new: true,
        },
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

export const deleteTaskbyProjectId = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    if (!projectId || !taskId) {
        throw new ApiError(400, "Project id or task id is missing");
    }

    await task.findOneAndDelete({
        project: new mongoose.Types.ObjectId(projectId),
        _id: new mongoose.Types.ObjectId(taskId),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Task deleted successfully"));
});

export const createSubTaskbyTaskId = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!taskId) {
        throw new ApiError(404, "Task id is missing");
    }

    const subtaskExist = await subTask.findOne({
        title,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        task: new mongoose.Types.ObjectId(taskId),
    });

    if (subtaskExist) {
        throw new ApiError(404, "Task already exist");
    }

    const subTask = await subtask.create({
        title,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        isCompleted: false,
        task: new mongoose.Types.ObjectId(taskId),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "subTask created successfully"));
});

export const updateSubTaskbyTaskId = asyncHandler(async (req, res) => {
    const { taskId, subTaskId } = req.params;
    const { title, isTaskCompleted } = req.body;

    if (!taskId || !subTaskId) {
        throw new ApiError(404, "Task id or sub task id is missing");
    }

    const subtaskExist = await subTask.findOne({
        _id: new mongoose.Types.ObjectId(subTaskId),
        task: new mongoose.Types.ObjectId(taskId),
    });

    if (!subtaskExist) {
        throw new ApiError(404, "Task doesnt exist");
    }

    const subTask = await subtask.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(subTaskId),
            task: new mongoose.Types.ObjectId(taskId),
        },
        {
            title,
            isCompleted: isTaskCompleted,
        },
        {
            new: true,
        },
    );

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "subTask updated successfully"));
});

export const deleteSubTaskbyTaskId = asyncHandler(async (req, res) => {
    const { taskId, subTaskId } = req.params;

    if (!taskId || !subTaskId) {
        throw new ApiError(404, "Task id or sub task id is missing");
    }

    await subtask.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(subTaskId),
        task: new mongoose.Types.ObjectId(taskId),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "subTask deleted successfully"));
});

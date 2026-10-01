import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectNote } from "../models/notes.models.js";
import { Project } from "../models/project.models.js";
import { Mongoose } from "mongoose";

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    if (!projectId || !content) {
        throw new ApiError(404, "project id or content is missing");
    }

    const project = await Project.findOne({
        _id: new Mongoose.Types.ObjectId(projectId),
        createdBy: new Mongoose.Types.ObjectId(req.user?._id),
    });

    if (!project) {
        throw new ApiError(400, "Project doesn't exist");
    }

    const projectNote = await ProjectNote.create({
        project: new Mongoose.Types.ObjectId(projectId),
        createdBy: new Mongoose.Types.ObjectId(req.user._id),
        content,
    });

    res.status(201).json(
        new ApiResponse(201, projectNote, "Project Note created successfully"),
    );
});

const readNoteById = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    if (!projectId || !noteId) {
        throw new ApiError(404, "Project Id  or Note Id is missing");
    }

    const projectNote = await ProjectNote.findOne({
        project: new Mongoose.Types.ObjectId(projectId),
        _id: new Mongoose.Types.ObjectId(noteId),
    });

    if (!projectNote) {
        throw new ApiError(404, "Project Note doesn't exist");
    }

    res.status(200).json(
        new ApiResponse(200, projectNote, "Project Note fetched successfully"),
    );
});

const updateNoteById = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;
    const { content } = req.body;

    if (!projectId || !noteId || !content) {
        throw new ApiError(404, "Project Id  or Note Id or content is missing");
    }

    const projectNote = await ProjectNote.findOne({
        _id: new Mongoose.Types.ObjectId(noteId),
        project: new Mongoose.Types.ObjectId(projectId),
    });

    if (!projectNote) {
        throw new ApiError(404, "ProjectNote doesn't exist");
    }

    projectNote = await ProjectNote.findOneAndUpdate(
        {
            _id: new Mongoose.Types.ObjectId(noteId),
            project: new Mongoose.Types.ObjectId(projectId),
        },
        {
            content,
        },
        {
            new: true,
        },
    );

    res.status(201).json(
        new ApiResponse(201, projectNote, "Project Note updated Successfully"),
    );
});

const deleteNodeById = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    if (!projectId || !noteId) {
        throw new ApiError(404, "Project Id  or Note Id is missing");
    }

    const projectNote = await ProjectNote.findOne({
        _id: new Mongoose.Types.ObjectId(noteId),
        project: new Mongoose.Types.ObjectId(projectId),
    });

    if (!projectNote) {
        throw new ApiError(404, "ProjectNote doesn't exist");
    }

    projectNote = await ProjectNote.findOneAndDelete({
        _id: new Mongoose.Types.ObjectId(noteId),
        project: new Mongoose.Types.ObjectId(projectId),
    });

    res.status(201).json(
        new ApiResponse(201, {}, "Project Note deleted Successfully"),
    );
});

const listNotesByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        throw new ApiError(404, "Project Id is missing");
    }
    const projectNoteExist = await ProjectNote.findOne({
        project: new Mongoose.Types.ObjectId(projectId),
    });

    if (!projectNoteExist) {
        throw new ApiError(404, "projectNoteExist Doesn't exist");
    }
    
    const projectNoteArray = await ProjectNote.aggregate([
        {
            $match: {
                project: new Mongoose.Types.ObjectId(projectId),
            },
        },
    ]);

    res.status(201).json(
        new ApiResponse(201, projectNoteArray, "Notes fetched successfully"),
    );
});

export {
    createNote,
    readNoteById,
    updateNoteById,
    deleteNodeById,
    listNotesByProjectId,
};

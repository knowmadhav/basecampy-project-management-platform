import { Router } from "express";
import {
    createNote,
    readNoteById,
    updateNoteById,
    deleteNodeById,
    listNotesByProjectId,
} from "../controllers/notes.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

import { validate } from "../middlewares/validator.middlewares.js";
import { validateProjectPermission } from "../middlewares/auth.middlewares.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = new Router();

router.use(verifyJWT);

router
    .route("/:projectId")
    .post(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        validate,
        createNote,
    );

router
    .route("/:projectId")
    .get(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.MEMBER,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        listNotesByProjectId,
    );

router
    .route("/:projectId/n/:noteId")
    .get(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.MEMBER,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        readNoteById,
    );

router
    .route("/:projectId/n/:noteId")
    .put(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        validate,
        updateNoteById,
    );

router
    .route("/:projectId/n/:noteId")
    .delete(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        validate,
        deleteNodeById,
    );

export default router;

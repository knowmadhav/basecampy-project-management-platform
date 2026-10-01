import { Router } from "express";
import {
    createTaskByProjectId,
    getTaskDetailsbyProjectId,
    getTaskByProjectId,
    updateTaskbyProjectId,
    deleteTaskbyProjectId,
    createSubTaskbyTaskId,
    updateSubTaskbyTaskId,
    deleteSubTaskbyTaskId,
} from "../controllers/task.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { UserRoleEnum } from "../utils/constants.js";
import { validateProjectPermission } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";

const router = new Router();
router.use(verifyJWT);

router
    .route("/:projectId")
    .get(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.MEMBER,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        getTaskByProjectId,
    )
    .post(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        createTaskByProjectId,
    );

router
    .route("/:projectId/t/:taskId")
    .get(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.MEMBER,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        getTaskDetailsbyProjectId,
    )
    .put(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        updateTaskbyProjectId,
    )
    .delete(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        deleteTaskbyProjectId,
    );

router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        createSubTaskbyTaskId,
    );

router
    .route("/:projectId/st/:subTaskId")
    .update(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
            UserRoleEnum.MEMBER,
        ]),
        validate,
        updateSubTaskbyTaskId,
    )
    .delete(
        validateProjectPermission([
            UserRoleEnum.ADMIN,
            UserRoleEnum.PROJECT_ADMIN,
        ]),
        validate,
        deleteSubTaskbyTaskId,
    );

export default router;

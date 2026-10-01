import { Router } from "express";
import {
    addMemberToProject,
    createProject,
    deleteMember,
    deleteProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    updateProject,
} from "../controllers/project.controllers";
import {
    validateProjectPermission,
    verifyJWT,
} from "../middlewares/auth.middlewares";
import { validate } from "../middlewares/validator.middlewares";
import {
    addMemberToProjectValidator,
    createProjectValidator,
} from "../validators";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants";

const router = new Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject,
    )
    .delete(validateProjectPermission([UserRoleEnum.ADMIN]),validate, deleteProject);

router
    .route("/:projectId/members")
    .get(validateProjectPermission(AvailableUserRole),validate, getProjectMembers)
    .post(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMemberToProject,
    );

router
    .route("/:projectId/members/:userId")
    .put(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        updateMemberRole,
    )
    .delete(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        validate,
        deleteMember,
    );

export default router;

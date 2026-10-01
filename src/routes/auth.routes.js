import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    refreshAccessToken,
    forgotPasswordReq,
    resetForgotPassword,
    getCurrentUser,
    changeCurrentPassword,
    resendEmailVerification,
} from "../controllers/auth.controllers.js";

import {
    userRegisterValidator,
    userLoginValidation,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    userChangeCurrentPasswordValidator,
} from "../validators/index.js";

import { validate } from "../middlewares/validator.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = new Router();

//unsecured route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidation(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
    .route("/forgot-password")
    .post(userForgotPasswordValidator(), validate, forgotPasswordReq);
router
    .route("/reset-password/:resetToken")
    .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

//secured route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router
    .route("/change-password")
    .post(
        verifyJWT,
        userChangeCurrentPasswordValidator(),
        validate,
        changeCurrentPassword,
    );
router
    .route("/resend-email-verification")
    .post(verifyJWT, resendEmailVerification);

export default router;

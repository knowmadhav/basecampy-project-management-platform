import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email format is wrong"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 6 })
            .withMessage("Username must be atleast 6 character long"),
        body("password")
            .notEmpty()
            .withMessage("Password shouldnt be empty")
            .isLength({ min: 9 })
            .withMessage("Password must be atleast 8 character long "),
        body("fullName")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Full Name must not be empty"),
    ];
};

const userLoginValidation = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email format is wrong"),
        body("password")
            .notEmpty()
            .withMessage("Password shouldn't be empty")
            .isLength()
            .withMessage("Password must be there"),
    ];
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body("password")
            .notEmpty()
            .withMessage("Old password is required")
            .isLength()
            .withMessage("Password must be there"),
        body("newpassword")
            .notEmpty()
            .withMessage("new password is required")
            .isLength()
            .withMessage("Password must be there"),
    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
    ];
};

const userResetForgotPasswordValidator = () => {
    return [
        body("newpassword")
            .notEmpty()
            .withMessage("new password is required")
            .isLength()
            .withMessage("Password must be there"),
    ];
};

const createProjectValidator = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("Project name should be there")
            .unique()
            .withMessage("Project with the given name already exist")
            .trim(),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description of the project is required"),
    ];
};

const addMemberToProjectValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email should not be empty")
            .isEmail()
            .withMessage("Email is required"),

        body("role")
            .isEmpty()
            .withMessage("Role should not be empty")
            .isIn(AvailableUserRole)
            .withMessage("Role is not within the defined role array"),
    ];
};

export {
    userRegisterValidator,
    userLoginValidation,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    createProjectValidator,
    addMemberToProjectValidator,
};

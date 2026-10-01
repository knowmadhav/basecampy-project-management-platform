import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail,
} from "../utils/mail.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { use } from "react";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token",
        );
    }
};

const registerUser = asyncHandler(async function (req, res) {
    const { email, username, password, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email / username already exist", []);
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = unHashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailGenContent: emailVerificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordExpiry -forgotPasswordToken",
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering a user",
            [],
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered Successfully and verification email has been sent on your email ",
            ),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(402, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "Email doesnt exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id,
    );

    //cookie require options
    const options = {
        httpOnly: false,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            returnDocument: "after",
        },
    );

    const options = {
        httpOnly: false,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User has been logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    //first check if user is login or not , will check it in routing through verifyJWT
    //get user details

    return new ApiResponse(
        200,
        { user: req.user },
        "User exist and the details are mentioned",
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing");
    }

    const hashedToken = crypto
        .createHash(sha256)
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(
            400,
            "Token is invalid and user hasn't been verified",
        );
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, "User has been verified"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User doesnt exist");
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified");
    }
    const { unHashedToken, hashedToken, tokenExpiry } =
        generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "We got a req to verify your email again.Please verify again",
        mailGenContent: emailVerificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/resend-email-verification${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Email verification has been sent again"),
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised access");
    }
    try {
        const decodedRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        const user = await User.findById(decodedRefreshToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken != user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access Token refreshed",
                ),
            );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const forgotPasswordReq = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    await sendEmail({
        email: user?.email,
        subject: "We got a req to password request",
        mailGenContent: forgotPasswordMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/forgot-password${unHashedToken}`,
        ),
    });

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Forgot password email has been sent"));
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(
            489,
            "Password cant be reset as either you arent authorised or forgot password request url has been expried",
        );
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    return res
        .status(200)
        .json(new ApiResponse(200, "Password has been reset :), enjoy bruh"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User doesnt exist");
    }
    const checkPassword = await user.isPasswordCorrect(oldPassword);
    if (!checkPassword) {
        throw new ApiError(404, "Password is incorrect");
    }
    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password has been reset"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordReq,
    resetForgotPassword,
    changeCurrentPassword,
};

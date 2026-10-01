import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
// const healthCheck = (req, res,next) => {
//   try {
//     res
//       .status(200)
//       .json(new ApiResponse(200, { message: " ✅ Server is running" }));
//   } catch (error) { next(error)}
// };

const healthCheck = asyncHandler((req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: " Server running good" }));
});

export { healthCheck };
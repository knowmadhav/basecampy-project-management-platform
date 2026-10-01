// const asyncHandler = (requestHandler) => {
//   return (res, req, next) => {
//     Promise.then(requestHandler(res,req))
//             .catch((err)=>next(err))
//   };
// };

// export { asyncHandler };



const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve().then(requestHandler(req,res,next))
        .catch(err => next(err))
    }
}

export {asyncHandler}
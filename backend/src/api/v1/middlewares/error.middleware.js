const httpsError =require("../../../core/httpStatus")


exports.errorMiddleware =(err,req,res,next)=>{
    const statusCode =err.statusCode || httpsError.INTERNAL_SERVER_ERROR
    const message =err.message || (statusCode === 500 ?"Internal Server Error" : "Error")

    const payload ={
        error:{
            statusCode,
            message,
            code: err.code || null,
            details: err.details || null,
        }
    }
    if (process.env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
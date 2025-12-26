class ApiError extends Error{
  /**
   * @param {number} statusCode HTTP status
   * @param {string} message human readable message
   * @param {any} details optional extra info (array/object)
   * @param {string} code optional business code, ví dụ OUT_OF_STOCK
   */
    constructor(statusCode,message,details =null,code=null){
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.code = code;
        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports = ApiError;
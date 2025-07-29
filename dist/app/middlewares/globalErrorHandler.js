"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
// import { deleteImageFromCLoudinary } from "../config/cloudinary.config";
const env_1 = require("../config/env");
// import { handleCastError } from "../helpers/handleCastError";
// import { handlerDuplicateError } from "../helpers/handleDuplicateError";
// import { handlerValidationError } from "../helpers/handlerValidationError";
// import { handlerZodError } from "../helpers/handlerZodError";
// import { TErrorSources } from "../interfaces/error.types";
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // if (envVars.NODE_ENV === "development") {
    //   console.log(err);
    // }
    // console.log({ file: req.files });
    // if (req.file) {
    //   await deleteImageFromCLoudinary(req.file.path);
    // }
    // if (req.files && Array.isArray(req.files) && req.files.length) {
    //   const imageUrls = (req.files as Express.Multer.File[]).map(
    //     (file) => file.path
    //   );
    //   await Promise.all(imageUrls.map((url) => deleteImageFromCLoudinary(url)));
    // }
    let errorSources = [];
    let statusCode = 500;
    let message = "Something Went Wrong!!";
    // //Duplicate error
    // if (err.code === 11000) {
    //   const simplifiedError = handlerDuplicateError(err);
    //   statusCode = simplifiedError.statusCode;
    //   message = simplifiedError.message;
    // }
    // // Object ID error / Cast Error
    // else if (err.name === "CastError") {
    //   const simplifiedError = handleCastError(err);
    //   statusCode = simplifiedError.statusCode;
    //   message = simplifiedError.message;
    // } else if (err.name === "ZodError") {
    //   const simplifiedError = handlerZodError(err);
    //   statusCode = simplifiedError.statusCode;
    //   message = simplifiedError.message;
    //   errorSources = simplifiedError.errorSources as TErrorSources[];
    // }
    // //Mongoose Validation Error
    // else if (err.name === "ValidationError") {
    //   const simplifiedError = handlerValidationError(err);
    //   statusCode = simplifiedError.statusCode;
    //   errorSources = simplifiedError.errorSources as TErrorSources[];
    //   message = simplifiedError.message;
    // } else if (err instanceof AppError) {
    //   statusCode = err.statusCode;
    //   message = err.message;
    // } else if (err instanceof Error) {
    //   statusCode = 500;
    //   message = err.message;
    // }
    // res.status(statusCode).json({
    //   success: false,
    //   message: message,
    //   errorSources,
    //   err: envVars.NODE_ENV === "development" ? err : null,
    //   stack: envVars.NODE_ENV === "development" ? err.stack : null,
    // });
    res.status(statusCode).json({
        success: false,
        message: message,
        errorSources,
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null,
    });
});
exports.globalErrorHandler = globalErrorHandler;

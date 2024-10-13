import FileController from "controller/file.controller";
import express from "express";

const fileRouter = express.Router();

fileRouter.get("/:fileName", FileController.getFileHandler);

export default fileRouter;

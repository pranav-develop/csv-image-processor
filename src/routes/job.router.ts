import JobController from "controller/job.controller";
import express from "express";

const jobRouter = express.Router();

jobRouter.get("/status/:jobId", JobController.checkJobStatusHandler);

export default jobRouter;

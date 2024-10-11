import JobController from "controller/job.controller";
import express from "express";

const router = express.Router();

router.post("/create", JobController.createProcessingJobHandler);

router.get("/status/:jobId", JobController.checkJobStatusHandler);

export default router;

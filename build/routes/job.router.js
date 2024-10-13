"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const job_controller_1 = __importDefault(require("../controller/job.controller"));
const express_1 = __importDefault(require("express"));
const jobRouter = express_1.default.Router();
jobRouter.get("/status/:jobId", job_controller_1.default.checkJobStatusHandler);
exports.default = jobRouter;
//# sourceMappingURL=job.router.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const job_service_1 = __importDefault(require("../service/job.service"));
const errorhandler_1 = require("../utils/errorhandler");
const GeneralResponse_1 = require("../utils/GeneralResponse");
class JobController {
    static checkJobStatusHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check the processing status
                const jobId = req.params.jobId;
                const job = yield job_service_1.default.getJobById({ id: jobId });
                if (!job) {
                    throw new NotFoundError_1.default(`No job Found with id: ${jobId}`);
                }
                return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
                    data: {
                        id: job.id,
                        status: job.status,
                        errors: job.error,
                    },
                    hasError: false,
                    msg: "Job status fetched successfully",
                }));
            }
            catch (e) {
                console.error(e);
                return (0, errorhandler_1.sendErrorResponse)(res, e);
            }
        });
    }
}
exports.default = JobController;
//# sourceMappingURL=job.controller.js.map
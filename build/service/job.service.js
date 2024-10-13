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
const client_1 = require("@prisma/client");
const DBClient_1 = __importDefault(require("../config/DBClient"));
const processing_service_1 = __importDefault(require("./processing.service"));
const webhook_service_1 = __importDefault(require("./webhook.service"));
const path_1 = __importDefault(require("path"));
const csv_1 = __importDefault(require("../utils/csv"));
const file_service_1 = __importDefault(require("./file.service"));
class JobService {
    static createJobResultFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ job, products, }) {
            let resultFile = null;
            try {
                if (!job.requestFile)
                    return null;
                const csvData = yield csv_1.default.parseCSVFile({
                    filepath: `${path_1.default.join(job.requestFile.path, job.requestFile.id)}.${job.requestFile.extension}`,
                });
                const productsWithImages = yield DBClient_1.default.getInstance().product.findMany({
                    where: {
                        id: {
                            in: products.map((product) => product.id),
                        },
                    },
                    include: {
                        images: true,
                    },
                });
                const originalToProcessedImageMapping = productsWithImages.reduce((acc, curr) => {
                    curr.images.forEach((image) => {
                        acc[image.originalUrl] = image.url;
                    });
                    return acc;
                }, {});
                const updatedCsvResultData = {
                    headers: [...csvData.headers, "Output Image Urls"],
                    rows: csvData.rows.map((row) => {
                        const images = row["Input Image Urls"].split(",").map((url) => {
                            var _a;
                            return (_a = originalToProcessedImageMapping[url]) !== null && _a !== void 0 ? _a : url;
                        });
                        return Object.assign(Object.assign({}, row), { "Input Image Urls": `"${row["Input Image Urls"]}"`, "Output Image Urls": `"${images.join(",")}"` });
                    }),
                };
                resultFile = yield DBClient_1.default.getInstance().uploadedFile.create({
                    data: {
                        extension: "csv",
                        mimetype: "text/csv",
                        originalName: `${job.id}_result.csv`,
                        path: file_service_1.default.uploadsDirectoryPath(),
                        size: 0,
                    },
                });
                csv_1.default.createCSVFileFromJson({
                    data: updatedCsvResultData,
                    filename: resultFile.id,
                    path: resultFile.path,
                });
                return resultFile;
            }
            catch (e) {
                if (resultFile) {
                    yield DBClient_1.default.getInstance().uploadedFile.delete({
                        where: { id: resultFile.id },
                    });
                }
                return null;
            }
        });
    }
    static startJob(job, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                webhook_service_1.default.sendWebhookEvent({
                    data: {
                        jobId: job.id,
                        requestJobFile: {
                            id: job.requestFileId ? job.requestFileId : "",
                            url: job.requestFile
                                ? file_service_1.default.constructServableFilePath({ file: job.requestFile })
                                : "",
                        },
                    },
                    timestamp: Date.now(),
                    topic: "JOB_STARTED",
                });
                // Updating the job status to IN_PROGRESS
                yield DBClient_1.default.getInstance().job.update({
                    where: { id: job.id },
                    data: { status: client_1.JobStatus.IN_PROGRESS },
                });
                // Processing the job
                const processingResponses = yield Promise.all(data.products.map((product) => __awaiter(this, void 0, void 0, function* () {
                    const processingService = new processing_service_1.default();
                    return yield processingService.processProductImages({
                        productId: product.id,
                    });
                })));
                const errors = processingResponses.reduce((acc, curr) => {
                    if (curr.length > 0) {
                        acc.push(...curr);
                    }
                    return acc;
                }, []);
                if (errors.length > 0) {
                    throw new Error(errors.join(" | "));
                }
                // TODO: creating and saving the result file
                const resultFile = yield JobService.createJobResultFile({
                    job,
                    products: data.products,
                });
                // Updating the job status to COMPLETED
                yield DBClient_1.default.getInstance().job.update({
                    where: { id: job.id },
                    data: { status: client_1.JobStatus.COMPLETED, requestFileId: resultFile === null || resultFile === void 0 ? void 0 : resultFile.id },
                });
                // Calling the job completed callback
                webhook_service_1.default.sendWebhookEvent({
                    data: {
                        jobId: job.id,
                        status: "SUCCESS",
                        errors: [],
                        responseJobFile: {
                            id: resultFile ? resultFile.id : "",
                            url: resultFile
                                ? file_service_1.default.constructServableFilePath({ file: resultFile })
                                : "",
                        },
                    },
                    timestamp: Date.now(),
                    topic: "JOB_COMPLETED",
                });
            }
            catch (e) {
                console.log(e);
                // Saving the error status
                yield DBClient_1.default.getInstance().job.update({
                    where: { id: job.id },
                    data: {
                        status: client_1.JobStatus.FAILED,
                        error: {
                            message: e.message,
                            stack: e.stack,
                        },
                    },
                });
                webhook_service_1.default.sendWebhookEvent({
                    data: {
                        jobId: job.id,
                        status: "FAILED",
                        errors: e.message.split(" | "),
                        responseJobFile: null,
                    },
                    timestamp: Date.now(),
                    topic: "JOB_COMPLETED",
                });
            }
        });
    }
    static createJob(props) {
        return __awaiter(this, void 0, void 0, function* () {
            // Creating job of type ProductCSVUpload as there is only one type of job
            const job = yield DBClient_1.default.getInstance().job.create({
                data: {
                    requestFileId: props.data.file.id,
                    type: props.type,
                },
                include: {
                    requestFile: true,
                    resultFile: true,
                },
            });
            JobService.startJob(job, props.data);
            return job;
        });
    }
    static getJobById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id }) {
            return yield DBClient_1.default.getInstance().job.findUnique({
                where: { id },
            });
        });
    }
}
exports.default = JobService;
//# sourceMappingURL=job.service.js.map
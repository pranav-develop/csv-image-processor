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
const InvalidFileError_1 = __importDefault(require("../errors/InvalidFileError"));
const file_service_1 = __importDefault(require("../service/file.service"));
const job_service_1 = __importDefault(require("../service/job.service"));
const product_service_1 = __importDefault(require("../service/product.service"));
const JobTypes_1 = require("../types/JobTypes");
const errorhandler_1 = require("../utils/errorhandler");
const GeneralResponse_1 = require("../utils/GeneralResponse");
class ProductController {
    static uploadProductsCSVHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.datafile;
                if (!file || file.length) {
                    throw new InvalidFileError_1.default("Please upload a valid CSV file");
                }
                const uploadedFile = yield file_service_1.default.validateAndCreateFile({
                    file: file,
                    allowedMimeTypes: ["text/csv"],
                    maxSize: 1024 * 1024 * 2, // 2MB
                    validateFile: true,
                });
                const products = yield product_service_1.default.createProductFromCSV({
                    file: uploadedFile,
                });
                const job = yield job_service_1.default.createJob({
                    type: JobTypes_1.JobTypes.JobType.PRODUCTS_CSV,
                    data: {
                        file: uploadedFile,
                        products,
                    },
                });
                return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
                    data: {
                        jobId: job.id,
                    },
                    hasError: false,
                    msg: "CSV file is valid",
                }));
            }
            catch (err) {
                console.error(err);
                return (0, errorhandler_1.sendErrorResponse)(res, err);
            }
        });
    }
}
exports.default = ProductController;
//# sourceMappingURL=product.controller.js.map
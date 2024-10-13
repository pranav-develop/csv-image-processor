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
const DBClient_1 = __importDefault(require("../config/DBClient"));
const InvalidFileError_1 = __importDefault(require("../errors/InvalidFileError"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../utils/constants");
const filevalidator_service_1 = require("./filevalidator.service");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const env_1 = require("../env");
class FileService {
    static tempDirectoryPath() {
        return path_1.default.join(this.BASE_DIRECTORY, this.TEMP_DIR);
    }
    static uploadsDirectoryPath() {
        return path_1.default.join(this.BASE_DIRECTORY, this.UPLOADS_DIR);
    }
    static downloadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ url }) {
            const response = yield (0, node_fetch_1.default)(url);
            if (!response.ok) {
                throw new Error(`Failed to download file with url ${url}: ${response.statusText}`);
            }
            const buffer = yield response.arrayBuffer();
            const fileName = path_1.default.basename(url);
            const filePath = path_1.default.join(this.BASE_DIRECTORY, this.TEMP_DIR, fileName);
            fs_1.default.writeFileSync(filePath, Buffer.from(buffer));
            console.log("file written to disk");
            return filePath;
        });
    }
    static validateFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Saving file to temp disk to validate
            const fileExtension = file.mimetype.split("/")[1];
            const filePath = path_1.default.join(this.BASE_DIRECTORY, this.TEMP_DIR, (0, uuid_1.v4)());
            const fileLocation = `${filePath}.${fileExtension}`;
            yield file.mv(fileLocation);
            const validator = (0, filevalidator_service_1.getFileValidatorInstance)({
                mimeType: file.mimetype,
            });
            yield validator.validate({
                filepath: fileLocation,
                schema: [
                    {
                        header: "S. No.",
                        type: "number",
                        required: true,
                    },
                    {
                        header: "Product Name",
                        type: "string",
                        required: true,
                    },
                    {
                        header: "Input Image Urls",
                        type: "csv",
                        required: true,
                    },
                ],
            });
            // Deleting the file after validation
            // fs.unlinkSync(fileLocation);
            if (validator.errors.length > 0) {
                throw new InvalidFileError_1.default(validator.errors.join(" | "));
            }
        });
    }
    /**
     *
     * @param file Any file
     * @param maxSize Maximum file size in bytes
     * @param allowedMimeTypes Allowed mime types eg. ["image/png", "image/jpeg"]
     *
     * @returns UploadedFile object
     */
    static validateAndCreateFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, maxSize, allowedMimeTypes, validateFile, }) {
            let uploadedFile = null;
            try {
                // Validate file size
                if (maxSize && file.size > maxSize) {
                    throw new InvalidFileError_1.default("File size too large");
                }
                // Validate mime type
                if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
                    throw new InvalidFileError_1.default("Mime Type not allowed");
                }
                if (validateFile) {
                    yield FileService.validateFile(file);
                }
                const filePath = path_1.default.join(this.BASE_DIRECTORY, FileService.UPLOADS_DIR);
                // Storing file in the uploads directory
                uploadedFile = yield DBClient_1.default.getInstance().uploadedFile.create({
                    data: {
                        path: filePath,
                        size: file.size,
                        originalName: file.name,
                        extension: file.mimetype.split("/")[1],
                        mimetype: file.mimetype,
                    },
                });
                // Move file to the uploads directory
                yield file.mv(`${filePath}/${uploadedFile.id}.${file.mimetype.split("/")[1]}`);
                return uploadedFile;
            }
            catch (e) {
                // If file creation fails, delete the file from db and disk
                if (uploadedFile) {
                    yield DBClient_1.default.getInstance().uploadedFile.delete({
                        where: {
                            id: uploadedFile.id,
                        },
                    });
                }
                throw e;
            }
        });
    }
    static constructServableFilePath({ file }) {
        const filePath = path_1.default.join("assets", "files", `${file.id}.${file.extension}`);
        return `${env_1.WEBSITE_URL}/${filePath}`;
    }
}
FileService.BASE_DIRECTORY = path_1.default.join(constants_1.BASE_DIRECTORY, "src", "assets");
FileService.UPLOADS_DIR = "uploads";
FileService.TEMP_DIR = "temp";
exports.default = FileService;
//# sourceMappingURL=file.service.js.map
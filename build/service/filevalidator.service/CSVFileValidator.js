"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileValidator_1 = __importDefault(require("./FileValidator"));
const GeneralTypes_1 = require("../../types/GeneralTypes");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
class CSVFileValidator extends FileValidator_1.default {
    constructor() {
        super(...arguments);
        this.errors = [];
    }
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    validateString(value) {
        return typeof value === "string" && value.trim().length > 0;
    }
    validateNumber(value) {
        return !isNaN(Number(value));
    }
    validateCSV(value) {
        return value.split(",").length > 0;
    }
    validateField({ row, column, value, schema, }) {
        let isValid = false;
        switch (schema.type) {
            case "email":
                isValid = this.validateEmail(value);
                break;
            case "string":
                isValid = this.validateString(value);
                break;
            case "number":
                isValid = this.validateNumber(value);
                break;
            case "csv":
                isValid = this.validateCSV(value);
        }
        if (!isValid) {
            this.errors.push(`Invalid value for ${schema.header} at row ${row} and column ${column} expected ${schema.type}`);
        }
    }
    validate({ filepath, schema, }) {
        const expectedHeaders = schema.map((s) => s.header);
        return new Promise((resolve, reject) => {
            let rowCount = 0;
            fs_1.default.createReadStream(filepath)
                .pipe((0, csv_parser_1.default)())
                .on("headers", (headers) => {
                // Check if headers are as expected
                const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));
                if (missingHeaders.length > 0) {
                    this.errors.push(`Missing headers ${missingHeaders.join(",")}`);
                }
            })
                .on("data", (row) => {
                rowCount++;
                schema.forEach((s, index) => {
                    const value = row[s.header];
                    if (!value && s.required) {
                        this.errors.push(`Required field ${s.header} is missing at row ${rowCount}`);
                    }
                    if (value) {
                        this.validateField({
                            row: rowCount,
                            column: index + 1,
                            value,
                            schema: s,
                        });
                    }
                });
            })
                .on("end", () => {
                resolve();
            })
                .on("error", (err) => {
                this.errors.push(err.message);
                resolve();
            });
        });
    }
}
CSVFileValidator.mimeType = GeneralTypes_1.FILE_MIME_TYPE.CSV;
exports.default = CSVFileValidator;
//# sourceMappingURL=CSVFileValidator.js.map
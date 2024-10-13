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
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
class CSVUtils {
    static parseCSVFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filepath, }) {
            const headers = [];
            const results = [];
            return new Promise((resolve, reject) => {
                fs_1.default.createReadStream(filepath)
                    .pipe((0, csv_parser_1.default)())
                    .on("headers", (header) => {
                    headers.push(...header);
                })
                    .on("data", (data) => results.push(data))
                    .on("end", () => {
                    resolve({
                        headers: headers,
                        rows: results,
                    });
                })
                    .on("error", (error) => {
                    reject(error);
                });
            });
        });
    }
    static createCSVFileFromJson({ data, path, filename, }) {
        // create csv file from json
        const fileRows = [];
        fileRows.push(data.headers.join(","));
        data.rows.forEach((row) => {
            const values = data.headers.map((header) => row[header]);
            fileRows.push(values.join(","));
        });
        fs_1.default.writeFileSync(`${path}/${filename}.csv`, fileRows.join("\n"));
    }
}
exports.default = CSVUtils;
//# sourceMappingURL=csv.js.map
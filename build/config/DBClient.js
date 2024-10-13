"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class DBClient {
    static getInstance() {
        if (!this.instance) {
            this.instance = new client_1.PrismaClient();
        }
        return this.instance;
    }
}
exports.default = DBClient;
//# sourceMappingURL=DBClient.js.map
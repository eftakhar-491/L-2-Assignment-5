"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Welcome to the Home Page");
});
exports.HomeRoutes = router;

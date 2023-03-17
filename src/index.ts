import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as https from "https";
import * as fs from "fs";
import { app } from "./app";

dotenv.config();

if(process.env.EXECUTION === "development") {
    const port = process.env.PORT || 8000
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
} else {
    const options = {
        key: fs.readFileSync(process.env.CERT_FILE || "fake"),
        cert: fs.readFileSync(process.env.FULL_CHAIN || "fake")
    };

    https.createServer(options, app).listen(443, () => {
        console.log(`[server]: Production server is running at https://localhost`);
    });
}

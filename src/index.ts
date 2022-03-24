import Express from "express";
import { Parser } from "./parser";

const WELCOME_MESSAGE = `Welcome to demo of "There should be an API"! See https://github.com/JacobLinCool/There-should-be-an-API for more information.`;

const app = Express();

app.get("/", async (req, res) => {
    console.log("Request Received", req.query);
    if (!req.query?.url || typeof req.query.url !== "string") {
        res.status(400).json({ error: "?url= is required", WELCOME_MESSAGE });
        return;
    }

    try {
        new URL(req.query.url);
    } catch {
        res.status(400).json({ error: "Invalid url", WELCOME_MESSAGE });
        return;
    }

    const parser = new Parser();

    if (req.query.max && typeof req.query.max === "string" && parseInt(req.query.max)) {
        parser.filter_rules.max = parseInt(req.query.max);
    }
    if (req.query.min && typeof req.query.min === "string" && parseInt(req.query.min)) {
        parser.filter_rules.min = parseInt(req.query.min);
    }
    if (
        req.query.content_max &&
        typeof req.query.content_max === "string" &&
        parseInt(req.query.content_max)
    ) {
        parser.filter_rules.content_max = parseInt(req.query.content_max);
    }
    if (
        req.query.content_min &&
        typeof req.query.content_min === "string" &&
        parseInt(req.query.content_min)
    ) {
        parser.filter_rules.content_min = parseInt(req.query.content_min);
    }
    if (req.query.mode && typeof req.query.mode === "string") {
        parser.mode = req.query.mode === "full" ? "full" : "simple";
    }
    if (req.query.hash && typeof req.query.hash === "string") {
        parser.hash = ["true", "1", "yes", "y"].includes(req.query.hash.toLowerCase());
    }

    const time_start = Date.now();
    console.time(`Parsed Request "${req.query.url}"`);
    const result = await parser.parse(req.query.url);
    console.timeEnd(`Parsed Request "${req.query.url}"`);
    const time_used = Date.now() - time_start;

    res.header("X-Parse-Time", time_used.toString()).json(result);
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
    console.log("http://localhost:3000/");
});

import { program } from "commander";
import { Parser } from "./parser";

program
    .argument("url", "url to parse")
    .option("-v, --verbose", "verbose mode", false)
    .option("-m, --mode <mode>", "mode (simple|full)", "simple")
    .option("-f, --filter <min:max>", "filter rule element (min:max)", "5:-1")
    .option("-c, --content <min:max>", "filter rule content (min:max)", "5:-1")
    .action(async (url: string) => {
        const opts = program.opts();
        const parser = new Parser();
        parser.verbose = opts.verbose;
        parser.mode = opts.mode.trim();
        const [min, max] = opts.filter
            .split(":")
            .map((v: string) => (v === "-1" ? Infinity : parseInt(v)));
        parser.filter_rules.min = min;
        parser.filter_rules.max = max;
        const [min_c, max_c] = opts.content
            .split(":")
            .map((v: string) => (v === "-1" ? Infinity : parseInt(v)));
        parser.filter_rules.content_min = min_c;
        parser.filter_rules.content_max = max_c;
        const result = await parser.parse(url);
        console.log(result);
    });

program.parse();

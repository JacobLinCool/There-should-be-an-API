import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export class Parser {
    public travel_rules = { check_class: true };
    public filter_rules = { min: 5, max: Infinity, content_min: 5, content_max: Infinity };
    public mode: "simple" | "full" = "simple";
    public hash = true;
    public preprocess = (raw: string): string => raw.trim();
    public verbose = false;

    public async parse(url: string): Promise<Record<string, unknown[]>> {
        this.verbose && console.time(`Fetch ${url}`);
        const res = await fetch(url);
        this.verbose && console.timeEnd(`Fetch ${url}`);

        this.verbose && console.time("Load DOM");
        const html = await res.text();
        const dom = new JSDOM(html);
        const { document } = dom.window;
        this.verbose && console.timeEnd("Load DOM");

        this.verbose && console.time("Indexing");
        const elements: Record<string, Element[]> = {};
        this.travel(document.body, "", elements);
        this.verbose && console.timeEnd("Indexing");

        this.verbose && console.time("Filtering");
        const filtered = this.filter(elements);
        this.verbose && console.timeEnd("Filtering");

        this.verbose &&
            console.log(
                `Analyzed ${Object.values(elements).reduce(
                    (acc, cur) => acc + cur.length,
                    0,
                )} elements`,
            );
        this.verbose &&
            console.log(
                `Selected ${Object.keys(filtered).length} group${
                    Object.keys(filtered).length > 1 ? "s" : ""
                }.`,
            );
        for (const [key, value] of Object.entries(filtered)) {
            this.verbose && console.log(`  - ${key} (${value.length})`);
        }

        this.verbose && console.time("Constructing");
        const result: Record<string, unknown[]> = {};
        for (const [key, value] of Object.entries(filtered)) {
            const k = this.hash ? createHash("md5").update(key).digest("hex").substring(0, 7) : key;
            const v = value
                .map((elm) => {
                    if (this.mode === "simple") {
                        return this.extract_simple(elm);
                    } else {
                        return this.extract_full(elm);
                    }
                })
                .filter((item) =>
                    typeof item === "object"
                        ? Object.keys(item).length > 0
                        : item.length >= this.filter_rules.min &&
                          item.length <= this.filter_rules.max,
                );
            if (v.length > 0) {
                result[k] = v;
            }
        }
        this.verbose && console.timeEnd("Constructing");

        return result;
    }

    private travel(element: Element, parent: string, elements: Record<string, Element[]>): void {
        const key = `${parent ? parent + ">" : ""}${element.tagName.toLowerCase()}${
            this.travel_rules.check_class &&
            typeof element.className === "string" &&
            element.className.length > 0
                ? `.${element.className.split(" ").sort().join(".")}`
                : ""
        }`;
        if (key in elements) {
            elements[key].push(element);
        } else {
            elements[key] = [element];
        }

        for (let i = 0; i < element.children.length; i++) {
            this.travel(element.children[i], key, elements);
        }
    }

    private filter(elements: Record<string, Element[]>): Record<string, Element[]> {
        const set = new Set<string>();
        const result = Object.entries(elements)
            .sort(
                (a, b) =>
                    b[1].length - a[1].length ||
                    (a[0].match(/>/)?.length ?? 0) - (b[0].match(/>/)?.length ?? 0),
            )
            .reduce((acc, cur) => {
                acc[cur[0]] = cur[1];
                return acc;
            }, {} as Record<string, Element[]>);

        for (const [key, value] of Object.entries(result)) {
            if (value.length < this.filter_rules.min || value.length > this.filter_rules.max) {
                delete result[key];
                continue;
            }
            let parent = key;
            while (parent.match(/>/)) {
                if (set.has(parent.replace(/>.*$/, ""))) {
                    delete result[parent];
                    break;
                }
                parent = parent.replace(/>.*$/, "");
            }
            set.add(key);
        }

        return result;
    }

    private extract_simple(element: Element): string {
        switch (element.tagName.toLowerCase()) {
            case "a":
                return this.preprocess((element as HTMLAnchorElement).href);
            case "img":
                return this.preprocess((element as HTMLImageElement).src);
            case "script":
                return this.preprocess((element as HTMLScriptElement).src);
            case "link":
                return this.preprocess((element as HTMLLinkElement).href);
            default:
                return this.preprocess(element.textContent || "");
        }
    }

    private extract_full(element: Element): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(element.attributes)) {
            const str = this.preprocess(value.toString());
            if (
                str.length < this.filter_rules.content_min ||
                str.length > this.filter_rules.content_max
            ) {
                continue;
            }

            if (typeof value === "string") {
                result[key] = str;
            } else {
                result[key] = value;
            }
        }
        if (
            (element.textContent?.length ?? 0) >= this.filter_rules.content_min &&
            (element.textContent?.length ?? 0) <= this.filter_rules.content_max
        ) {
            result.textContent = element.textContent;
        }

        return result;
    }
}

export default Parser;

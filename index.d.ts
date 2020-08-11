interface Options {
    inputDir: string;
    outputDir: string;
    files: {
        [key: string]: {
            extends: Array<string>;
            output: string;
        }
    }
}

declare function generate(options: Options, baseDir?: string): Promise<void>;

export = generate;
/**
 * @summary Unit test file for e2e detection
 * @author Vojtěch Randýsek, xrandy00@vutbr.cz
 *
 * Created at     : 2022-05-06 21:36:42
 * Last modified  : 2022-08-02 14:58:00
 */

const sut = require("../src/finder");
const run = require("../src/run");

test("Unsafe defaults in `remark-html`", () => {
    const input = `
        /**
         * @typedef {import('mdast').Root} Root
         * @typedef {import('hast-util-sanitize').Schema} Schema
         * @typedef {import('mdast-util-to-hast').Handlers} Handlers
         *
         * @typedef Options
         *   Configuration.
         * @property {boolean|Schema|null} [sanitize]
         *   How to sanitize the output.
         * @property {Handlers} [handlers={}]
         *   Object mapping mdast nodes to functions handling them.
         */

        import { toHtml } from 'hast-util-to-html';
        import { sanitize } from 'hast-util-sanitize';
        import { toHast } from 'mdast-util-to-hast';

        /**
         * Plugin to serialize markdown as HTML.
         *
         * @type {import('unified').Plugin<[Options?]|void[], Root, string>}
         */
        export default function remarkHtml(options = {}) {
            const handlers = options.handlers || {};
            const schema = options.sanitize && typeof options.sanitize === 'object'
                ? options.sanitize
                : undefined;

            Object.assign(this, { Compiler: compiler });

            /**
             * @type {import('unified').CompilerFunction<Root, string>}
             */
            function compiler(node, file) {
                const hast = toHast(node, { allowDangerousHtml: !options.sanitize, handlers });
                // @ts-expect-error: assume root.
                const cleanHast = options.sanitize ? sanitize(hast, schema) : hast;
                const result = toHtml(
                    // @ts-expect-error: assume root.
                    cleanHast,
                    Object.assign({}, options, { allowDangerousHtml: !options.sanitize })
                );

                if (file.extname) {
                    file.extname = '.html';
                }

                // Add an eof eol.
                return node && node.type && node.type === 'root' && result && /[^\r\n]/.test(result.charAt(result.length - 1))
                    ? result + '\n'
                    : result;
            }
        }
    `;

    const result = sut.findMatches(input, run.vulnerabilities, run.patches, run.meta);
    expect(result.foundVulnerabilities[0].title).toBe("Unsafe defaults in remark-html");
});

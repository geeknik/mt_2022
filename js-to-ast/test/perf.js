/**
 * @summary Unit test file for functionality related to normalisation of AST
 * @author Vojtěch Randýsek, xrandy00@vutbr.cz
 *
 * Created at     : 2022-05-06 21:37:21
 * Last modified  : 2024-08-02 15:02:00
 */

const sut = require("../src/finder");

/**
 * Stringifies an AST and removes unnecessary properties.
 * @param {Object} ast - The AST to stringify.
 * @returns {string} - The stringified AST without unnecessary properties.
 */
function stringifyAndClean(ast) {
    return JSON.stringify(ast, (k, v) => (k === 'start' || k === 'end' || k === 'sourceType') ? undefined : v);
}

test("String quotes normalisation", () => {
    const input1 = `console.log("Hello World!");`;
    const input2 = `console.log('Hello World!');`;

    const parsed1 = sut.tryParse(input1);
    const parsed2 = sut.tryParse(input2);

    expect(parsed2).toStrictEqual(parsed1);
});

test("Variable declaration merging", () => {
    const input1 = `
        let a;
        let b;
        let c = 1;
        let g;
        const d = 2;
        const e = 3;
        let f = 2;
    `;

    const input2 = `let a,b,c=1,g;const d=2,e=3;let f=2;`;

    const parsed1 = sut.tryParse(input1);
    const parsed2 = sut.tryParse(input2);

    const stringified1 = stringifyAndClean(parsed1);
    const stringified2 = stringifyAndClean(parsed2);

    expect(stringified1).toBe(stringified2);
});

test("Variable declaration test", () => {
    const input1 = `
        var a  = "hello";
        var b  = 'world';
    `;

    const input2 = `
        var a="hello",b="world";
    `;

    const parsed1 = sut.tryParse(input1);
    const parsed2 = sut.tryParse(input2);

    const stringified1 = stringifyAndClean(parsed1);
    const stringified2 = stringifyAndClean(parsed2);

    expect(stringified1).toBe(stringified2);
});

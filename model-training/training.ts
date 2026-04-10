import * as fs from 'fs';
import * as readline from 'readline';

const numerator: number[][] = Array.from({ length: 10 }, () =>
    Array(10).fill(0)
);
const denominator: number[] = Array(10).fill(0);

const ASCII_a = 97;

async function trainModel(file: string) {
    const data = fs.createReadStream(file);

    const rl = readline.createInterface({
        input: data,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const tokens = line.split(",");
        let isFirstToken = true;
        let prevIndex = 0;

        for (const token of tokens) {
            const index = token.charCodeAt(0) - ASCII_a;
            if (isFirstToken) {
                prevIndex = index;
                isFirstToken = false;
                continue;
            }
            numerator[prevIndex][index] += 1;
            denominator[prevIndex] += 1;
            prevIndex = index;
        }
    }
}

(async () => {
    console.log("OLD NUMERATOR", numerator);
    console.log("OLD DENOMINATOR", denominator);

    await trainModel('training.csv');

    console.log("UPDATED NUMERATOR", numerator);
    console.log("UPDATED DENOMINATOR", denominator);

    const output = { numerator, denominator };
    fs.writeFileSync('model.json', JSON.stringify(output, null, 2));
    console.log("Model saved to model.json");
})();
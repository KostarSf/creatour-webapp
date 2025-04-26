import sharp from "sharp";

function hammingDistance(a: string | Buffer, b: string | Buffer) {
	const binA = hexToBinary(a);
	const binB = hexToBinary(b);

	if (binA.length !== binB.length) {
		throw new Error(`Argument must have equal lengths. (provided ${binA.length} and ${binB.length})`);
	}

	return countDifferences(binA, binB);
}

function countDifferences(a: string, b: string): number {
	let count = 0;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			count++;
		}
	}

	return count;
}

function hexToBinary(s: string | Buffer): string {
	const hexStr = (Buffer.isBuffer(s) ? s.toString("hex") : s).replace(/^0x/, "");

	if (!/^[0-9a-fA-F]+$/.test(hexStr)) {
		throw new Error("Argument should be buffer or hex string");
	}

	let ret = "";
	for (let i = 0; i < hexStr.length; i++) {
		ret += lookup[hexStr[i] as HexSymbol];
	}

	return ret;
}

const lookup = {
	"0": "0000",
	"1": "0001",
	"2": "0010",
	"3": "0011",
	"4": "0100",
	"5": "0101",
	"6": "0110",
	"7": "0111",
	"8": "1000",
	"9": "1001",
	a: "1010",
	A: "1010",
	b: "1011",
	B: "1011",
	c: "1100",
	C: "1100",
	d: "1101",
	D: "1101",
	e: "1110",
	E: "1110",
	f: "1111",
	F: "1111",
} as const;

type HexSymbol = keyof typeof lookup;

async function dHash(buffer: Buffer | Uint8Array): Promise<string> {
	const resized = await sharp(buffer).resize(9, 8, { fit: "fill" }).greyscale().raw().toBuffer();

	let hash = "";
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const left = resized[i * 9 + j];
			const right = resized[i * 9 + j + 1];
			hash += left > right ? "1" : "0";
		}
	}
	return hash;
}

export { hammingDistance, dHash };

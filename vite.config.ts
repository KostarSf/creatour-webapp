import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

const ReactCompilerConfig = {
	target: "19",
};

export default defineConfig({
	optimizeDeps: {
		exclude: [".prisma/client"],
	},
	plugins: [
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		babel({
			include: ["./app/**/*"],
			filter: /\.[jt]sx?$/,
			babelConfig: {
				presets: ["@babel/preset-typescript"],
				plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
			},
		}),
	],
});

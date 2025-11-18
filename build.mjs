import esbuild from "esbuild";

await esbuild.build({
	entryPoints: [
		'admin/client/App/index.js',
		'admin/client/Signin/index.js',
	],
	loader: {'.js': 'jsx'},
	minify: false,
	sourcemap: 'linked',
	bundle: true,
	outdir: 'admin/public/js/',
});

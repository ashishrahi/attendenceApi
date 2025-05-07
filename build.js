const esbuild = require("esbuild");
const copyStaticFiles = require("esbuild-copy-static-files");

esbuild
  .build({
    entryPoints: ["src/server.js"],
    bundle: true,
    platform: "node",
    outfile: "dist/bundle.js",
    plugins: [
      copyStaticFiles({
        src: "./src/swagger-output.json", // Source file
        dest: "./dist/swagger-output.json", // Destination directory
      }),
    ],
  })
  .then(() => console.log("Build complete"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

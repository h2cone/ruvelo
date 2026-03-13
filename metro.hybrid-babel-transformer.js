const crypto = require("node:crypto");
const path = require("node:path");

const { transformSync, version: swcVersion } = require("@swc/core");
const expoBabelTransformer = require("@expo/metro-config/build/babel-transformer");
const projectRoot = process.cwd();

const SWC_CACHE_KEY = crypto
  .createHash("sha1")
  .update(JSON.stringify({
    swcVersion,
    target: "esnext",
    extensions: [".ts", ".tsx", ".mts", ".cts"],
    disableEnv: "RUVELO_DISABLE_SWC_PREPASS",
    scope: "project-root-only",
  }))
  .digest("hex");

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function isTypeScriptModule(filename) {
  return [".ts", ".tsx", ".mts", ".cts"].includes(path.extname(filename).toLowerCase());
}

function isNodeModule(filename) {
  return normalizePath(filename).includes("/node_modules/");
}

function isProjectFile(filename) {
  const normalizedFilename = normalizePath(filename);
  const normalizedProjectRoot = normalizePath(projectRoot);

  return normalizedFilename.startsWith(`${normalizedProjectRoot}/`);
}

function shouldUseSwc(filename) {
  if (process.env.RUVELO_DISABLE_SWC_PREPASS === "1") {
    return false;
  }

  return isProjectFile(filename) && isTypeScriptModule(filename) && !isNodeModule(filename);
}

function createSwcOptions(filename, options) {
  const extension = path.extname(filename).toLowerCase();
  const isTsx = extension === ".tsx";

  return {
    filename,
    inlineSourcesContent: false,
    isModule: options.type === "script" ? false : "unknown",
    jsc: {
      keepClassNames: true,
      parser: {
        syntax: "typescript",
        tsx: isTsx,
      },
      preserveAllComments: true,
      target: "esnext",
      transform: isTsx
        ? {
            react: {
              runtime: "preserve",
            },
          }
        : undefined,
    },
    sourceMaps: false,
  };
}

function logSwcFallback(filename, error) {
  if (process.env.EXPO_DEBUG !== "true") {
    return;
  }

  console.warn(
    `[metro-swc] Falling back to Expo Babel for ${path.relative(process.cwd(), filename)}: ${error.message}`,
  );
}

function preprocessWithSwc(src, filename, options) {
  return transformSync(src, createSwcOptions(filename, options)).code;
}

function transform(input) {
  if (!shouldUseSwc(input.filename)) {
    return expoBabelTransformer.transform(input);
  }

  let src = input.src;

  try {
    src = preprocessWithSwc(input.src, input.filename, input.options);
  } catch (error) {
    logSwcFallback(input.filename, error);
  }

  return expoBabelTransformer.transform({
    ...input,
    src,
  });
}

function getCacheKey() {
  return SWC_CACHE_KEY;
}

module.exports = {
  ...expoBabelTransformer,
  getCacheKey,
  transform,
};

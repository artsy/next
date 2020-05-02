const path = require("path");
const findUp = require("find-up");

const getFilename = (state) => state.file.opts.filename;

const setDefaultPluginState = (state) => {
  state.defaultLayoutPlugin = {
    defaultExportName: null,
    errorModuleName: null,
  };
};

const getPluginState = (state) => state.defaultLayoutPlugin;

const isLayoutFile = (state) => {
  const filename = getFilename(state);
  return path.basename(filename) === "_layout.tsx";
};

const shouldProcessFile = (state) => {
  const filename = getFilename(state);
  if (
    filename.includes("node_modules") ||
    path.extname(filename) !== ".tsx" ||
    path.basename(filename).startsWith("_") ||
    !filename.includes("/pages/")
  ) {
    return false;
  }
  return true;
};

const prependCodeToFile = (parse, program, state, code) => {
  program.unshiftContainer(
    "body",
    parse(code, {
      filename: getFilename(state),
      sourceType: "module",
      presets: ["next/babel"],
    }).program.body[0]
  );
};

const appendCodeToFile = (parse, program, state, code) => {
  program.pushContainer(
    "body",
    parse(code, {
      filename: getFilename(state),
      sourceType: "module",
      presets: ["next/babel"],
    }).program.body[0]
  );
};

const addLayoutToFile = (parse, program, state) => {
  const { defaultExportName } = getPluginState(state);
  const filePath = getFilename(state);
  const layout = findUp.sync(
    (directory) => {
      const layoutFilePath = path.join(directory, "_layout.tsx");
      if (findUp.exists(layoutFilePath)) {
        return layoutFilePath;
      }
      if (
        path.basename(directory) === "pages" &&
        directory.match(/\/pages/g).length === 1
      ) {
        return findUp.stop;
      }
    },
    {
      cwd: path.dirname(filePath),
      type: "file",
    }
  );
  if (layout) {
    appendCodeToFile(
      parse,
      program,
      state,
      `${defaultExportName}.Layout = require("${layout}").Layout`
    );
  }
};

module.exports = function ({ types: t, parse }) {
  return {
    name: "next-default-layout",
    visitor: {
      ImportDeclaration(importDeclaration, state) {
        if (!isLayoutFile(state)) return;
        if (importDeclaration.node.source.value === "next/error") {
          importDeclaration.traverse({
            ImportDefaultSpecifier(p) {
              getPluginState(state).errorModuleName = p.node.local.name;
            },
          });
        }
        return;
      },
      ExportDefaultDeclaration(defaultExport, state) {
        if (!shouldProcessFile(state)) return;
        defaultExport.traverse({
          Identifier(p) {
            getPluginState(state).defaultExportName = p.node.name;
            p.stop();
          },
        });
      },
      Program: {
        enter(_, state) {
          setDefaultPluginState(state);
        },
        exit(program, state) {
          if (isLayoutFile(state)) {
            const errorName = getPluginState(state).errorModuleName;
            if (errorName) {
              appendCodeToFile(
                parse,
                program,
                state,
                `export default () => <${errorName} statusCode={404} />`
              );
            } else {
              prependCodeToFile(
                parse,
                program,
                state,
                `import Error from "next/error"`
              );
              appendCodeToFile(
                parse,
                program,
                state,
                `export default () => <Error statusCode={404}/>`
              );
            }
            return;
          }
          if (
            !shouldProcessFile(state) ||
            !getPluginState(state).defaultExportName
          )
            return;

          let getLayoutIsAlreadyDefined = false;

          // See if `getLayout` is assigned to the default export
          program.traverse({
            AssignmentExpression(path) {
              if (
                t.isMemberExpression(path.node.left) &&
                path.node.left.property.name === "Layout"
              ) {
                getLayoutIsAlreadyDefined = true;
                path.stop();
              }
            },
          });

          if (!getLayoutIsAlreadyDefined) {
            addLayoutToFile(parse, program, state);
          }
        },
      },
    },
  };
};

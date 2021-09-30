import { IQuestions } from "./questions";
import fs from "fs";
import path from "path";
import url from "url";
import { exec } from "child_process";

const createFolder = (dir: string, projectName: string): string => {
  const fullDir = path.join(dir, projectName);
  try {
    fs.mkdirSync(fullDir);
  } catch (err) {
    throw err;
  }
  return fullDir;
};

const scaffoldFile = (
  fileDir: string,
  newFileDir: string,
  replaced?: string,
  replacing?: string
) => {
  try {
    let file = fs.readFileSync(fileDir, { encoding: "utf8" });
    if (replaced && replacing) file = file.replace(replaced, replacing);
    fs.writeFileSync(newFileDir, file);
  } catch (err) {
    throw err;
  }
};

export const scaffold = function (cwd: string, questions: IQuestions) {
  try {
    const projectDir = createFolder(cwd, questions.projectName.answer);

    const templateDir =
      path.dirname(url.fileURLToPath(import.meta.url)) + "/../template";

    const inProjectDir = (filename: string) => path.join(projectDir, filename);
    const inTemplateDir = (filename: string) =>
      path.join(templateDir, filename);

    scaffoldFile(
      inTemplateDir("Makefile"),
      inProjectDir("Makefile"),
      "NAME=program",
      `NAME=${questions.outputName.answer}`
    );
    if (questions.gitIgnore.answer.toLowerCase() == "yes") {
      exec(`git init ${questions.projectName.answer}`);
      scaffoldFile(
        inTemplateDir("/gitignore"),
        inProjectDir("/.gitignore"),
        "program",
        `${questions.outputName.answer}`
      );
    }
    createFolder(projectDir, "src");
    scaffoldFile(
      inTemplateDir("src/main.c"),
      inProjectDir(`src/${questions.entryPoint.answer}`),
      '#include "../include/program.h"',
      `#include "../include/${questions.outputName.answer}.h"`
    );
    createFolder(projectDir, "include");
    scaffoldFile(
      inTemplateDir("include/program.h"),
      inProjectDir(`include/${questions.outputName.answer}.h`)
    );
    if (questions.debugConfig.answer.toLowerCase() == "yes") {
      createFolder(projectDir, ".vscode");
      scaffoldFile(
        inTemplateDir(".vscode/launch.json"),
        inProjectDir(`.vscode/launch.json`),
        '"program": "${workspaceFolder}/program",',
        `"program": "\${workspaceFolder}/${questions.outputName.answer}",`
      );
      scaffoldFile(
        inTemplateDir(".vscode/tasks.json"),
        inProjectDir(".vscode/tasks.json")
      );
    }
  } catch (err) {
    throw err;
  }
};

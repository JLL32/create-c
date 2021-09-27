#!/usr/bin/env node

import readline from "readline";
import util from "util";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import url from "url";

class Question {
  constructor(public question: string, public defaultVal: string) {}
}

interface IQuestions {
  projectName: Question;
  entryPoint: Question;
  outputName: Question;
  debugConfig: Question;
  gitIgnore: Question;
}

const questions: IQuestions = {
  projectName: new Question("Project name (c-project): ", "c-project"),
  entryPoint: new Question("Entry point (main.c): ", "main.c"),
  outputName: new Question("Output name (program): ", "program"),
  debugConfig: new Question("Debugging configuration? (yes): ", "yes"),
  gitIgnore: new Question(".gitignore? (yes): ", "yes"),
};

const collectAnswers = async function (
  questions: Question[],
  readlineInterface: readline.Interface
) {
  const qWrapper = (
    question: string,
    cb: (err: Error | null, data: string) => void
  ) => {
    readlineInterface.question(question, (answer) => cb(null, answer));
  };
  const ask = util.promisify(qWrapper);
  for (const question of questions) {
    const answer = await ask(question.question);
    if (answer.length > 0) question.defaultVal = answer;
  }
  readlineInterface.close();
};

const scaffold = function (cwd: string, questions: IQuestions) {
  const createFolder = (dir: string, projectName: string): string | Error => {
    const fullDir = path.join(dir, projectName);
    try {
      fs.mkdirSync(fullDir);
    } catch (err) {
      return err as Error;
    }
    return fullDir;
  };

  const scaffoldFile = (
    fileDir: string,
    newFileDir: string,
    replaced?: string,
    replacing?: string
  ) => {
    let file = fs.readFileSync(fileDir, { encoding: "utf8" });
    if (replaced && replacing) file = file.replace(replaced, replacing);
    fs.writeFileSync(newFileDir, file);
  };

  const projectDir = createFolder(
    cwd,
    questions.projectName.defaultVal
  );
  if (projectDir instanceof Error) {
    console.log(projectDir.message);
    return;
  }

  const templateDir =
    path.dirname(url.fileURLToPath(import.meta.url)) + "/../template";

  const inProjectDir = (filename: string) =>
    path.join(projectDir, filename);
  const inTemplateDir = (filename: string) =>
    path.join(templateDir, filename);

  scaffoldFile(
    inTemplateDir("Makefile"),
    inProjectDir("Makefile"),
    "NAME=program",
    `NAME=${questions.outputName.defaultVal}`
  );
  if (questions.gitIgnore.defaultVal.toLowerCase() == "yes") {
    exec(`git init ${questions.projectName.defaultVal}`);
    scaffoldFile(
      inTemplateDir("/gitignore"),
      inProjectDir("/.gitignore"),
      "program",
      `${questions.outputName.defaultVal}`
    );
  }
  createFolder(projectDir, "src");
  scaffoldFile(
    inTemplateDir("src/main.c"),
    inProjectDir(`src/${questions.entryPoint.defaultVal}`),
    '#include "../include/program.h"',
    `#include "../include/${questions.outputName.defaultVal}.h"`
  );
  createFolder(projectDir, "include");
  scaffoldFile(
    inTemplateDir("include/program.h"),
    inProjectDir(`include/${questions.outputName.defaultVal}.h`)
  );
  if (questions.debugConfig.defaultVal.toLowerCase() == "yes") {
    createFolder(projectDir, ".vscode");
    scaffoldFile(
      inTemplateDir(".vscode/launch.json"),
      inProjectDir(`.vscode/launch.json`),
      '"program": "${workspaceFolder}/program",',
      `"program": "\${workspaceFolder}/${questions.outputName.defaultVal}",`
    );
    scaffoldFile(
      inTemplateDir(".vscode/tasks.json"),
      inProjectDir(".vscode/tasks.json")
    );
  }
};

const main = async function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  await collectAnswers(Object.values(questions), rl);
  console.log("Scaffolding your project 🪄");
  scaffold(process.cwd(), questions);
  console.log("Done 🎉");
};

await main();

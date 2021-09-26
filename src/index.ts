#!/usr/bin/env node

import readline from "readline";
import util from 'util';
import fs from 'fs';
import path from 'path';
import { exec } from "child_process";
import url from 'url';

class Question {
  constructor(public question: string, public defaultVal: string | boolean) { }
}

interface IQuestions {
  projectName: Question;
  entryPoint: Question;
  outputName: Question;
  debugConfig: Question;
  gitIgnore: Question;
}

const questions: IQuestions = {
  projectName: new Question("project name (c-project): ", "c-project"),
  entryPoint: new Question("entry point (main.c): ", "main.c"),
  outputName: new Question("output name (program): ", "program"),
  debugConfig: new Question("Include debug config? (yes): ", true),
  gitIgnore: new Question("Include .gitignore C template? (yes): ", true),
};

const collectAnswers = async function (questions: Question[], readlineInterface: readline.Interface) {
  const qWrapper = (question: string, cb: (err: Error | null, data: string) => void) => {
    readlineInterface.question(question, answer => cb(null, answer));
  }
  const ask = util.promisify(qWrapper);
  for (const question of questions) {
    const answer = await ask(question.question);
    if (answer.length > 0)
      question.defaultVal = answer;
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

  const scaffoldFile = (fileDir: string, newFileDir: string, replaced?: string, replacing?: string) => {
    let file = fs.readFileSync(fileDir, { encoding: 'utf8' });
    if (replaced && replacing)
      file = file.replace(replaced, replacing);
    fs.writeFileSync(newFileDir, file);
  }

  const projectDir = createFolder(cwd, questions.projectName.defaultVal as string);
  if (projectDir instanceof Error) {
    console.log(projectDir.message);
    return;
  }
  const templateDir = path.dirname(url.fileURLToPath(import.meta.url)) + '/../template';
  scaffoldFile(path.join(templateDir, '/Makefile'), path.join(projectDir, '/Makefile'), 'NAME=program', `NAME=${questions.outputName.defaultVal}`);
  if (questions.gitIgnore.defaultVal) {
    exec(`git init ${projectDir}`);
    scaffoldFile(path.join(templateDir, '/.gitignore'), path.join(projectDir, '/.gitignore'), 'program', `${questions.outputName.defaultVal}`);
  }
  createFolder(projectDir, 'src');
  scaffoldFile(path.join(templateDir, '/src/main.c'), path.join(projectDir, `/src/${questions.entryPoint.defaultVal}`), '#include "../include/program.h"', `#include "../include/${questions.outputName.defaultVal}.h"`);
  createFolder(projectDir, 'include');
  scaffoldFile(path.join(templateDir, '/include/program.h'), path.join(projectDir, `/include/${questions.outputName.defaultVal}.h`));
  if (questions.debugConfig.defaultVal) {
    createFolder(projectDir, '.vscode');
    scaffoldFile(path.join(templateDir, '/.vscode/launch.json'), path.join(projectDir, `/.vscode/launch.json`), '"program": "${workspaceFolder}/program",', `"program": "\${workspaceFolder}/${questions.outputName.defaultVal}",`);
  }
}

const main = async function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  await collectAnswers(Object.values(questions), rl);
  console.log("Scaffolding your project...");
  scaffold(process.cwd(), questions);
  console.log(process.cwd())
};

await main();

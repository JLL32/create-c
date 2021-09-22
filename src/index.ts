#!/usr/bin/env node

import readline from "readline";
import util from 'util';

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
  outputName: new Question("output name (a.out): ", "a.out"),
  debugConfig: new Question("Include debug config? (yes): ", false),
  gitIgnore: new Question("Include .gitignore C template? (yes): ", false),
};

const collectAnswers = async function (questions: Question[], readlineInterface: readline.Interface) {
  const qWrapper = (question: string, cb: (err: Error | null, data: string) => void) => {
    readlineInterface.question(question, answer => cb(null, answer));
  }
  const ask = util.promisify(qWrapper);
  for (const question of questions) {
    const answer = await ask(question.question);
    question.defaultVal = answer;
  }
  readlineInterface.close();
};

const main = async function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  await collectAnswers(Object.values(questions), rl);
  console.log("Scaffolding your project...");
};

await main();

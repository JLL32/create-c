#!/usr/bin/env node

import readline from "readline";
import util from "util";
import { IQuestions, Question } from "./questions.js";
import { scaffold } from "./scaffold.js";

export const questions: IQuestions = {
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
    if (answer.length > 0) question.answer = answer;
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
  console.log("Scaffolding your project 🪄");
  scaffold(process.cwd(), questions);
  console.log("Done 🎉");
};

await main();

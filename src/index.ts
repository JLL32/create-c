#!/usr/bin/env node

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

class Question {
  constructor(public question: string, public defaultVal: string | boolean) {}
}

const questions = {
  projectName: new Question("project name (c-project): ", "c-project"),
  entryPoint: new Question("entry point (main.c): ", "main.c"),
  outputName: new Question("output name (a.out): ", "a.out"),
  debugConfig: new Question("include debug config? (yes): ", false),
};

rl.question(questions.projectName.question, (answer) => {
  questions.projectName.defaultVal = answer;
  rl.question(questions.entryPoint.question, (answer) => {
    questions.entryPoint.defaultVal = answer;
    rl.question(questions.outputName.question, (answer) => {
      questions.outputName.defaultVal = answer;
      rl.question(questions.debugConfig.question, (answer) => {
        questions.debugConfig.defaultVal = answer;
        console.log(questions);
        rl.close();
      });
    });
  });
});

rl.on("close", () => console.log("Scaffolding your project..."));

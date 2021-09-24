#!/usr/bin/env node

import readline from "readline";
import util from 'util';
import fs from 'fs';
import path from 'path';

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
  outputName: new Question("output name (program): ", "a.out"),
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

const scaffold = function (dir: string, questions: IQuestions) {
	const createProjectFolder = (dir: string, projectName: string): string | Error => {
		const fullName = path.join(dir, projectName);
		try {
			if(!fs.existsSync(fullName)) {
				fs.mkdirSync(fullName);
			}
		} catch (err) {
			if (err instanceof Error) {
				return err;
			}
		}
		return fullName;
	};
	const err = createProjectFolder(dir, questions.projectName.defaultVal.toString());
	if (err instanceof Error) {
		console.log(err.message);
	}
	const writeMakefile = (outputName: string) => {

	};
	const writeGitIgnore = (outputName: string) => {

	};
	const writeEntryPoint = (entryPointName: string) => {

	};
	const writeHeaderFile = (outputName: string) => {

	};
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

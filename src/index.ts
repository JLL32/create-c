#!/usr/bin/env node

import readline from "readline";
import util from 'util';
import fs from 'fs/promises';
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
	if (answer.length > 0)
		question.defaultVal = answer;
  }
  readlineInterface.close();
};

const scaffold = async function (dir: string, questions: IQuestions) {
	const createProjectFolder = async (dir: string, projectName: string): Promise<string | Error> => {
		const fullName = path.join(dir, projectName);
		try {
			await fs.mkdir(fullName);
		} catch (err) {
			if (err instanceof Error) {
				return err;
			}
		}
		return fullName;
	};


	const writeMakefile = async (dir: string, outputName: string) => {
		const file = await fs.readFile(path.resolve('../template/Makefile'), {encoding: 'utf8'});
		const pathToNewMakefile = path.join(dir + 'Makefile');
		file.toString().replace('program', outputName);
		await fs.writeFile(pathToNewMakefile, file);
	};
	const writeGitIgnore = (outputName: string) => {

	};
	const writeEntryPoint = (entryPointName: string) => {

	};
	const writeHeaderFile = (outputName: string) => {

	};

	const projectName = await createProjectFolder(dir, questions.projectName.defaultVal.toString());
	if (projectName instanceof Error) {
		console.log(projectName.message);
		return;
	}
	await writeMakefile(path.join(dir, projectName as string), questions.outputName.defaultVal as string);
}

const main = async function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  await collectAnswers(Object.values(questions), rl);
  console.log("Scaffolding your project...");
  await scaffold(process.cwd(), questions);
  console.log(process.cwd())
};

await main();

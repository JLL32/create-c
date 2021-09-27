export class Question {
  constructor(public question: string, public answer: string) {}
}

export interface IQuestions {
  projectName: Question;
  entryPoint: Question;
  outputName: Question;
  debugConfig: Question;
  gitIgnore: Question;
}

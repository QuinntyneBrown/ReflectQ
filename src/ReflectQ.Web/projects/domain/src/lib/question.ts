import { QuestionOption } from './question-option';
import { QuestionStatus } from './question-status';
import { QuestionType } from './question-type';

export interface Question {
  id: string;
  title: string;
  body: string | null;
  type: QuestionType;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

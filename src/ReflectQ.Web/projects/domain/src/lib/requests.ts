import { QuestionType } from './question-type';
import { UserRole } from './user-role';

export interface CreateQuestionRequest {
  title: string;
  body?: string;
  type: QuestionType;
  options?: CreateQuestionOptionRequest[];
}

export interface CreateQuestionOptionRequest {
  text: string;
  sortOrder: number;
}

export interface UpdateQuestionRequest {
  title?: string;
  body?: string;
  type?: QuestionType;
  options?: UpdateQuestionOptionRequest[];
}

export interface UpdateQuestionOptionRequest {
  id?: string;
  text: string;
  sortOrder: number;
}

export interface SubmitResponseRequest {
  questionId: string;
  value: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
}

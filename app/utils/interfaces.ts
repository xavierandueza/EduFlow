export interface Skill {
  subject: string;
  curriculum_point: string;
  skill: string;
  skill_description: string;
  key_ideas: string[];
  key_idea_summaries: string[];
  easy_questions: string[];
  mdrt_questions: string[];
  hard_questions: string[];
  content: string;
  dependencies: string[];
  // ... any other properties
}

export interface SchoolClassSkill {
  id: string;
  subject: string;
  curriculumPoint: string;
  skill: string;
  skillID: string;
  skillDescription: string;
  keyIdeas: string[];
  keyIdeasSummary: string[];
  content: string;
  questions: string[];
  dependencies: string[];
  schoolClassID: string;
  schoolClass: string;
  decayValue: number;
  // ... any other properties
}

export interface Student {
  first_name: string;
  last_name: string;
  email_address: string;
  interests: string[];
  subjects: string[];
  school_classes: string[];
}

export interface FirestoreStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  interests: string[];
  subjects: string[];
  schoolClassesLong: string[];
  schoolClassesShort: string[];
}

export interface StudentSkill {
  _id: string;
  email_address: string;
  subject: string;
  school_class_name: string;
  skill: string;
  mastery_score: number;
  retention_score: number;
  need_to_revise: boolean;
  dependencies_met: boolean;
  decay_value: number;
  // ... any other properties
}

export interface FirestoreStudentSkill {
  id: string;
  studentID: string;
  email: string;
  firstName: string;
  lastName: string;
  subject: string;
  schoolClass: string;
  schoolClassID: string;
  skill: string;
  skillID: string;
  masteryScore: number;
  retentionScore: number;
  needToRevise: boolean;
  areDependenciesMet: boolean;
  decayValue: number;
  // ... any other properties
}

export interface Teacher {
  _id: string;
  email_address: string;
  first_name: string;
  last_name: string;
  school_classes: string[];
}

export interface FirestoreTeacherSchoolClass {
  id: string;
  name: string;
  subject: string;
}

export interface FirestoreTeacher {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolClasses: FirestoreTeacherSchoolClass[];
}

export interface SchoolClass {
  _id: string;
  school_class_name: string;
  subject: string;
}

export interface FirestoreSchoolClass {
  name: string;
  subject: string;
  students: {
    firstName: string;
    lastName: string;
    id: string;
  }[];
  teachers: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  }[];
}

export interface MetricScores {
  mastery_score: number;
  retention_score: number;
}

export interface SkillAggregate {
  skill: string;
  school_class_name: string;
  mastery_score: number;
  retention_score: number;
  no_students_not_met_mastery: number;
  no_students_not_met_dependencies: number;
  no_students_to_revise: number;
}

export interface FirestoreSkillAggregate {
  skill: string;
  schoolClass: string;
  masteryScore: number;
  retentionScore: number;
  noStudentsNotMetMastery: number;
  noStudentsNotMetDependencies: number;
  noStudentsToRevise: number;
}

export interface ExtendedSkillAggregate extends SkillAggregate {
  include_in_class_lesson_plan: boolean;
}

export interface FirestoreExtendedSkillAggregate extends FirestoreSkillAggregate {
  includeInLessonPlan: boolean;
}

export interface StudentAggregate {
  full_name: string;
  email_address: string;
  school_class_name: string;
  mastery_score: number;
  retention_score: number;
  skills_to_revise: number;
}

export interface FirestoreStudentAggregate {
  fullName: string;
  email: string;
  schoolClass: string;
  masteryScore: number;
  retentionScore: number;
  skillsToRevise: number;
}

export interface RouteRequestBody {
  messages?: any;
  llm: string;
  lastChatAction: ChatAction;
  studentSkill: FirestoreStudentSkill;
  relevantMessagesStartIndex?: number;
  onQuestionLoopCounter?: number;
  onFeedbackLoopCounter?: number;
  myChatAction?: ChatAction;
  sessionSkillAggregates?: FirestoreExtendedSkillAggregate[];
  questionTracker?: number[];
}

export type ChatAction =
  | "clarifyingQuestion"
  | "gradingValidAnswer"
  | "gradingInvalidAnswer"
  | "providingExtraFeedback"
  | "askingQuestion"
  | "unknownResponse"
  | "creatingLessonPlan";

//For testing purposes
export interface StudentResponseRequestBody {
  body: {
    relevantChatMessage: string;
    studentResponse: string;
    lastAction: ChatAction;
  };
}

// start with easiest question and then get harder over time
export type QuestionType =
  | "trueOrFalseTrue" // 0-25
  | "trueOrFalseFalse" // 0-25
  | "provideADefinition" // 0-75
  | "multipleChoiceSingleTrue" // 25-50
  | "multipleChoiceSingleFalse" // 25-50
  | "multipleChoiceMultipleTrue" // 50-75
  | "multipleChoiceMultipleFalse" // 50-75
  | "shortAnswer" // 50-100
  | "longAnswer"; // 75-100

export const questionTypes: QuestionType[] = [
  "trueOrFalseTrue", // 0-25
  "provideADefinition", // 0-25
  "trueOrFalseFalse", // 0-75
  "multipleChoiceSingleTrue", // 25-50
  "multipleChoiceSingleFalse", // 25-50
  "multipleChoiceMultipleTrue", // 50-75
  "multipleChoiceMultipleFalse", // 50-75
  "shortAnswer", // 50-100
  "longAnswer",
]; // 75-100

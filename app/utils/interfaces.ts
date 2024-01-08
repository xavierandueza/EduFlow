import { Session } from "next-auth";

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

interface FirestoreStandardUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string | null;
}

export interface FireStoreExtendedUser extends FirestoreStandardUser {
  name: string;
  role: Role;
  stripeCustomerId: string;
  subscriptionActive: boolean | null;
  subscriptionName: string | null;
  emailVerified?: boolean | null;
}

export interface FirestoreStudent extends FirestoreStandardUser {
  interests?: string[] | string;
  careerGoals?: string[] | string;
  subjects?: string[];
  parentLink?: string[] | string;
  schoolClassesLong?: string[];
  schoolClassesShort?: string[];
}

export interface FirestoreParentChildLong extends FirestoreStudent {
  subscriptionActive?: boolean;
  subscriptionName?: string | null;
}

export interface FirestoreParent extends FirestoreStandardUser {
  childrenShort?: string[];
  childrenLong?: {
    [id: string]: FirestoreParentChildLong;
  } | null;
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

export interface FirestoreSkillAggregate {
  skill: string;
  schoolClass: string;
  masteryScore: number;
  retentionScore: number;
  noStudentsNotMetMastery: number;
  noStudentsNotMetDependencies: number;
  noStudentsToRevise: number;
}

export interface FirestoreExtendedSkillAggregate
  extends FirestoreSkillAggregate {
  includeInLessonPlan: boolean;
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

export type Role = "student" | "teacher" | "parent" | "unknown";

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

export interface SubscriptionPlan {
  planName: string;
  planPrice: number;
  planDescription: string;
  majorPoints: { [key: string]: boolean };
  priceId: string;
  studentId: string | null;
  session: Session;
}

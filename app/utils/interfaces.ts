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
  
 export interface Student {
  first_name: string;
  last_name: string;
  email_address: string;
  interests: string[];
  subjects: string[];
  school_classes: string[];
}
  
export interface StudentSkill {
  _id : string;
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

export interface Teacher {
  _id : string;
  email_address: string;
  first_name: string;
  last_name: string;
  school_classes: string[];
}

export interface SchoolClass {
  _id : string;
  school_class_name: string;
  subject: string;
}

export interface MetricScores {
  mastery_score: number;
  retention_score: number;
};

export interface SkillAggregate {
  skill : string,
  school_class_name : string,
  mastery_score : number,
  retention_score : number,
  no_students_not_met_dependencies : number
  no_students_to_revise : number,
}

export interface StudentAggregate {
  full_name : string,
  email_address : string,
  school_class_name : string,
  mastery_score : number,
  retention_score : number,
  skills_to_revise : number,
}

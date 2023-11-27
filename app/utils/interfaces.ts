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
  email_address: string;
  interests: string[];
  subjects: string[];
}
  
export interface StudentSkill {
  _id: string;
  email_address: string;
  subject: string;
  skill: string;
  mastery_score: number;
  retention_score: number;
  need_to_revise: boolean;
  decay_value: number;
  // ... any other properties
}

export interface MetricScores {
  mastery_score: number;
  retention_score: number;
};


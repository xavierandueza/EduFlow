#List of tools to pass to the chatgpt function call api. Json Formating was done by chatgpt
tools = [
    {
        "type": "function",
        "function": {
            "name": "generate_question",
            "description": "Generates a question for an Australian highschool student to answer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "key_idea": {
                        "type": "string",
                        "description": "The concept(s) on which the generated question should be about."
                    },
                    "key_idea_description": {
                        "type": "string",
                        "description": "The further description of the key idea."
                    },
                    "theory": {
                        "type": "string",
                        "description": "Additional theory related to the key idea."
                    },
                    "student_year_level": {
                        "type": "integer",
                        "description": "The year level of the student."
                    },
                    "subject": {
                        "type": "string",
                        "description": "The subject of the question."
                    },
                    "question_difficulty": {
                        "type": "string",
                        "description": "The difficulty level of the question."
                    },
                    "question_examples": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Examples of questions that are about the same key idea and at a similar difficulty."
                    },
                    "other_system_instructions": {
                        "type": "string",
                        "description": "Other instructions for the system."
                    },
                    "student_interests": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "A list of the student's interests."
                    },
                    "student_career_goals": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "A list of the student's career goals."
                    },
                    "model": {
                        "type": "string",
                        "description": "The model used to generate the question."
                    }
                },
                "required": ["key_idea", "key_idea_description", "theory", "student_year_level", "subject", "question_difficulty"]
            }
        }
    },

]
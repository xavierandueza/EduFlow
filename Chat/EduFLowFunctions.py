import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["EDUFLOW_OPENAI_API_KEY"])


#define generic completion general function for easy of use and clean code
def generate_completion(system_prompt, initial_user_prompt, model="gpt-3.5-turbo-1106", max_tokens = None, temperature = 1):
    """
    Generates a completion for a given prompt.

    Parameters:
    system_prompt (str): The prompt which instructs the agent on how to behave and what to generate.
    initial_user_prompt (str): The initial prompt which the agent will respond to.
    model (str, optional): The model used to generate the completion. Defaults to "gpt-3.5-turbo-1106".
    max_tokens (int, optional): The maximum number of tokens to generate. Defaults to "null".
    temperature (float, optional): The temperature of the completion. Defaults to 0.7.

    Returns:
    chat.completion object: Chat completion response returned by model.
    """

    messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content":initial_user_prompt}
    ]

    return client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens = max_tokens,
        temperature = temperature
    )


#question which generates content for a student to learn about a key idea
def generate_question(key_idea,
                      key_idea_description,
                      theory,
                      student_year_level,
                      subject,
                      question_difficulty,
                      question_examples = [],
                      other_system_instructions = "",
                      student_interests = [],
                      student_career_goals = []):
    
    
    
    """
    Generates a question for a student based on various inputs.

    Parameters:
    key_idea (str): The concept(s) on which the generated question should be about.
    key_idea_description (str): The further description of the key idea.
    theory (str): Additional theory related to the key idea.
    student_year_level (int): The year level of the student.
    subject (str): The subject of the question is based on.
    question_difficulty (str): The difficulty level of the question.
    question_examples (str): Examples questions that are about the same key idea and at a similar difficulty.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    student_interests (list, optional): A list of the student's interests. Defaults to [].
    student_career_goals (list, optional): A list of the student's career goals. Defaults to [].
    model (str, optional): The model used to generate the question. Defaults to "gpt-3.5-turbo-1106".

    Returns:
    str: The question for the student to answer.
    """


    #System prompt for instructing gpt on how to respond
    system_prompt = f"""As an AI tailored for educational support, your task is to craft a question suitable for a high school student, incorporating these key elements:

    - Central Concept - Develop a question that thoroughly explores this idea: {key_idea}.
    - Detailed Explanation of the Key Idea - Ensure the question aligns with these complexities and nuances: {key_idea_description}.
    - Relevant Theory - Integrate aspects of this theory to challenge and assess the student's understanding: {theory}.
    - Student Year Level - Create a question appropriate for this academic level, balancing complexity: {student_year_level}.
    - Subject Area - Ensure the question pertains to and enriches understanding in this field: {subject}.
    - Difficulty Level - The question's complexity should be tailored to this setting: {question_difficulty}.

    Where applicable, embed the student's interests or career goals into the question to enhance engagement. If these elements don't directly align with the academic content, focus on the educational aspect.

    - Student Interests - Consider these to make the question more engaging: {student_interests}.
    - Student Career Goals - Incorporate these where relevant: {student_career_goals}.

    Directly pose the question without prefacing it as a 'question', ensuring it adheres to the specified difficulty level and educational goals.

    Additional Instructions: {other_system_instructions}.
    """


    #initial user prompt
    initial_user_prompt =f"""Formulate a question that is academically suitable for a student at the '{student_year_level}' level. The question should match the specified difficulty of '{question_difficulty}' and be informed by the following example questions:

    Example Questions: {question_examples}
    """



    return generate_completion(system_prompt, initial_user_prompt, temperature=0.5)



#Generates an answer to the Model's own question. This is for accuracy purposes
def answer_question(question,
                    key_idea,
                    key_idea_description,
                    student_year_level,
                    theory,
                    other_system_instructions = "",
                    model = "gpt-3.5-turbo-1106"):
    
    
    """
    Generates an answer for a given question one would see in a highschool textbook or exam.

    Parameters:
    question (str): The question to be answered.
    key_idea (str): The main concept the question is assessing.
    key_idea_description (str): The description of the key idea.
    answer_year_level (str): The level of the student answering the question.
    subject (str): The subject of the question the question is based on.
    theory (str): The theory related to the question.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to generate the answer. Defaults to "gpt-4".

    Returns:
    str: The generated answer.
    """

    # Sytem prompt for instructing gpt on how to behave
    system_prompt = f"""As an AI designed to assist in educational contexts, your task is to provide an accurate and comprehensive answer to a high school level question. You should base your answer on the following detailed information:

    - Key Idea: {key_idea}. This is the primary concept that the question is exploring.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your answer fully encompasses the nuances of the key idea.
    - Relevant Theory: {theory}. Your answer should incorporate and demonstrate an understanding of this theory, as it relates to the key idea.
    - Student Year Level: {student_year_level}. Tailor the sophistication and depth of your answer to be appropriate for a student at this academic level.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.

    Your response should directly address the question, formulated in a clear and concise manner, suitable for the specified student year level. Avoid prefacing your response with 'Answer:' or similar qualifiers. Instead, provide a straightforward explanation or solution that demonstrates a comprehensive understanding of the topic.
    
    Consider the depth of your response, ensuring that it is appropriate for the student's year level. Your answer should be sufficiently detailed to provide a comprehensive explanation, but not so detailed that it that it would be unusual for a student at a {student_year_level} academic level to provide so much depth. Your answer should be accurate and relevant to the question, avoiding unnecessary or irrelevant information."""

    
    #initial user prompt
    initial_user_prompt = f"Please provide a concise answer to this question, considering the student's academic level: {question}"

    #generatre answer
    generated_answer = generate_completion(system_prompt, initial_user_prompt, temperature=0.9)

    return generated_answer


#Check the answer of the generated response to ensure it has not hallucinated
def check_generated_answer_hallucination(question,
                                        generated_answer,
                                        theory,
                                        key_idea,
                                        key_idea_description,
                                        other_system_instructions = "",
                                        model="gpt-3.5-turbo-1106"):
    
    
    """
    Marks an answer for a given question and provides a justification, formatted as JSON. Does not use solution as a reference but instead relys off provided theory only.

    Parameters:
    question (str): The question to which the answer is provided.
    student answer (str): The answer to the question.
    solution (str): The solution to the question.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to mark the answer. Defaults to "gpt-4".
    """
    

    #system prompt for instructing gpt on how to behave
    system_prompt = f"""As an AI evaluator, your task is to review an AI-generated answer for hallucinations (inaccuracies or fabrications).
    
    - Key Idea: {key_idea}. Assess the AI-generated answer for any inaccuracies or fabrications related to this concept.
    - Relevant Theory: {theory}. Look for any inaccuracies or fabrications related to this theory.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your evaluation fully encompasses the nuances of the key idea.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.
    - Review Focus: Check the AI-generated answer for any hallucinations, inaccuracies, or misrepresentations of facts or concepts.
    - Alignment with Question: Verify that the answer directly and adequately addresses the question posed, relevant to the student's curriculum.

    If hallucinations are found, return a JSON object that includes the flag "hallucinations" set to true. If no hallucinations are found, return a JSON object that includes the flag "hallucinations" set to false. The JSON object should have the fromat:

    JSON Format for Output:
    {{
        "hallucinations": "true/false"
    }}

    Additional System Instructions: {other_system_instructions}"""


    #initial user prompt    
    initial_user_prompt = f"""Evaluate the following AI-generated answer. Check for any inaccuracies or hallucinations in the following answer. to the question, and return a JSON object with the result:

    Question: {question}
    AI-Generated Answer: {generated_answer}

    Provide feedback on the answer's accuracy and appropriateness for the specified academic level."""


    hallucination_check = generated_answer = generate_completion(system_prompt, initial_user_prompt, temperature=0.2)

    return hallucination_check

#define a function which marks an answer and provides a mark out of 100 and a justification for the mark without specifically providing feedback. Uses solution as as reference.
def mark_student_answer_wtih_sol(question,
                                student_answer,
                                student_year_level,
                                theory,
                                key_idea,
                                solution = None,
                                other_system_instructions = "",
                                model="gpt-3.5-turbo-1106"):
    
    """
    Marks an answer for a given question and provides a justification, formatted as JSON.

    Parameters:
    question (str): The question to which the answer is provided.
    student answer (str): The answer to the question.
    solution (str): The solution to the question.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to mark the answer. Defaults to "gpt-4".

    Returns:
    str: The marked answer and justification, formatted as JSON.
    """
    # system prompt for instructing gpt
    
    system_prompt = f"""You are an AI evaluator tasked with scoring a high school student's answer and identifying errors, with the output formatted as a JSON object. Your evaluation should reference the provided solution for accuracy, but keep in mind the student's academic level.

    - Key Idea: {key_idea}. Assess the student's understanding compared to the AI solution.
    - Relevant Theory: {theory}. Look for key differences in the student's understanding of this theory.
    - Provided Solution: Use this as a benchmark for accuracy, not depth.
    - Student Year Level: {student_year_level}. Evaluate the student's answer for correctness appropriate to their level, not for depth matching the AI solution.
    - Here are some other relevant instructions: {other_system_instructions}. 

    Your task is to create a JSON object that includes a score out of 100 and a breakdown of the student's mistakes or misconceptions. Do not reveal the correct answer in your feedback. Focus on explaining the errors in relation to the key idea and theory, considering the student's academic level.

    JSON Format for Output:
    {{
        "score": "your_score_here",
        "errors": [
            {"error": "specific_error_or_misconception", "explanation": "why_this_is_incorrect"}
        ]
    }}

    Additional System Instructions: {other_system_instructions}"""


    initial_user_prompt = f"""Provide a score and a breakdown of errors in the student's response, formatted as a JSON object. Compare the student's answer to the AI solution, focusing on accuracy appropriate for their academic level:

    Question: {question}

    Student Answer: {student_answer}
    
    AI-Provided Solution: {solution}

    Generate a JSON object with the score and detailed error analysis, keeping in mind the student's year level and without revealing the correct answer."""


    #generate mark with justification
    student_mark = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_prompt},
        ],
        temperature = 0.7
    )

    return student_mark



#function which generates a mark for a student answer and provides feedback. does NOT use solution as a reference.

def mark_student_answer_without_sol(question,
                                answer,
                                student_year_level,
                                theory,
                                key_idea,
                                key_idea_description,
                                other_system_instructions = "",
                                model="gpt-3.5-turbo-1106"):
    """
    Marks an answer for a given question and provides a justification, formatted as JSON. Does not use solution as a reference but instead relys off provided theory only.

    Parameters:
    question (str): The question to which the answer is provided.
    student answer (str): The answer to the question.
    solution (str): The solution to the question.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to mark the answer. Defaults to "gpt-4".

    Returns:
    str: The marked answer and justification, formatted as JSON.
    """
    
    #system prompt for instructing gpt
    system_prompt = f"""You are an AI evaluator tasked with assessing a high school student's answer. Your evaluation should focus on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level. The output should be formatted as a JSON object.

    - Key Idea: {key_idea}. Evaluate the student's understanding and expression of this concept.
    - Relevant Theory: {theory}. Assess how well the student's answer reflects an understanding of this theory.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your evaluation fully encompasses the nuances of the key idea.
    - Student Year Level: {student_year_level}. The evaluation should consider the academic level of the student, focusing on their grasp of the concept rather than the depth of the response.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.

    Create a JSON object that includes a score out of 100 and identifies specific areas of misunderstanding or errors in the student's response. Your feedback should highlight these areas without providing direct solutions, and explain why they are incorrect or incomplete, in a manner suitable for the student's educational level.

    JSON Format for Output:
    {{
        "score": "your_score_here",
        "errors": [
            {"error": "specific_error_or_misconception", "explanation": "why_this_is_incorrect"}
            // Add more error objects as needed
        ]
    }}

    Additional System Instructions: {other_system_instructions}"""


    #initial user prompt
    initial_user_prompt = f"""Score the student's response and identify any errors or misconceptions, formatted as a JSON object. Focus on the accuracy and understanding of the key idea and relevant theory, considering the student's academic level:

    Question: {question}
    Student Answer: {answer}

    Construct a JSON object with a score and detailed error analysis, ensuring that the feedback is appropriate for the student's year level and does not provide direct solutions."""

    student_mark = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_prompt},
        ],
        temperature = 0.7
    )

    return student_mark

#Use grade of the student on task a well as the feedback provided in mark_student_answer_with_sol and mark_student_answer_without_sol to determine what the next step should be. Correct, incorrect (not 3rd attempt) or incorrect (3rd attempt).





def provide_feedback(question,
                    student_answer,
                    solution,
                    student_year_level,
                    theory,
                    key_idea,
                    key_idea_description,
                    other_system_instructions = "",
                    model="gpt-3.5-turbo-1106"):
    """
    Provides feedback to a student based on their answer to a question.

    Parameters:
    question (str): The question to which the answer is provided.
    student answer (str): The answer to the question.
    solution (str): The solution to the question.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to mark the answer. Defaults to "gpt-4".

    Returns:
    str: The feedback to the student.
    """
    #system prompt for instructing gpt
    system_prompt = f"""You are an AI evaluator tasked with providing feedback to a high school student. Your feedback should focus on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level.

    - Key Idea: {key_idea}. Assess the student's understanding and expression of this concept.
    - Relevant Theory: {theory}. Evaluate how well the student's answer reflects an understanding of this theory.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your feedback fully encompasses the nuances of the key idea.
    - Student Year Level: {student_year_level}. The feedback should consider the academic level of the student, focusing on their grasp of the concept rather than the depth of the response.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.

    Your task is to provide feedback to the student, formatted as a JSON object. Your feedback should highlight any errors or misconceptions without providing direct solutions, and explain why they are incorrect or incomplete, in a manner suitable for the student's educational level."""


    #initial user prompt
    initial_user_prompt = f"""Provide feedback to the student, formatted as
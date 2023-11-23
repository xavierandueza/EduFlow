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
                      student_career_goals = [],
                      model="gpt-3.5-turbo-1106"):
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
    str: system prompt.
    """

    # Put together the things in a decent system instruction
    system_prompt = f"""You are a helpful AI agent that creates questions for students. You are creating a question for a student who is learning about a key idea.
    They key idea is: {key_idea}.
    Here is the extended description of the key idea: {key_idea_description}. 
    Here is the theory that is taught in the class to this student, from which the question should be based on: {theory}.
    Where possible, attempt to cater the question to the student's interests OR their career goals. If the interests or career goals are not immediately relevant, then you can ignore them.
    List of Student's interests: {student_interests}.
    List of Student's career goals: {student_career_goals}.
    Do not state that this is a question, for example do not state "Question: ...". Simply ask the question.
    Here are some other relevant instructions: {other_system_instructions}.
    """

    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Create a question for the student to answer. The question should be {question_difficulty}. Your question should be at a difficulty of {question_difficulty}. Here is a list of example questions with included answers, which you can losely base your question off: {question_examples}"},
        ]
    )


#Generates an answer to the Model's own question

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

    # Put together the things in a decent system instruction
    system_prompt = f"""As an AI designed to assist in educational contexts, your task is to provide an accurate and comprehensive answer to a high school level question. You should base your answer on the following detailed information:

    - Key Idea: {key_idea}. This is the primary concept that the question is exploring.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your answer fully encompasses the nuances of the key idea.
    - Relevant Theory: {theory}. Your answer should incorporate and demonstrate an understanding of this theory, as it relates to the key idea.
    - Student Year Level: {student_year_level}. Tailor the sophistication and depth of your answer to be appropriate for a student at this academic level.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.

    Your response should directly address the question, formulated in a clear and concise manner, suitable for the specified student year level. Avoid prefacing your response with 'Answer:' or similar qualifiers. Instead, provide a straightforward explanation or solution that demonstrates a comprehensive understanding of the topic.
    
    Consider the depth of your response, ensuring that it is appropriate for the student's year level. Your answer should be sufficiently detailed to provide a comprehensive explanation, but not so detailed that it that it would be unusual for a student at a {student_year_level} academic level to provide so much depth. Your answer should be accurate and relevant to the question, avoiding unnecessary or irrelevant information."""


    initial_user_prompt = f"Please provide a concise answer to this question, considering the student's academic level: {question}"

    generated_answer = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_prompt},
        ],
        temperature = 0.9
    )

    return generated_answer


#define a function which marks an answer and provides a mark out of 100 and a justification for the mark without specifically providing feedback

def mark_student_answer(question,
                        answer,
                        solution,
                        student_year
                        theory,
                        key_idea,
                        key_idea_description,
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
    # Put together the things in a decent system instruction
    system_prompt = f"""As an AI evaluator specialized in educational assessment, your task is to provide feedback on a high school student's answer. Keep in mind the student's year level and the developmental appropriateness of their response.

    - Key Idea: {key_idea}. Assess how effectively the student has grasped and communicated this concept.
    - Relevant Theory: {theory}. Evaluate the accuracy and depth of the student's understanding of this theory in their response.
    - Detailed Description of Key Idea: {key_idea_description}. Use this as a benchmark for the expected depth and accuracy.
    - Student Year Level: {student_year_level}. It's important to recognize that a response may not fully match the depth of the provided solution and still be commendable for the student's academic level.

    Format your evaluation in a JSON object, including both a score out of 100 and constructive, supportive feedback. Be mindful to balance your critique; acknowledge the strengths of the answer and provide clear, encouraging advice on areas for improvement. Your feedback should be educative, fostering growth and understanding, particularly considering the student's academic year.

    JSON Format:
    {{
        "score": "your_score_here",
        "feedback": "your_feedback_here"
    }}

    Additional System Instructions: {other_system_instructions}"""

    initial_user_prompt = f"""Evaluate the following student's response. Consider their understanding of the key idea, the relevance of their answer to the theory, and the appropriateness of their response for their academic level:

    Question: {question}
    Student Answer: {answer}

    Provide a score and detailed feedback in the specified JSON format, focusing on constructive and developmental guidance."""


    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_prompt},
        ],
        temperature = 0.7
    )
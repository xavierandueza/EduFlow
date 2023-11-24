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

    Returns:
    str: The question for the student to answer.
    """


    #System prompt for instructing gpt on how to respond
    system_prompt = f"""As an AI tailored for educational support, your task is to craft a question suitable for an Australian highschool student, incorporating these key elements:

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
    Generates an answer for a given question one would see in an Australian highschool textbook or exam.

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
    system_prompt = f"""As an AI designed to assist in educational contexts, your task is to provide an accurate answer to an Australian highschool level question to a depth that would be exepected from a student in {student_year_level}. You should base your answer on the following detailed information:

    - Key Idea: {key_idea}. This is the primary concept that the question is exploring.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your answer fully encompasses the nuances of the key idea.
    - Relevant Theory: {theory}. Your answer should incorporate and demonstrate an understanding of this theory, as it relates to the key idea.
    - Student Year Level: {student_year_level}. Tailor the sophistication and depth of your answer to be appropriate for a student at this academic level.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.

    Your response should directly address the question, formulated in a clear and concise manner, suitable for the specified student year level. Avoid prefacing your response with 'Answer:' or similar qualifiers. Instead, provide a straightforward explanation or solution that demonstrates a comprehensive understanding of the topic.
    
    Consider the depth of your response, ensuring that it is appropriate for the student's year level. Your answer should be sufficiently detailed to provide a comprehensive explanation, but not so detailed that it that it would be unusual for a student at a {student_year_level} academic level to provide so much depth. Your answer should be accurate and relevant to the question, avoiding unnecessary or irrelevant information."""

    
    #initial user prompt
    initial_user_prompt = f"Please provide a concise answer to this question, considering the student's academic level: {question}"

    return generate_completion(system_prompt, initial_user_prompt, temperature=0.9)


#Check the answer of the generated response to ensure it has not hallucinated
def check_generated_answer_hallucination(question,
                                        generated_answer,
                                        theory,
                                        key_idea,
                                        key_idea_description,
                                        student_year_level,
                                        other_system_instructions = ""):
    
    
    """
    Marks an answer for a given question and provides a justification, formatted as JSON. Does not use solution as a reference but instead relys off provided theory only.

    Parameters:
    question (str): The question to which the answer is provided.
    student answer (str): The answer to the question.
    solution (str): The solution to the question.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea.
    student_year_level (int): The academic level of the student.
    other_system_instructions (str, optional): Other instructions for the system. Defaults to "".
    model (str, optional): The model used to mark the answer. Defaults to "gpt-4".
    """
    

    #system prompt for instructing gpt on how to behave
    system_prompt = f"""As an AI evaluator, your task is to review an AI-generated answer for hallucinations (inaccuracies or fabrications) inaccuracies, or misrepresentations of facts or concepts. You are also tasked with making sure the answer provided by the AI aligns with what the standard to be expected from an Australian {student_year_level} student and is not overly sophisticated. Verify that the answer directly and adequately addresses the question posed, relevant to the student's curriculum.

    If hallucinations are found, return a JSON object that includes the flag "hallucinations" set to true. If no hallucinations are found, return a JSON object that includes the flag "hallucinations" set to false. The JSON object should have the fromat:

    JSON Format for Output:
    {{
        "hallucinations": "true/false"
    }}

    Additional System Instructions: {other_system_instructions}"""


    #initial user prompt    
    initial_user_prompt = f"""Evaluate the following AI-generated answer. Provide feedback on the answer's accuracy and appropriateness for the specified academic level. You should base your evaluation on the following detailed information: 
    
    - Key Idea: {key_idea}. Assess the AI-generated answer for any inaccuracies or fabrications related to this concept.
    - Relevant Theory: {theory}. Look for any inaccuracies or fabrications related to this theory.
    - Detailed Description of Key Idea: {key_idea_description}. Use this information to ensure that your evaluation fully encompasses the nuances of the key idea.
    - Additional Instructions: {other_system_instructions}. Consider these instructions to guide the style, format, or additional content of your answer.
    - 

    Question: {question}

    AI-Generated Answer: {generated_answer}

    """


    return generate_completion(system_prompt, initial_user_prompt, temperature=0.3)

#Grade the student without specifically providing feedback. Uses if solution is provided it uses as a reference.
def mark_student_answer(question,
                        student_answer,
                        student_year_level,
                        theory,
                        key_idea,
                        key_idea_description,
                        solution=None,
                        other_system_instructions=""):
    

    """
    Marks a student's answer to a question, providing a score and justification formatted as JSON. 
    The function adapts based on whether a solution is provided as a reference.
    
    Parameters:
    question (str): The question to which the answer is provided.
    student_answer (str): The student's answer to the question.
    student_year_level (str): The academic level of the student.
    theory (str): The theory related to the question.
    key_idea (str): The main idea related to the question.
    key_idea_description (str): The description of the key idea. Required if solution is None.
    solution (str, optional): The solution to the question. Defaults to None.
    other_system_instructions (str, optional): Additional instructions for the system. Defaults to "".

    Returns:
    str: The marked answer and justification, formatted as JSON.
    """

    #If solution is provided, use it as a reference otherwise use key_idea_description and theory mainly. 
    if solution == None:
        #no changes necessary in this case
        additional_system_prompt_info = ""

        additional_initial_user_prompt_info = ""

    else:
        additional_system_prompt_info = "You will be provided the full solution to the question which you can use as a benchmark for assessing the student's answer. Please be mindful though that the solution should only be used as a reference and not as a direct comparison. The student's answer should be assessed based on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level, not the depth of their answer in coparision to the solution."

        additional_initial_user_prompt_info = f" Use this solution as a benchmark to compare to the student's answer, being mindful of the accuracy and depth appropriate for their academic level: {solution}"
    
    
    #commmon system prompt
    system_prompt = f"""You are an AI evaluator tasked with scoring/assessing an Australian highschool student's answer to a given question. Specifically you must identifying errors the student has made. Your evaluation should focus on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level.

    {additional_system_prompt_info}

    Your task is to create a JSON object that includes a score out of 100 and a breakdown of the student's mistakes or misconceptions. Importantly, If the student's answer is mostly correct then do not provide errors simply for the sake of it. Only provide errors if they are present and relevant to the key idea and theory or if the student clearly didn't understand the concept at all. If the student's answer is correct and doens't miss any key ideas then provide a score of at least 80, using your descretion of what the score should be as well as the relevant errors. If there are no errors then provide a score of 100 and provide no errors"

    Additional System Instructions: {other_system_instructions}

    The JSON Format should be Outputted like this:
    {{
        "errors": [
            {{"explanation of error": "error_explanation_variable", "error": "the specfic error they made"}}
            // additional error objects can be added here
        ],
        "score": "the_score_variable"
    }}
    """

    #The purpose asking for the errors and explinations of errors is to ensure the system is not hallucinating and is providing a score that fits the issue.

    #initial user prompt
    initial_user_prompt = f"""Score the student's response and identify any errors or misconceptions, formatted as a JSON object. Focus on the accuracy and understanding of the key idea and relevant theory, considering the student's academic level:

    Here is some context while you mark the student:

    - Key Idea - Assess/Evaluate the student's understanding and expression of this concept: {key_idea}.
    - Description of Key Idea - Use this information to ensure that your evaluation fully encompasses the nuances of the key idea: {key_idea_description}. 
    - Relevant Theory - Look for key differences/Assess how well the student's answer reflects an understanding of this theory: {theory}.
    - Student Year Level - Evaluate/Consider the academic level of the student, focusing on their grasp of the concept rather than the depth of the response: {student_year_level}.
    - Additional Instructions  Consider these instructions to guide the style, format, or additional content of your answer: {other_system_instructions}.

    Question: {question}

    Student Answer: {student_answer}

    {additional_initial_user_prompt_info}

    Construct a JSON object with a score out of 100 and error analysis."""


    return generate_completion(system_prompt, initial_user_prompt, temperature=0.5)


def provide_feedback(initial_student_score, 
                     attempt_number,
                     question,
                     student_answer,
                     solution,
                     student_year_level,
                     theory,
                     key_idea,
                     key_idea_description,
                     other_system_instructions = ""):
    
    
    """
    Provides feedback to a student based on their answer to a question. The type of feedback provided is based on the score of the student.

    Parameters:
    intial_student_score (int): The score the student recieved from the initial marking.
    attempt_number (int): The number of attempts the student has made at the question. Maxium of 3.
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

    if initial_student_score >= 80 and attempt_number != 3:
        system_prompt_feedback = f"""
        You are an AI evaluator tasked with providing feedback on the answer the student has given. Another AI evaluator has graded the student's answer and given them a score of {initial_student_score} out of 100. Please use the provided question, the provide answer the student has given and the provided solution to determine if there are any minor mistakes the student has made. If there are mistakes, congratulate the student on their mostly correct answer and provide an explaination of what they missed and where the misconceptions lie. If the student's answer is completely correct in that they don't miss any key ideas then simply congratulate the student. Your evaluation should focus on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level.
        
        At the end of your message and feedback ask the student if they would like to move on to the next question or if they would like to discuss additional theory about the question.
        """
    
    elif initial_student_score <= 80 and attempt_number != 3:
        system_prompt_feedback = f"""
        You are an AI evaluator tasked with providing feedback on the answer the student has given. Your evaluation should focus on the accuracy and understanding of the key idea and relevant theory, appropriate to the student's academic level. Use the provided question, the provide answer by the student the provided solution to grade the student. Your feedback should highlight any errors or misconceptions without providing direct solutions. Explain what the student has gotten incorrect in a manner suitable for the student's educational level. If you point out an error in the student's answer DO NOT reveal the correct answer as feedback. Simply explain where the student's misunderstandings lie. Focus on explaining the errors in relation to the key idea and theory. Be considerate of the fact that student's answer should be of an appropriate depth and sophistication for someone at a {student_year_level} level and that you should not expect them to answer with anything more sophisticated. Be kind and encouraging in your feedback.
        
        Use the provided solution to ensure you do not reveal any direct answers that are in the solution, it is critical you do not reveal the any solutions as the student may attempt the question again. As an example, if the question is "what does the mitochondria do" and the student incorrectly answers "the mitochondria functions as a factory in which proteins received from the ER are further processed and sorted for transport" then you should explain that their answer is incorrect by, for example, explaining that " The golgi apparatus is what recieves proteins from the ER and processes them for further storage and processing" and NOT by saying "the golgi apparatus is incorrect because it does not generate most of the chemical energy needed to power the cell's biochemical reactions." as this would reveal the answer to the student. Do not strictly follow this format, it is just an example but it captures the essence of what you should do.
        
        After you provide feedback, ask the student if they would like to move on to the next question. if they would like to discuss additional theory surrounding the question, or if they would like to clear up any misunderstandsing about the question itself.
        """

    elif initial_student_score <= 80 and attempt_number == 3:
        system_prompt_feedback = f"""
        You are an AI evaluator tasked with providing feedback on the answer the student has given. Use the provided question, the provide answer by the student and the provided solution to grade the student. If you beleive the student's answer is wrong in some places or if it misses the mark on some key ideas then provide the student with the correct answer and explain what misunderstandsings lead them to the incorrect answer. The answers and feedback you give should be based on the Relevant Theory Provided Be kind and considerate of the student and don't make them feel bad for getting the answer wrong.
        
        After you provide feedback, ask the student if they would like to move on to the next question. if they would like to discuss additional theory surrounding the question, or if they would like to clear up any misunderstandsing about the question itself.
        """


    #system prompt for instructing gpt
    system_prompt = f"""An Australian high school student in {student_year_level} will provide their solution to a question that they have been asked. 

    {system_prompt_feedback}
    """

    #initial user prompt
    initial_user_prompt = f""" Provide feedback on the student's answer in the format described.

        Here is some relevant infromation reagrding the question the student was asked to answer: 

        - Key Idea - Assess/Evaluate the student's understanding and expression of this concept: {key_idea}.
        - Description of Key Idea - Use this information to ensure that your evaluation fully encompasses the nuances of the key idea: {key_idea_description}. 
        - Relevant Theory - Look for key differences/Assess how well the student's answer reflects an understanding of this theory: {theory}.
        - Student Year Level - Evaluate/Consider the academic level of the student, focusing on their grasp of the concept rather than the depth of the response: {student_year_level}.
        - Additional Instructions  Consider these instructions to guide the style, format, or additional content of your answer: {other_system_instructions}.
        
        Question: {question}

        Student Answer: {student_answer}

        Solution: {solution}
        """
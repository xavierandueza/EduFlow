import autogen
from Auto.prompt_templates import *
from auto_functions import CustomGroupChat, is_termination_msg
import random
from typing import List, Dict
from autogen.agentchat.groupchat import GroupChat
from autogen.agentchat.agent import Agent
from autogen.agentchat.assistant_agent import AssistantAgent

config_list = autogen.config_list_from_json(
        env_or_file="OAI_CONFIG_LIST",  # or OAI_CONFIG_LIST.json if file extension is added
            filter_dict={
            "model": {
                "gpt-3.5-turbo-1106",
                "gpt-3.5-tubro",
                "gpt-4-1106-preview",
                "gpt-4-vision-preview"
            }
        }
    )


gpt_config = {
    "cache_seed": 42,
    "temperature": 0.4,
    "config_list":config_list,
    "timeout":120,
    "stream": True,
    "use_cache": True,
}


#get prompts
prompts = populatePrompts()

#user proxy agents

Human = autogen.UserProxyAgent(
    name = "Human_Student",
    system_message = prompts.get('human_prompt', 'default human prompt'),
    code_execution_config=False,
    human_input_mode= 'ALWAYS'
)

terminator = autogen.UserProxyAgent(
    name = "Next_Question_Initiator",
    system_message="A Human admin which terminate the conversation when the Human_Student is ready for the next question.",
    code_execution_config=False,
    is_termination_msg=next_question_terminator(),
    human_input_mode="NEVER",
)

#assistant agents

question_generator = autogen.AssistantAgent(
    name = "AI_Teacher",
    llm_config=gpt_config,
    system_message=prompts.get('question_generator_prompt', 'default question generator prompt'),
)

AI_student = autogen.AssistantAgent(
    name = "AI_student",
    llm_config=gpt_config,
    system_message= prompts.get('AI_student_prompt', 'default AI student prompt'),
)

# AI_quality_control = autogen.AssistantAgent(
#     name = "AI_Quality_Control",
#     llm_config= gpt_config,
#     system_message= AI_quality_control_prompt
# )

AI_grader = autogen.AssistantAgent(
    name = "Grader",
    llm_config=gpt_config,
    system_message = prompts.get('AI_grader_prompt', 'default AI grader prompt')
)

theory_discusser = autogen.AssistantAgent(
    name = "Theory_Discusser",
    llm_config=gpt_config,
    system_message = prompts.get('theory_discusser_prompt', 'default theory discusser prompt'))

clarifying_AI = autogen.AssistantAgent(
    name = "Question_Clarifier",
    llm_config=gpt_config,
    system_message = prompts.get('clarifying_AI_prompt', 'default clarifying AI prompt'))


groupchat = autogen.GroupChat(agents = [Human, question_generator, AI_student, AI_grader, theory_discusser, clarifying_AI],messages=[], max_round=50)
manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=gpt_config)



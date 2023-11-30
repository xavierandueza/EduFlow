def get_data():

    key_idea = """On planet Earth, life exists in hostile and extreme environments, and the organisms that survive there are termed extremophiles."""
    key_idea_summaries = """Extremophiles are organisms that thrive in extreme conditions on Earth, such as high temperatures, acidity, alkalinity, or pressure. These environments include locations like deep-sea hydrothermal vents, acidic hot springs, or subglacial lakes in Antarctica. The adaptability of these organisms expands our understanding of life's limits and opens up possibilities for life in extreme conditions beyond Earth."""
    theory = """Extremophiles and Their Environments
    Definition: Extremophiles are primarily unicellular microbes, including bacteria and archaea, that live in harsh environments​​.
    Habitats: These environments include deep-sea hydrothermal vents with high pressure and temperatures (up to 122 °C), volcanic hot springs, deep underground in mines, and in bodies of water that are highly acidic, alkaline, extremely salty, or even radioactive​​.
    The Significance of Extremophiles
    Adaptation and Survival: Extremophiles have adapted to survive in conditions that are generally detrimental to most life forms. Their existence expands our understanding of the limits and versatility of life.
    Implications for Extraterrestrial Life: The study of extremophiles has significant implications for astrobiology. The discovery of diverse microbial communities in extreme environments like subglacial lakes under the Antarctic ice sheet suggests that life might exist in similar extreme conditions elsewhere in the universe, such as on ice-covered moons like Europa​​.
    Europa: A Candidate for Extraterrestrial Life
    Characteristics of Europa: Europa, a moon of Jupiter, is a primary candidate for extraterrestrial life exploration. It has an ice-covered surface, many kilometers thick, with a possible sub-surface ocean of salty water. The surface of Europa stretches and relaxes due to tidal movements caused by its elliptical orbit around Jupiter, generating heat that could keep a sub-surface ocean in liquid state​​.
    Potential Habitability: Europa is considered a promising location for life beyond Earth due to its thin ice shell, liquid ocean, and contact with a geologically active rocky core. The moon has water and the right chemical elements, along with a potentially stable environment​​.
    Broader Understanding
    Cellular Requirements for Life: For life to exist, certain conditions are necessary, including the availability of an energy source, liquid water for biochemical reactions, and essential chemical building blocks like carbon, oxygen, nitrogen, and hydrogen. Life can thrive in stable environmental conditions within a specific range of pressure, temperature, light intensity, pH, and salinity​​.
    Challenging Traditional Concepts: Extremophiles challenge the traditional concept of habitable environments, indicating that life can exist in conditions previously thought to be uninhabitable. This expands our understanding of possible habitats for life, both on Earth and potentially in extraterrestrial settings.
    This comprehensive overview illustrates the remarkable adaptability of life and opens up new possibilities for understanding life's potential existence in extreme environments, both on Earth and beyond."""
    student_year_level = "Year 11"
    subject = "Biology"
    question_difficulty = "moderate"
    sampleQuestions_easy = ["What is an extremophile? An extremophile is an organism that thrives in extreme environmental conditions that are typically detrimental to most life forms.", "Give one example of an extreme environment on Earth. One example is deep-sea hydrothermal vents.", "What is unique about Europa, one of Jupiter's moons? Europa has an ice-covered surface and is thought to have a sub-surface ocean of salty water."]
    sampleQuestions_moderate = ["How do extremophiles survive in high temperatures? Extremophiles in high temperatures have specialized proteins and enzymes that remain stable and functional at elevated temperatures.", "Why is the study of extremophiles important? Studying extremophiles helps understand the adaptability and limits of life, and it may provide insights into the possibility of life on other planets or moons.", "Why is Europa considered a likely place to find life beyond Earth? Europa is considered likely because of its ice shell, liquid ocean, and geologically active core, which provide conditions potentially suitable for life."]
    sampleQuestions_hard = ["Explain how extremophiles challenge the traditional concept of habitable environments. Extremophiles challenge the traditional concept by surviving in environments previously thought to be uninhabitable, expanding our understanding of where life can exist", "Discuss the potential implications of finding life in subglacial lakes in Antarctica for the search for extraterrestrial life. The discovery in subglacial lakes suggests that similar extreme, ice-covered environments in the solar system, such as on Europa, could also harbor life.", "How does the study of extremophiles contribute to our understanding of the potential for life on planets and moons outside the 'Goldilocks Zone'? The study of extremophiles indicates that life can exist in conditions not reliant on a star's warmth, suggesting that planets and moons outside the 'Goldilocks Zone' could also support life."]
    subject = 'biology'
    sampleQuestions = sampleQuestions_moderate
    other_system_instructions = ""
    interests = ["gaming", "politics", "philosophy"]
    career_goals = ["lawyer", "doctor", "engineer"]


    promptKeywords = {"key_idea": key_idea, "key_idea_summaries": key_idea_summaries, "theory": theory, "student_year_level": student_year_level, "subject": subject, "question_difficulty": question_difficulty, "sampleQuestions": sampleQuestions, "other_system_instructions": other_system_instructions, "interests": interests, "career_goals": career_goals}

    return promptKeywords
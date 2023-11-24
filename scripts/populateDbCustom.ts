import { AstraDB } from "@datastax/astra-db-ts";
import 'dotenv/config'

async function main() {
    const {ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_NAMESPACE } = process.env;

    const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_NAMESPACE);

    await astraDb.createCollection('skills_vec');
    await astraDb.createCollection('students_vec');
    await astraDb.createCollection('student_skills_vec');

    const skillsDocuments = [
        {
            "subject" : "Biology",
            "curriculum_point" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "On planet Earth, life exists in hostile and extreme environments and the organisms that survive there are termed extremophiles.",
            "key_ideas" : ["On planet Earth, life exists in hostile and extreme environments and the organisms that survive there are termed extremophiles."],
            "key_idea_summaries" : ["Extremophiles are organisms that thrive in environments that are considered extremely harsh or uninhabitable for most life forms. They have evolved unique adaptations for survival in conditions like high temperatures, extreme cold, high salt concentrations, acidic or alkaline conditions, and high pressure. Their existence expands our understanding of life's potential and challenges the perceived limits of habitable environments."],
            "easy_questions" : ["1. What is an extremophile? 2. Give an example of an environment where extremophiles can be found. 3. Name one type of extremophile and the condition it thrives in."],
            "mdrt_questions" : ["1. How do halophiles adapt to high salt concentrations? 2. Why are extremophiles important for understanding life on other planets? 3. How do thermophiles adapt to high temperatures?"],
            "hard_questions" : ["1. Discuss the role of extremophiles in biotechnology and industry. 2. Explain the biochemical mechanisms of psychrophiles in cold environments. 3. Analyze the evolutionary significance of extremophiles."],
            "content" : `Introduction to Extremophiles
            Definition: Extremophiles are organisms that thrive in environments considered extreme or hostile to most forms of life on Earth.
            Types of Extremophiles: Includes thermophiles (heat lovers), psychrophiles (cold lovers), halophiles (salt lovers), acidophiles (acid lovers), alkaliphiles (base lovers), and piezophiles or barophiles (pressure lovers).
            Environments and Adaptations
            Thermophiles: Live in extremely hot environments like hot springs and hydrothermal vents. Adaptations include heat-stable enzymes and protein structures that remain functional at high temperatures.
            Psychrophiles: Found in Arctic and Antarctic regions. They have enzymes that remain active at low temperatures and cell membranes that remain fluid in cold conditions.
            Halophiles: Inhabit highly saline environments like salt lakes. They maintain osmotic balance by accumulating salts or compatible solutes within their cells.
            Acidophiles and Alkaliphiles: Thrive in environments with extreme pH levels. They maintain internal pH and protect their cellular components from damage.
            Piezophiles: Exist in high-pressure environments, such as deep-sea trenches. They have adapted cellular mechanisms to cope with the immense pressure.
            Evolutionary Significance
            Early Earth Conditions: Extremophiles provide insights into life forms that may have existed on early Earth under harsh conditions.
            Adaptation Mechanisms: Studying these organisms helps us understand the mechanisms of adaptation and survival in extreme conditions.
            Applications in Science and Industry
            Biotechnology: Extremophiles are a source of enzymes for industrial processes, like high-temperature fermentations or working in acidic or alkaline conditions.
            Pharmaceuticals: Some extremophiles produce novel compounds with potential medical applications.
            Astrobiology: They provide models for potential life forms on other planets, helping in the search for extraterrestrial life.
            Challenges and Future Directions
            Research Limitations: Studying extremophiles in their natural habitats poses significant challenges due to their inaccessible and harsh environments.
            Potential Discoveries: Ongoing research may uncover new types of extremophiles with unique adaptations, offering further insights into the limits of life and potential applications.
            Summary
            Extremophiles demonstrate life's ability to adapt to a wide range of extreme environments.
            They challenge our understanding of life's limits and offer valuable insights into evolution, biotechnology, and the search for extraterrestrial life.`,
            "decay_value" : 0.5,
            "dependencies" : []
        },
        {
            "subject" : "Biology",
            "curriculum_point" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "For life to exist, a set of conditions must be met, including the availability of a source of energy and the presence of liquid water.",
            "key_ideas" : ["For life to exist, a set of conditions must be met, including the availability of a source of energy and the presence of liquid water."],
            "key_idea_summaries" : ["For life to thrive, an energy source, liquid water, necessary chemical elements, and stable environmental conditions are crucial. Energy fuels metabolic processes, water acts as a solvent and transport medium, elements form biomolecules, and stable conditions maintain life processes."],
            "easy_questions" : ["1. What is the primary source of energy for most living organisms on Earth? <br> 2. Why is liquid water essential for life? <br> 3. Name one element that is a fundamental building block of life."],
            "mdrt_questions" : ["1. Explain how energy is used by living organisms. <br> 2. Describe the role of water in transporting substances in cells. <br> 3. Why is carbon considered a versatile element in forming biomolecules?"],
            "hard_questions" : ["1. Discuss how environmental conditions like pH and temperature affect living organisms. <br> 2. How do extremophiles adapt to extreme environmental conditions? <br> 3. Explain the significance of the solvent properties of water in biochemical reactions."],
            "content" : `1. Availability of an Energy Source
    
            Importance: Living organisms need energy for metabolic processes that maintain their living state.
            Sources: Energy can come from the sun (photosynthesis in plants) or chemical sources (chemosynthesis in certain bacteria).
            Use: Energy is essential for capturing, using, and storing to perform various life processes like growth, reproduction, and maintenance of cellular functions.
            2. Presence of Liquid Water
            
            Role: Water is crucial for allowing biochemical reactions. It acts as a solvent, dissolving chemicals, and facilitating their transport within and between cells.
            Properties: Water’s unique solvent properties and ability to maintain temperature enable various life-supporting chemical reactions.
            3. Chemical Building Blocks
            
            Elements: The basic chemical building blocks include carbon, oxygen, nitrogen, and hydrogen.
            Carbon's Versatility: Carbon is particularly significant due to its ability to form various complex biomolecules, including long chains, essential for life.
            Function: These elements are vital for cellular repair, growth, reproduction, and forming complex biomolecules needed for various cellular functions.
            4. Stable Environmental Conditions
            
            Tolerance Range: Organisms require stable conditions within their tolerance range, including pressure, temperature, light intensity, pH, and salinity.
            Adaptation: Different organisms are adapted to varying ranges of these environmental factors.
            Significance: Stability in these factors is essential for maintaining the internal environment and supporting life processes.
            5. Life in Extreme Conditions
            
            Adaptability: Life can thrive even in extreme and hostile environments if the above conditions are met.
            Examples:
            Archaeon surviving in superheated hydrothermal vents at deep ocean pressures and temperatures of 122 °C.
            Organisms living in volcanic hot springs, deep underground mines, and environments with extreme pH, salinity, or radioactivity.
            These conditions collectively ensure the survival and continuity of life, demonstrating the adaptability and resilience of life forms under various environmental challenges. This adaptability indicates that life might exist beyond Earth in similar extreme conditions​​.`,
            "decay_value" : 0.5,
            "dependencies" : []
        },
        {
            "subject" : "Biology",
            "curriculum_point" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Living cells have been found in a subglacial lake in Antarctica under hundreds of metres of ice sheet, raising the posibility that life might exist under the ice-covered surface moons in our solar system.",
            "key_ideas" : ["Living cells have been found in a subglacial lake in Antarctica under hundreds of metres of ice sheet.", "The discovery of a diverse microbial ecosystem in a subglacial lake in Antarctica raises the possibility that life might exist under the surface ofice-covered moons in our solar system."],
            "key_idea_summaries" : ["Description: Discovery of life in extreme environments. Significance: Challenges understanding of life's requirements and adaptability. Implications: Opens new avenues in astrobiology and understanding of extraterrestrial life possibilities.", "Description: Microbes adapted to extreme conditions. Implications for Extraterrestrial Life: Suggests life could exist on similar moons. Research Significance: Propels inquiry into life's sustainability in uninhabitable environments."],
            "easy_questions" : ["1. What type of cells were found in Antarctica's subglacial lake? 2. How deep were these cells found? 3. Can these cells perform metabolic activities?", "1. Name two ice-covered moons where life might exist. 2. What type of ecosystem was discovered in the lake? 3. Are the microbes photosynthetic?"],
            "mdrt_questions" : ["1. Why is the discovery of cells in extreme conditions significant? 2. How does this discovery challenge our understanding of life? 3. What are the astrobiology implications of this discovery?", "1. Relate the discovery in Antarctica to extraterrestrial life possibility. 2. Key characteristics of these microbes? 3. How do microbes obtain energy without sunlight?"],
            "hard_questions" : ["1. Discuss adaptations these cells might have for survival. 2. How could this influence the search for extraterrestrial life? 3. Evaluate the impact on our understanding of life's diversity.", "1. Compare potential for life in Antarctica's lakes and Europa's ocean. 2. Discuss challenges in researching extreme environmental life. 3. Impact on understanding the habitable zone."],
            "content" : `Overview:
            The discovery of living cells in a subglacial lake in Antarctica, and the identification of a diverse microbial ecosystem, provides critical direct evidence of life in extreme environments. These findings are pivotal in understanding life's adaptability and potential existence beyond Earth, specifically under the surface of ice-covered moons in our solar system.
            
            Key Concepts:
            
            Discovery in Antarctic Subglacial Lake:
            
            Living Cells Found: Metabolically active cells were discovered under hundreds of meters of ice in a subglacial lake in Antarctica. This indicates that life can exist and adapt to extreme conditions like immense pressure, cold, and absence of sunlight.
            Survival Mechanisms: These cells demonstrate unique adaptations to survive, such as specialized metabolic pathways, which may include chemosynthesis, a process of deriving energy from chemical reactions rather than sunlight.
            Diverse Microbial Ecosystem:
            
            Composition: The ecosystem comprises various microbes, each adapted to the cold and dark environment. This diversity shows life's resilience and ability to thrive in conditions previously deemed uninhabitable.
            Implications for Extraterrestrial Life: This ecosystem raises the possibility of life existing in similar environments elsewhere, notably on ice-covered moons like Europa or Enceladus. These moons have subsurface oceans, potentially similar to the subglacial lakes in Antarctica.
            Astrobiological Significance:
            
            Expanding the Habitable Zone: The findings challenge the traditional understanding of the "habitable zone" for life, which primarily focused on regions where liquid water could exist on the surface.
            Search for Extraterrestrial Life: It propels the scientific community to consider extreme environments when searching for life on other planets and moons.
            Research and Exploration:
            
            Technological Advances: Studying life in extreme environments requires advanced technology for remote exploration and analysis.
            Interdisciplinary Approach: The study of life in extreme conditions involves a cross-disciplinary approach, including biology, astrobiology, geology, and environmental science.
            Educational and Ethical Considerations:
            
            Curriculum Integration: These discoveries are vital for educational curricula, offering real-world examples of biological concepts and the adaptability of life.
            Ethical Implications: The exploration of such environments raises ethical questions about the potential contamination of pristine ecosystems, both on Earth and in space.
            Conclusion:
            The presence of life in Antarctica's subglacial lakes not only broadens our understanding of life's diversity on Earth but also has profound implications for the search for life in the universe. It underscores the need for continued exploration and study of extreme environments, both terrestrially and extraterrestrially, expanding our knowledge about the possibilities of life beyond our current comprehension.`,
            "decay_value" : 0.5,
            "dependencies" : []
        },
        {
            "subject" : "Biology",
            "curriculum_point" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Critical direct evidence of life (as we know it) is the presence of metabolically active cells.",
            "key_ideas" : ["Critical direct evidence of life (as we know it) is the presence of metabolically active cells."],
            "key_idea_summaries" : ["Metabolically active cells are indicators of life, performing functions such as nutrient uptake, DNA synthesis, and protein synthesis. Presence of such cells, as seen in lake water samples, confirms life and active cell division​"],
            "easy_questions" : ["1. What is a primary indicator of life in a biological context? 2. Define 'metabolically active cells.' 3. Give one example of a metabolic activity performed by living cells."],
            "mdrt_questions" : ["1. Why is thymidine used to test for the presence of living cells? 2. How does the synthesis of proteins in cells indicate their metabolic activity? 3. Describe the process by which cells incorporate thymidine into their DNA."],
            "hard_questions" : ["1. Discuss how the presence of metabolically active cells can be used to assess life in extreme environments. 2. Explain the significance of protein synthesis in understanding cell metabolism. 3. Analyze how the uptake and incorporation of thymidine into DNA can be indicative of cell division and life."],
            "content" : `Overview
            Metabolically active cells are a fundamental indicator of life. These cells are involved in numerous biological processes, including nutrient uptake, DNA synthesis, and protein synthesis, which are essential for maintaining life and ensuring cell division.
            Key Details
            Identification of Metabolically Active Cells:
            
            The existence of cells showing metabolic activity is critical in demonstrating life​​.
            A practical example is the study of lake water cells, where metabolic activities were observed directly.
            Metabolic Activities in Cells:
            
            Living cells engage in a wide array of metabolic activities. This includes:
            Nutrient Uptake: Cells absorb essential nutrients from their surroundings.
            DNA Synthesis: Cells synthesize DNA, a fundamental process for growth and reproduction.
            Protein Synthesis: Cells build proteins necessary for various cellular functions.
            Confirming Cell Viability and Metabolic Activity:
            
            In research, cells are often tested for their viability and metabolic activity through exposure to specific compounds.
            For example, when lake water cells were exposed to thymidine, a DNA building block, they incorporated it into their DNA. This process confirmed that the cells were not only alive but also actively dividing​​.
            The synthesis of proteins in these cells further confirmed their metabolic activity.
            Evidence of Cell Division:
            
            Active cell division is a strong indication of metabolic activity. In the case of the lake microbes, cell division was observed when water samples were placed in nutrient media, where they underwent multiple cell division cycles, forming visible colonies.
            Significance in Biology:
            
            Understanding and identifying metabolically active cells is crucial in various biological fields, including microbiology, environmental biology, and astrobiology.
            This knowledge is also pivotal in exploring the possibilities of life in extreme or previously unexplored environments, such as subglacial lakes or extraterrestrial bodies.
            Conclusion
            The presence of metabolically active cells is a critical, direct evidence of life. By studying these cells and their activities, we gain insights into the fundamental processes of living organisms and their ability to thrive in diverse environments​​.`,
            "decay_value" : 0.5,
            "dependencies" : []
        }
    ]

    const studentDocuments = [
        {
            "email_address" : "xand0001@student.monash.edu",
            "interests" : ["Gaming", "Programming", "Cooking"],
            "subjects" : ["FIT3171"],
        },
        {
            "email_address" : "sben0007@student.monash.edu",
            "interests" : ["Running", "Artificial Intelligence", "Painting"],
            "subjects" : ["FIT3171"],
        }
    ] 

    // create an empty studentsSkillsDocument and loop through skills and append info to get the studentsSkillsDocument fully populated
    let studentSkillsDocuments = []
    for (const studentDoc of studentDocuments) {
        for (const skillsDoc of skillsDocuments) {
            studentSkillsDocuments.push({
                "email_address" : studentDoc.email_address,
                "subject" : skillsDoc.subject,
                "skill" : skillsDoc.skill,
                "mastery_score" : 0,
                "retention_score" : 0,
                "need_to_revise" : false,
                "decay_value" : 0.5,
            })
        }
    }
    console.log(studentSkillsDocuments);

    const skills_vec_collection = await astraDb.collection('skills_vec');
    for await (const { curriculum_point, skill, key_ideas, key_idea_summaries, easy_questions, mdrt_questions, hard_questions, content } of skillsDocuments) {
        const res = await skills_vec_collection.insertOne({
            curriculum_point,
            skill,
            key_ideas,
            key_idea_summaries,
            easy_questions,
            mdrt_questions,
            hard_questions,
            content
        });
    }

    const students_vec_collection = await astraDb.collection('students_vec');
    for await (const { email_address, interests, subjects } of studentDocuments) {
        const res = await students_vec_collection.insertOne({
            email_address,
            interests,
            subjects
        });
    }

    const students_skills_vec_collection = await astraDb.collection('student_skills_vec');
    for await (const { email_address, subject, skill, mastery_score, retention_score, need_to_revise, decay_value} of studentSkillsDocuments) {
        const res = await students_skills_vec_collection.insertOne({
            email_address,
            subject,
            skill,
            mastery_score,
            retention_score,
            need_to_revise,
            decay_value
        });
    }
}

main().catch(console.error);

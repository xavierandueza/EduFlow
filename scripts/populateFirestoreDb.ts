import { db } from "../app/firebase";
import { collection, addDoc, getDocs, query, limit, where } from "firebase/firestore";

async function main() {


    // creating the student documents
    const studentDocuments = [
        {
            "firstName" : "Xavier",
            "lastName" : "Andueza",
            "email" : "xand0001@student.monash.edu",
            "interests" : ["Gaming", "Programming", "Cooking"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Scott",
            "lastName" : "Bennett",
            "email" : "sben0007@student.monash.edu",
            "interests" : ["Running", "Artificial Intelligence", "Painting"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        // Additional 23 student documents
        {
            "firstName" : "Amelia",
            "lastName" : "Johnson",
            "email" : "ajoh0023@student.monash.edu",
            "interests" : ["Photography", "Traveling", "Blogging"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Liam",
            "lastName" : "Fletcher",
            "email" : "lfle0019@student.monash.edu",
            "interests" : ["Football", "Music", "Video Games"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Emma",
            "lastName" : "Walsh",
            "email" : "ewal0027@student.monash.edu",
            "interests" : ["Reading", "Hiking", "Photography"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Noah",
            "lastName" : "Kim",
            "email" : "nkim0034@student.monash.edu",
            "interests" : ["Chess", "Robotics", "Cycling"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Olivia",
            "lastName" : "Davies",
            "email" : "odav0042@student.monash.edu",
            "interests" : ["Yoga", "Gardening", "Cooking"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "William",
            "lastName" : "Patel",
            "email" : "wpat0050@student.monash.edu",
            "interests" : ["Swimming", "Traveling", "Blogging"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Sophia",
            "lastName" : "Chen",
            "email" : "sche0058@student.monash.edu",
            "interests" : ["Fashion", "Drawing", "Gaming"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "James",
            "lastName" : "Gupta",
            "email" : "jgup0066@student.monash.edu",
            "interests" : ["Skateboarding", "Music Production", "Photography"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Isabella",
            "lastName" : "Brown",
            "email" : "ibro0073@student.monash.edu",
            "interests" : ["Writing", "Acting", "Dance"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Lucas",
            "lastName" : "Nguyen",
            "email" : "lngu0081@student.monash.edu",
            "interests" : ["Coding", "Astronomy", "Chess"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Mia",
            "lastName" : "Lee",
            "email" : "mlee0089@student.monash.edu",
            "interests" : ["Baking", "Photography", "Yoga"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Benjamin",
            "lastName" : "Smith",
            "email" : "bsmi0096@student.monash.edu",
            "interests" : ["Surfing", "Guitar", "Graphic Design"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Charlotte",
            "lastName" : "Jones",
            "email" : "cjon0104@student.monash.edu",
            "interests" : ["Painting", "Traveling", "Vlogging"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Elijah",
            "lastName" : "Taylor",
            "email" : "etay0112@student.monash.edu",
            "interests" : ["Basketball", "Cooking", "Reading"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Harper",
            "lastName" : "Anderson",
            "email" : "hand0119@student.monash.edu",
            "interests" : ["Fashion Design", "Blogging", "Yoga"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Ethan",
            "lastName" : "Thomas",
            "email" : "etho0127@student.monash.edu",
            "interests" : ["Robotics", "Hiking", "Photography"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Avery",
            "lastName" : "Wang",
            "email" : "awan0135@student.monash.edu",
            "interests" : ["Painting", "Sculpting", "Cycling"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Jackson",
            "lastName" : "Martinez",
            "email" : "jmar0142@student.monash.edu",
            "interests" : ["Football", "Cooking", "Music"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Evelyn",
            "lastName" : "Garcia",
            "email" : "egar0150@student.monash.edu",
            "interests" : ["Dancing", "Gardening", "Photography"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Aiden",
            "lastName" : "Rodriguez",
            "email" : "arod0158@student.monash.edu",
            "interests" : ["Boxing", "Programming", "Gaming"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Lily",
            "lastName" : "Martinez",
            "email" : "lmar0166@student.monash.edu",
            "interests" : ["Fashion", "Drawing", "Singing"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Grace",
            "lastName" : "Hernandez",
            "email" : "gher0174@student.monash.edu",
            "interests" : ["Astronomy", "Poetry", "Traveling"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        },
        {
            "firstName" : "Daniel",
            "lastName" : "Lee",
            "email" : "dlee0182@student.monash.edu",
            "interests" : ["Martial Arts", "Film Making", "Cooking"],
            "subjects" : ["Biology", "Mathematics"],
            "schoolClassesLong" : [
                {
                    "id" : "",
                    "name" : "Biology-1"
                }, 
                {
                    "id" : "",
                    "name" : "Mathematics-1"
                }
            ],
            "schoolClassesShort" : ["Biology-1", "Mathematics-1"]
        }
    ]
    // check if the student documents exist, if not create them
    const studentsQuery = query(collection(db, 'students'), limit(1));
    const studentsExist = !(await getDocs(studentsQuery)).empty;
    console.log("Students exist is: " + studentsExist);

    if (!studentsExist) {
        // seed the database
        console.log("No students, need to seed the database")
        for await (const { firstName, lastName, email, interests, subjects, schoolClassesLong, schoolClassesShort } of studentDocuments) {
            const res = await addDoc(collection(db, 'students'), {
                firstName,
                lastName,
                email,
                interests,
                subjects,
                schoolClassesLong,
                schoolClassesShort
            });
        }
    }

    // create the teachers
    const teacherDocuments = [
        {
            "email" : "clara@everdawn.ai",
            "firstName" : "Clara",
            "lastName" : "Yew",
            "schoolClasses" : [
                {
                    "id" : "",
                    "name": "Biology-1"
                }, 
                {
                    "id" : "",
                    "name": "Biology-2"
                }, 
                {
                    "id" : "",
                    "name": "Mathematics-1"
                }, 
                {
                    "id" : "",
                    "name": "Mathematics-2"
                }
            ]
        }, 
        {
            "email" : "andrew@everdawn.ai",
            "firstName" : "Andrew",
            "lastName" : "Atta",
            "schoolClasses" : [
                {
                    "id" : "",
                    "name": "Biology-3"
                }, 
                {
                    "id" : "",
                    "name": "Biology-4"
                }, 
                {
                    "id" : "",
                    "name": "Mathematics-3"
                }, 
                {
                    "id" : "",
                    "name": "Mathematics-4"
                }
            ]
        }
    ]
    const teachersQuery = query(collection(db, 'teachers'), limit(1));
    const teachersExist = !((await getDocs(teachersQuery)).empty);
    console.log("Teachers exist is: " + teachersExist);

    if (!teachersExist) {
        console.log("generating teachers")
        for await (const { email, firstName, lastName, schoolClasses } of teacherDocuments) {
            const res = await addDoc(collection(db, 'teachers'), {
                firstName,
                lastName,
                email,
                schoolClasses
            });
    }}

    // create classes
    const schoolClasses = [
        {
            "name" : "Biology-1",
            "subject" : "Biology",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "clara@everdawn.ai",
                    "firstName" : "Clara",
                    "lastName" : "Yew"
                },
            ],
            "students" : []
        }, 
        {
            "name" : "Biology-2",
            "subject" : "Biology",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "clara@everdawn.ai",
                    "firstName" : "Clara",
                    "lastName" : "Yew"
                },
            ],
            "students" : []
        },
        {
            "name" : "Biology-3",
            "subject" : "Biology",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "andrew@everdawn.ai",
                    "firstName" : "Andrew",
                    "lastName" : "Atta"
                },
            ],
            "students" : []
        }, 
        {
            "name" : "Biology-4",
            "subject" : "Biology",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "andrew@everdawn.ai",
                    "firstName" : "Andrew",
                    "lastName" : "Atta"
                },
            ],
            "students" : []
        },
        {
            "name" : "Mathematics-1",
            "subject" : "Mathematics",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "clara@everdawn.ai",
                    "firstName" : "Clara",
                    "lastName" : "Yew"
                },
            ],
            "students" : []
        }, 
        {
            "name" : "Mathematics-2",
            "subject" : "Mathematics",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "clara@everdawn.ai",
                    "firstName" : "Clara",
                    "lastName" : "Yew"
                },
            ],
            "students" : []
        },
        {
            "name" : "Mathematics-3",
            "subject" : "Mathematics",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "andrew@everdawn.ai",
                    "firstName" : "Andrew",
                    "lastName" : "Atta"
                },
            ],
            "students" : []
        }, 
        {
            "name" : "Mathematics-4",
            "subject" : "Mathematics",
            "teachers" : [
                {
                    "id" : "",
                    "email" : "andrew@everdawn.ai",
                    "firstName" : "Andrew",
                    "lastName" : "Atta"
                },
            ],
            "students" : []
        },
    ]

    // get the students into the schoolClasses for their relevant classes
    // only for mathematics 1 and biology 1 here
    for (const schoolClass of schoolClasses) {
        // retrieve the students for the class
        const studentsQuery = query(collection(db, 'students'), where("schoolClassesShort", "array-contains", schoolClass.name));
        const students = await getDocs(studentsQuery);
        const studentsArray = [];

        if (!students.empty) {
            for (const student of students.docs) {
                studentsArray.push({
                    "id" : student.id,
                    "firstName" : student.data().firstName,
                    "lastName" : student.data().lastName
                });
            }
        }
        
        schoolClass.students = studentsArray;
    }
    
    const schoolClassesQuery = query(collection(db, 'schoolClasses'), limit(1));
    const schoolClassesExist = !((await getDocs(schoolClassesQuery)).empty);
    console.log("schoolClasses exist is: " + schoolClassesExist);

    if (!schoolClassesExist) {
        console.log("generating schoolClasses")
        for await (const { name, subject, teachers, students } of schoolClasses) {
            const res = await addDoc(collection(db, 'schoolClasses'), {
                name,
                subject,
                teachers,
                students
            });
        }
    }

    // Create the subjects with the school classes in them
    const subjects = [
        {
            "name" : "Biology",
            "schoolClasses" : []
        },
        {
            "name" : "Mathematics",
            "schoolClasses" : []
        }
    ]

    // get the school classes into the subjects
    for (const subject of subjects) {
        // retrieve the school classes for the subject
        const schoolClassesQuery = query(collection(db, 'schoolClasses'), where("subject", "==", subject.name));
        const schoolClasses = await getDocs(schoolClassesQuery);
        const schoolClassesArray = [];

        if (!schoolClasses.empty) {
            for (const schoolClass of schoolClasses.docs) {
                schoolClassesArray.push({
                    "id" : schoolClass.id,
                    "name" : schoolClass.data().name
                });
            }
        }
        
        subject.schoolClasses = schoolClassesArray;
    }

    const subjectsQuery = query(collection(db, 'subjects'), limit(1));
    const subjectsExist = !((await getDocs(subjectsQuery)).empty);
    console.log("Subjects exist is: " + subjectsExist);

    if (!subjectsExist) {
        console.log("generating subjects")
        for await (const { name , schoolClasses } of subjects) {
            const res = await addDoc(collection(db, 'subjects'), {
                name
            });
        }
    }

    // create the skills collection underneath the schoolClasses in the firestore db
    const skillsDocuments = [
        {
            "subject" : "Biology",
            "curriculumPoint" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Extremophiles on Earth",
            "skillDescription" : "On planet Earth, life exists in hostile and extreme environments and the organisms that survive there are termed extremophiles.",
            "keyIdeas" : ["On planet Earth, life exists in hostile and extreme environments and the organisms that survive there are termed extremophiles."],
            "keyIdeasSummary" : ["Extremophiles are organisms that thrive in environments that are considered extremely harsh or uninhabitable for most life forms. They have evolved unique adaptations for survival in conditions like high temperatures, extreme cold, high salt concentrations, acidic or alkaline conditions, and high pressure. Their existence expands our understanding of life's potential and challenges the perceived limits of habitable environments."],
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
            "decayValue" : 0.5,
            "dependencies" : [],
            "questions" : []
        },
        {
            "subject" : "Biology",
            "curriculumPoint" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Life's Essential Conditions",
            "skillDescription" : "For life to exist, a set of conditions must be met, including the availability of a source of energy and the presence of liquid water.",
            "keyIdeas" : ["For life to exist, a set of conditions must be met, including the availability of a source of energy and the presence of liquid water."],
            "keyIdeasSummary" : ["For life to thrive, an energy source, liquid water, necessary chemical elements, and stable environmental conditions are crucial. Energy fuels metabolic processes, water acts as a solvent and transport medium, elements form biomolecules, and stable conditions maintain life processes."],
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
            "decayValue" : 0.5,
            "dependencies" : [],
            "questions" : []
        },
        {
            "subject" : "Biology",
            "curriculumPoint" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Antarctic Subglacial Life",
            "skillDescription" : "Living cells have been found in a subglacial lake in Antarctica under hundreds of metres of ice sheet, raising the posibility that life might exist under the ice-covered surface moons in our solar system.",
            "keyIdeas" : ["Living cells have been found in a subglacial lake in Antarctica under hundreds of metres of ice sheet.", "The discovery of a diverse microbial ecosystem in a subglacial lake in Antarctica raises the possibility that life might exist under the surface ofice-covered moons in our solar system."],
            "keyIdeasSummary" : ["Description: Discovery of life in extreme environments. Significance: Challenges understanding of life's requirements and adaptability. Implications: Opens new avenues in astrobiology and understanding of extraterrestrial life possibilities.", "Description: Microbes adapted to extreme conditions. Implications for Extraterrestrial Life: Suggests life could exist on similar moons. Research Significance: Propels inquiry into life's sustainability in uninhabitable environments."],
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
            "decayValue" : 0.5,
            "dependencies" : [],
            "questions" : []
        },
        {
            "subject" : "Biology",
            "curriculumPoint" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Evidence of Life",
            "skillDescription" : "Critical direct evidence of life (as we know it) is the presence of metabolically active cells.",
            "keyIdeas" : ["Critical direct evidence of life (as we know it) is the presence of metabolically active cells."],
            "keyIdeasSummary" : ["Metabolically active cells are indicators of life, performing functions such as nutrient uptake, DNA synthesis, and protein synthesis. Presence of such cells, as seen in lake water samples, confirms life and active cell division​"],
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
            "decayValue" : 0.5,
            "dependencies" : [],
            "questions" : []
        },
        {
            "subject" : "Biology",
            "curriculumPoint" : "Cells as the basic structural feature of life on Earth, including the distinction between prokaryotic and eukaryotic cells",
            "skill" : "Cellular Units of Life",
            "skillDescription" : "Cells are the basic structural and functional units of life.",
            "keyIdeas" : ["Critical direct evidence of life (as we know it) is the presence of metabolically active cells."],
            "keyIdeasSummary" : ["Cells form the structural and functional basis of all living organisms, featuring common components such as the cell membrane, nucleus, and cytoplasm, and are essential for life processes."],
            "content" : `Comprehensive Notes on Cells as the Basic Structural and Functional Units of Life
            1. Cell Theory
            Definition: Cell theory states that all living things are composed of cells, cells are the basic units of structure and function in living things, and new cells are produced from existing cells.
            Historical Perspective: Developed by scientists like Matthias Schleiden, Theodor Schwann, and Rudolf Virchow in the 19th century.
            2. Cell Structure
            Cell Membrane: A semi-permeable barrier that controls the entry and exit of substances.
            Cytoplasm: A jelly-like substance where most cellular activities occur.
            Nucleus: Contains genetic material (DNA) and controls cell activities.
            Mitochondria: Known as the powerhouse of the cell, responsible for energy production.
            Ribosomes: Sites of protein synthesis.
            Endoplasmic Reticulum (ER): Rough ER (with ribosomes) synthesizes proteins, while Smooth ER synthesizes lipids.
            Golgi Apparatus: Modifies, sorts, and packages proteins and lipids for storage or transport out of the cell.
            Lysosomes: Contain enzymes for digestion of cellular waste.
            Vacuoles: Storage for nutrients, waste products, and other substances.
            3. Cell Types
            Prokaryotic Cells: Simple structure without a nucleus or membrane-bound organelles (e.g., bacteria).
            Eukaryotic Cells: Complex cells with a nucleus and organelles (e.g., plant and animal cells).
            4. Cell Function
            Metabolism: All chemical reactions involved in maintaining the cell's state.
            Synthesis of Proteins: Critical for cell function and regulation.
            Cellular Respiration: Process of converting nutrients into energy (ATP).
            Cell Division: Process of cell replication (mitosis and meiosis).
            5. Specialized Cells
            Adaptation to Function: Different cells have specific structures that match their functions (e.g., red blood cells, nerve cells, muscle cells).
            Organ System Integration: Specialized cells work together in tissues and organs to perform complex functions.
            6. Cell Communication
            Signal Transduction: Cells communicate through chemical signals and receptors.
            Cellular Responses: Changes in cell behavior or function in response to environmental or internal signals.
            7. Cellular Transport
            Passive Transport: Movement of substances across the cell membrane without energy (e.g., diffusion, osmosis).
            Active Transport: Energy-dependent movement of substances against a concentration gradient.
            8. Cell Health and Disease
            Role in Health: Proper cell function is essential for overall health.
            Disease and Disorders: Abnormal cell function can lead to diseases like cancer, genetic disorders, and infections​.`,
            "decayValue" : 0.5,
            "dependencies" : ["Extremophiles on Earth", "Life's Essential Conditions", "Antarctic Subglacial Life", "Evidence of Life"],
            "questions" : []
        }
    ]

    // Add the subject_skills collection to the Biology subject
    // query the subjects that have a name of Biology
    const biologySubjectsQuery = query(collection(db, 'subjects'), where("name", "==", "Biology"));
    const biologySubjectsSnapshot = await getDocs(biologySubjectsQuery);

    for (const subjectDoc of biologySubjectsSnapshot.docs) {
        const subjectSkillsCollectionRef = collection(subjectDoc.ref, 'skills');
        const subjectSkillsSnapshot = await getDocs(subjectSkillsCollectionRef);

        if (subjectSkillsSnapshot.empty) {
            console.log("No subject_skills subcollection found")
            for (const skillDocument of skillsDocuments) {
                // Check for undefined values in skillDocument
                const skillData = {};
                for (const key in skillDocument) {
                    if (skillDocument[key] !== undefined) {
                        skillData[key] = skillDocument[key];
                    } else {
                        console.log("Undefined value found in skillDocument: " + key)
                    }
                }
    
                // Add the document
                await addDoc(subjectSkillsCollectionRef, skillData);
            }
        } else {
            console.log("subject_skills subcollection found")
        }
    }

    // get all of the schoolClasses that have a subject of biology
    const biologySchoolClassesQuery = query(collection(db, 'schoolClasses'), where("subject", "==", "Biology"));
    const biologySchoolClassesSnapshot = await getDocs(biologySchoolClassesQuery);

    // get all of the skills under biology
    const biologySkillsQuery = query(collection(biologySubjectsSnapshot.docs[0].ref, 'skills'));
    const biologySkillsSnapshot = await getDocs(biologySkillsQuery);

    // To create our schoolClassSkills, we will loop over each school class, check if the skills exist, if they don't we add them

    // loop over the biologySchoolClasses and check if the skills exist, if not create them
    for (const schoolClassesDoc of biologySchoolClassesSnapshot.docs) {
        for (const skillsDoc of biologySkillsSnapshot.docs) {
            // check if there is a schoolClassSkill
            const schoolClassSkillsQuery = query(collection(db, 'schoolClassSkills'), where("schoolClassID", "==", schoolClassesDoc.id), where("skillID", "==", skillsDoc.id));
            const schoolClassSkillsSnapshot = await getDocs(schoolClassSkillsQuery);

            if (schoolClassSkillsSnapshot.empty) {
                // add in the schoolClassSkill
                const tempSchoolClassSkillDocument = {
                    "schoolClassID" : schoolClassesDoc.id,
                    "schoolClass" : schoolClassesDoc.data().name,
                    "content" : skillsDoc.data().content,
                    "curriculumPoint" : skillsDoc.data().curriculumPoint,
                    "decayValue" : skillsDoc.data().decayValue,
                    "dependencies" : skillsDoc.data().dependencies,
                    "keyIdeas" : skillsDoc.data().keyIdeas,
                    "keyIdeasSummary" : skillsDoc.data().keyIdeasSummary,
                    "questions" : skillsDoc.data().questions,
                    "skill" : skillsDoc.data().skill,
                    "skillDescription" : skillsDoc.data().skillDescription,
                    "subject" : skillsDoc.data().subject,
                    "skillID" : skillsDoc.id
                }

                await addDoc(collection(db, 'schoolClassSkills'), tempSchoolClassSkillDocument);
            } 
        }
    }

    // CREATING studentSkills collection
    // loop over all of the student documents where a student is taking biology
    const biologyStudentQuery = query(collection(db, 'students'), where("schoolClassesShort", "array-contains", "Biology-1"));
    const biologyStudentQuerySnapshot = await getDocs(biologyStudentQuery);

    // will need to get all the skills under the Biology subject for the student
    const biologySchoolClassSkillsQuery = query(collection(db, 'schoolClassSkills'), where("schoolClass", "==", "Biology-1"));
    const biologySchoolClassSkillsQuerySnapshot = await getDocs(biologySchoolClassSkillsQuery);

    // get the skills subcollection
    //const biologySchoolClassSkillsQuery = query(collection(biologySchoolClassQuerySnapshot.docs[0].ref, 'skills'));
    //const biologySchoolClassSkillsQuerySnapshot = await getDocs(biologySchoolClassSkillsQuery);

    // generate a reference to the studentSkills collection
    const studentSkillsCollectionRef = collection(db, 'studentSkills');

    for (const studentDoc of biologyStudentQuerySnapshot.docs) {
        for (const schoolClassSkillsDoc of biologySchoolClassSkillsQuerySnapshot.docs) {
            // for those taking biology, check if there is a studentSkills collection entry for this student and the skill
            const studentSkillsQuery = query(studentSkillsCollectionRef, where("email", "==", studentDoc.data().email), where("skill", "==", schoolClassSkillsDoc.data().skill));
            const studentSkillsQuerySnapshot = await getDocs(studentSkillsQuery);
            if (studentSkillsQuerySnapshot.empty) {
                // create a new studentSkills document
                const tempMasteryScore = Math.round(Math.random()*100);
                const tempRetentionScore = Math.round(tempMasteryScore*Math.random());
                const tempNeedToRevise = (tempRetentionScore < tempMasteryScore/2); //need to check this logic

                const tempDependenciesMet = (Math.random() < 0.5);

                const tempStudentSkillDocument = {
                    "skillID" : schoolClassSkillsDoc.id,
                    "skill" : schoolClassSkillsDoc.data().skill,
                    "studentID" : studentDoc.id,
                    "firstName" : studentDoc.data().firstName,
                    "lastName" : studentDoc.data().lastName,
                    "email" : studentDoc.data().email,
                    "subject" : schoolClassSkillsDoc.data().subject,
                    "schoolClassID" : schoolClassSkillsDoc.data().schoolClassID,
                    "schoolClass" : schoolClassSkillsDoc.data().schoolClass,
                    "masteryScore" : tempMasteryScore,
                    "retentionScore" : tempRetentionScore,
                    "needToRevise" : tempNeedToRevise,
                    "areDependenciesMet" : tempDependenciesMet,
                    "decayValue" : 0.5,
                }

                await addDoc(studentSkillsCollectionRef, tempStudentSkillDocument);
            }
        }
    }
    
    console.log("Finished seeding");
}

main().catch(console.error);

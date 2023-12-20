import {getSkillFromDB,
        getStudentFromDB,
        getStudentSkillFromDB,
        getStudentSkillFromDBAll,
        getTeacherFromDB,
        getSchoolClassFromDB,
        getSchoolClassFromDBAll,
        getSkillsAggregateForClassFromDB,
        getStudentAggregatesForClassFromDB,
        updateNeedToReviseFlag,
        updateStudentSkillScores} from '../utils/databaseFunctions';

const dbFunctions = {getSkillFromDB,
                    getStudentFromDB,
                    getStudentSkillFromDB,
                    getStudentSkillFromDBAll,
                    getTeacherFromDB,
                    getSchoolClassFromDB,
                    getSchoolClassFromDBAll,
                    getSkillsAggregateForClassFromDB,
                    getStudentAggregatesForClassFromDB,
                    updateNeedToReviseFlag,
                    updateStudentSkillScores};

//just some api route for the database functions so I can access their content from the python script
export default async function dbFunctionHandler(req, res) {

  // Probably not necessary but I guess good practice to check the method
  if (req.method !== 'POST') {
    res.status(405).end(); 
    return;
  }
  
  //this just automatically determines which function to send back the result of based on the function name in the request body

  try {
    const { functionToCall, parameters } = req.body;
    const dbFunction = dbFunctions[functionToCall]; //picks the function to call from the list of functions above

    if (dbFunction) {

      //Pretty sure I have make sure the parameters are in the right order so that  the '...' thing correctly spreads the parameters out. I don't javascript has automatic param sorting.
      const result = await dbFunction(...Object.values(parameters)); 
      res.status(200).json(result);

    } else {

      //also shouldn't happen if I write just spell the function names right
      res.status(400).json({ error: 'Function name spell wrong?' }); 
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
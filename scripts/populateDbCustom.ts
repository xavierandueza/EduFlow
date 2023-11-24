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
            "skill_title" : "CQL",
            "decay_value" : 0.5,
            "dependencies" : ["SQL"],
            "subject_code" : "FIT3171",
            "theory" : "CQL is a language used to query databases, which is similar to SQL. However this is Cassandra Query Language"
        },
        {
            "skill_title" : "SQL",
            "decay_value" : 0.5,

            "subject_code" : "FIT3171",
            "theory" : "SQL is a language used to query databases"
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

    const studentSkillsDocuments = [
        {
            "email_address" : "xand0001@student.monash.edu",
            "subject_code" : "FIT3171",
            "skill_title" : "CQL",
            "mastery_score" : 0,
            "retention_score" : 0,
            "need_to_revise" : false,
            "decay_value" : 0.5,
        },
        {
            "email_address" : "xand0001@student.monash.edu",
            "subject_code" : "FIT3171",
            "skill_title" : "SQL",
            "mastery_score" : 0,
            "retention_score" : 0,
            "need_to_revise" : false,
            "decay_value" : 0.5,
        },
    ] 

    const skills_vec_collection = await astraDb.collection('skills_vec');
    for await (const { skill_title, decay_value, dependencies, subject_code, theory } of skillsDocuments) {
        const res = await skills_vec_collection.insertOne({
            skill_title,
            decay_value,
            dependencies,
            subject_code,
            theory
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
    for await (const { email_address, subject_code, skill_title, mastery_score, retention_score, need_to_revise, decay_value} of studentSkillsDocuments) {
        const res = await students_skills_vec_collection.insertOne({
            email_address,
            subject_code,
            skill_title,
            mastery_score,
            retention_score,
            need_to_revise,
            decay_value
        });
    }
}

main().catch(console.error);

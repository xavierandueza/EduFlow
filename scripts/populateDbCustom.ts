import { AstraDB } from "@datastax/astra-db-ts";
import 'dotenv/config'

async function main() {
    const {ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_NAMESPACE } = process.env;

    const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_REGION, ASTRA_DB_NAMESPACE);

    await astraDb.createCollection('skills_vec');

    const collection = await astraDb.collection('skills_vec');

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

    for await (const { skill_title, decay_value, dependencies, subject_code, theory } of skillsDocuments) {
        const res = await collection.insertOne({
            skill_title,
            decay_value,
            dependencies,
            subject_code,
            theory
        });
    }
}

main().catch(console.error);

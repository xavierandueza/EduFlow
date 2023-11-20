from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import json

def connect_to_db():
    """ Connect to the database and return the session object"""
    cloud_config = {
        'secure_connect_bundle': 'secure-connect-eduflow-ai-hack-2023.zip'
    }

    # This token JSON file is autogenerated when you download your token, 
    # if yours is different update the file name below
    with open("xavier@everdawn.ai-token.json") as f:
        secrets = json.load(f)

    CLIENT_ID = secrets["clientId"]
    CLIENT_SECRET = secrets["secret"]

    auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    session = cluster.connect()

    row = session.execute("select release_version from system.local").one()

    if row:
        print(row[0])
    else:
        print("An error occurred.")

    # Choose the keyspace
    session.set_keyspace('aihack2023')

    return session



def create_tables(session):
    """ Creates all of the required tables in the database """
    # Students Table
    cql_command = """
    DROP TABLE IF EXISTS students;
    """

    session.execute(cql_command)
    print("Students table successfully dropped")

    cql_command = """
    CREATE TABLE students (
        email_address text PRIMARY KEY,
        school text,
        student_id_no text,
        first_name text,
        last_name text,
        phone_number text,
        interests list<text>,
        career_paths list<text>,
        subjects list<text>
        );
    """

    session.execute(cql_command)
    print("Students table successfully created")

    # Subjects Table
    cql_command = """
    DROP TABLE IF EXISTS subjects;
    """

    session.execute(cql_command)
    print("Subjects table successfully dropped")

    cql_command = """
    CREATE TABLE subjects (
        subject_code text PRIMARY KEY,
        subject_name text,
        skills map<text, text>
    );
    """

    session.execute(cql_command)
    print("Subjects table successfully created")

    # Student_Skills Table
    cql_command = """
    DROP TABLE IF EXISTS student_skills;
    """

    session.execute(cql_command)
    print("student_skills table successfully dropped")

    cql_command = """
    CREATE TABLE student_skills (
        student_email text,
        subject_code text,
        skill_title text,
        mastery_score float,
        retention_score float,
        need_to_revise boolean,
        PRIMARY KEY ((student_email, subject_code), skill_title)
    );
    """

    session.execute(cql_command)
    print("Student_skills table successfully created")

def create_new_student(session, 
                       email_address, 
                       school, 
                       student_id_no, 
                       first_name, 
                       last_name, 
                       phone_number, 
                       interests, 
                       career_paths, 
                       subjects):
    """
    Creates a new student in the database, populating the students_skills table with all of the skills if they have subjects

    Args:
        session (database session): the database session
        email_address (string): the email address of the student
        school (string): the school of the student
        student_id_no (string): the student's ID number
        first_name (string): the student's first name
        last_name (string): the student's last name
        phone_number (string): the student's phone number
        interests (list): the student's interests
        career_paths (list): the student's career paths
        subjects (list): the student's subjects

    Returns:
        None

    Raises:
        Description of any errors that are raised.
    """
    cql_command = """
    INSERT INTO students (email_address, school, student_id_no, first_name, last_name, phone_number, interests, career_paths, subjects)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    session.execute(cql_command, [email_address, school, student_id_no, first_name, last_name, phone_number, interests, career_paths, subjects])
    print("New student successfully created")

    if len(subjects) > 0:
        for subject in subjects:
            cql_command = """
            SELECT skills FROM subjects
            WHERE subject_code = %s;
            """

            skills = session.execute(cql_command, [subject]).one()[0]

            for skill in skills:
                cql_command = """
                INSERT INTO student_skills (student_email, subject_code, skill_title, mastery_score, retention_score, need_to_revise)
                VALUES (%s, %s, %s, %s, %s, %s);
                """

                session.execute(cql_command, [email_address, subject, skill, 0.0, 0.0, False])
    
    print("Student skills successfully created")



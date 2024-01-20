"use client";
// Card that has the user details that they can edit. Will change depending on the user role
import { FirestoreParent, FirestoreStudent } from "@/app/utils/interfaces";
import { useState, useEffect, KeyboardEvent } from "react";
import {
  getStudentFromDb,
  getParentFromDb,
  handleProfileUpdate,
} from "@/app/utils/databaseFunctionsFirestore";
// for display purposes
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X, ChevronsUpDown, Check, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
// Form components
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// for the updateSession that I call in
import { Session } from "next-auth";
type UpdateSession = (data?: any) => Promise<Session | null>;
// import subject and yearLevelOptions
import * as subjectOptions from "@/app/data/SubjectOptions";
import yearLevelOptions from "@/app/data/YearLevelOptions";

// declare the formSchema
const formSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email address").min(1, "Required"),
  yearLevel: z.string(),
  subjects: z.array(z.string()).min(1, "Required"),
  school: z.string().min(1, "Required"),
  interests: z.array(z.string()).min(1, "Required"),
  tutoringGoal: z.string().min(1, "Required"),
});

const ProfileDisplay = ({
  id,
  role,
  studentAccountInfo,
  parentAccountInfo,
  updateSession,
}: {
  id: string;
  role: string;
  studentAccountInfo?: FirestoreStudent;
  parentAccountInfo?: FirestoreParent;
  updateSession: UpdateSession;
}) => {
  // Declaring constants
  const [studentData, setStudentData] =
    useState<FirestoreStudent>(studentAccountInfo);
  const [parentData, setParentData] =
    useState<FirestoreParent>(parentAccountInfo);
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // default to false

  // States for form stuff
  const [subjects, setSubjects] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [tempSubjects, setTempSubjects] = useState<string[]>([]);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>("");

  // on page render, check if we have the data for the right account. If not, we need to set it.
  useEffect(() => {
    if (role == "student" && !studentData) {
      // no student data passed in, so we need to get it from the database
      const fetchData = async () => {
        const data = await getStudentFromDb({
          id: id,
          role: role,
        });

        setStudentData(data);
      };

      fetchData();
    } else if (role === "parent" && !parentData) {
      // no parent data passed in, so we need to get it from the database
      const fetchData = async () => {
        const data = await getParentFromDb({
          id: id,
          role: role,
        });

        setParentData(data);
      };

      fetchData();
    }
  });

  // When the student data changes, we need to update the form states
  useEffect(() => {
    if (studentData) {
      setSubjects(studentData.subjects);
      setInterests(studentData.interests);
      setValue("firstName", studentData.firstName);
      setValue("lastName", studentData.lastName);
      setValue("email", studentData.email);
      setValue("yearLevel", studentData.yearLevel.toString());
      setValue("school", studentData.school);
      setValue("tutoringGoal", studentData.tutoringGoal);
    } else if (parentData) {
      // logic for this
      setValue("yearLevel", "12");
      setValue("school", "");
      setValue("tutoringGoal", "");
      setSubjects([]);
      setInterests([]);
    }
  }, [studentData]);

  // Now have the right data no matter how we loaded in. Just have to render details now.
  // create the zod form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // watch the role
  const { register, setValue } = form;

  // handle subject change
  const handleSelectSubject = (selectedSubject: string) => {
    if (!subjects.includes(selectedSubject)) {
      setSubjects((prevSubjects) => [...prevSubjects, selectedSubject]);
    }
  };

  // handle removing subject from list
  const removeSubjectFromList = (subject: string) => () => {
    setSubjects((prevSubjects) => prevSubjects.filter((s) => s !== subject));
  };

  // render subjects
  const RenderSubjects = () => {
    if (subjects.length === 0) {
      return <></>;
    } else {
      // want to render the subjects as badges with a little x mark next to them
      return (
        <>
          <div className="flex flex-wrap space-x-1.5">
            {subjects.map((subject) => (
              <Badge
                key={subject}
                className="px-2 py-1 bg-light-teal hover:bg-dark-teal mb-1"
              >
                <div className="flex flex-row items-center">
                  <div className="mx-0.5 font-bold text-xs">{subject}</div>
                  {isEditMode && (
                    <div
                      key={subject + "button"}
                      className="mx-0.5 hover:text-red-500"
                      onClick={removeSubjectFromList(subject)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </Badge>
            ))}
          </div>
        </>
      );
    }
  };

  const handleAddInterest = () => {
    if (currentInterest && !interests.includes(currentInterest)) {
      setInterests((prev) => [...prev, currentInterest]);
      setCurrentInterest(""); // Clear the input field
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      handleAddInterest();
    }
  };

  // handle removing interests from list
  const removeInterestFromList = (interest: string) => () => {
    setInterests((prevInterests) =>
      prevInterests.filter((i) => i !== interest)
    );
  };

  // render the interests
  const RenderInterests = () => {
    if (interests.length === 0) {
      return <></>;
    } else {
      // want to render the subjects as badges with a little x mark next to them
      return (
        <>
          <div className="flex flex-wrap space-x-1.5">
            {interests.map((interest) => (
              <Badge
                key={interest}
                className="px-2 py-1 bg-light-teal hover:bg-dark-teal mb-1"
              >
                <div className="flex flex-row items-center">
                  <div className="px-0.5 font-bold text-xs">{interest}</div>
                  {isEditMode && (
                    <div
                      key={interest + "button"}
                      className="mx-0.5 hover:text-red-500"
                      onClick={removeInterestFromList(interest)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </Badge>
            ))}
          </div>
        </>
      );
    }
  };

  useEffect(() => {
    setValue("subjects", subjects);
    setValue("interests", interests);
  }, [subjects, interests, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    handleProfileUpdate({
      id: id,
      role: role,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      yearLevel: Number(values.yearLevel),
      subjects: values.subjects,
      school: values.school,
      interests: values.interests,
      tutoringGoal: values.tutoringGoal,
    });

    // update the session
    /*
    updateSession({
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      email: values.email,
    });
    */

    setIsEditMode(false);
  };

  const handleCancel = () => {
    // reset the values
    setSubjects(studentData.subjects);
    setInterests(studentData.interests);
    setValue("firstName", studentData.firstName);
    setValue("lastName", studentData.lastName);
    setValue("email", studentData.email);
    setValue("yearLevel", studentData.yearLevel.toString());
    setValue("school", studentData.school);
    setValue("tutoringGoal", studentData.tutoringGoal);

    // toggle the edit mode
    setIsEditMode(false);
  };

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  // render the form component
  if (studentData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold flex items-center flex-row justify-between">
            Profile Details
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                disabled={!isEditMode}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Please enter your first name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                disabled={!isEditMode}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Please enter your last name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                disabled={!isEditMode}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Please enter your email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {role === "student" ? (
                <>
                  <FormField
                    control={form.control}
                    name="yearLevel"
                    disabled={!isEditMode}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Year Level
                        </FormLabel>
                        <Select
                          disabled={!isEditMode}
                          onValueChange={field.onChange}
                          defaultValue={studentData.yearLevel.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {yearLevelOptions.map((yearLevel) => (
                              <SelectItem
                                key={yearLevel.label}
                                value={yearLevel.value}
                              >
                                {yearLevel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subjects"
                    disabled={!isEditMode}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Subjects
                        </FormLabel>
                        {isEditMode && (
                          <div className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild className="w-full">
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "justify-between w-full",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  Select Subject
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="popover-content-width-same-as-its-trigger p-0">
                                <Command>
                                  <CommandInput placeholder="Search subject..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No subject found.
                                    </CommandEmpty>
                                    <CommandGroup heading="Science">
                                      {subjectOptions.scienceSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="English">
                                      {subjectOptions.englishSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Mathematics">
                                      {subjectOptions.mathematicsSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Humanities">
                                      {subjectOptions.humanitiesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Business & Economics">
                                      {subjectOptions.businessEconomicsSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Performing Arts">
                                      {subjectOptions.performingArtsSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Visual Arts">
                                      {subjectOptions.visualArtsSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Design Technologies">
                                      {subjectOptions.designTechnologiesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Health & Physical Education">
                                      {subjectOptions.healthPhysicalEducationSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Digital Technologies">
                                      {subjectOptions.digitalTechnologiesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Second Languages">
                                      {subjectOptions.secondLanguagesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Classical Languages">
                                      {subjectOptions.classicalLanguagesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="First Languages">
                                      {subjectOptions.firstLanguagesSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Other Languages">
                                      {subjectOptions.otherLanguageSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Other subjects">
                                      {subjectOptions.otherSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="VCE Vocational Majors">
                                      {subjectOptions.vceVocationalMajorSubjects.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandGroup heading="VCE VET Programs">
                                      {subjectOptions.vceVetPrograms.map(
                                        (subject) => (
                                          <CommandItem
                                            value={subject}
                                            key={subject + "-command"}
                                            onSelect={() => {
                                              handleSelectSubject(subject);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                subjects.includes(subject)
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {subject}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandSeparator />
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                        <FormMessage />
                        <RenderSubjects />
                        {/* Register the subjects */}
                        <input {...register("subjects")} type="hidden" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="school"
                    disabled={!isEditMode}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">School</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Please enter the name of your School"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    disabled={!isEditMode}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Interests
                        </FormLabel>
                        <FormDescription>
                          Your interests help us make content that is relevant,
                          and interesting to you.
                        </FormDescription>
                        {isEditMode && (
                          <div className="flex items-center">
                            <FormControl>
                              <Input
                                value={currentInterest}
                                onChange={(e) =>
                                  setCurrentInterest(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                                placeholder="Enter one or more interests"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={handleAddInterest}
                              size="icon"
                              className="ml-1.5"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                        <RenderInterests />
                        {/* Register the interests */}
                        <input {...register("interests")} type="hidden" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tutoringGoal"
                    disabled={!isEditMode}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Tutoring Goal
                        </FormLabel>
                        <FormDescription>
                          What do you want to achieve from tutoring?
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Please enter your tutoring goal"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  {/* Parent form - create dummy/default values for the remaining values */}
                </>
              )}
              <div className="space-x-2">
                {isEditMode ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    onClick={toggleEditMode}
                    className="hover:bg-light-teal"
                  >
                    Edit
                  </Button>
                )}

                {isEditMode && (
                  <Button
                    type="submit"
                    className="hover:bg-light-teal font-semibold"
                  >
                    Save
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
};

export default ProfileDisplay;

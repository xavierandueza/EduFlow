"use client";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Session } from "next-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, KeyboardEvent, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ChevronsUpDown, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createUser } from "@/app/_actions";
type UpdateSession = (data?: any) => Promise<Session | null>;

const scienceSubjects = [
  "Biology",
  "Chemistry",
  "Physics",
  "Environmental Science",
  "Psychology",
];

const englishSubjects = [
  "Bridging English as an Additional Language",
  "English and English as an Additional Language",
  "English Language",
  "Foundation English",
  "English Literature",
];

const mathematicsSubjects = [
  "Foundation Mathematics",
  "General Mathematics",
  "Mathematical Methods",
  "Specialist Mathematics",
];

const humanitiesSubjects = [
  "Classical Studies",
  "Geography",
  "History",
  "Philosophy",
  "Politics",
  "Religion and Society",
  "Sociology",
  "Texts and Traditions",
];

const businessEconomicsSubjects = [
  "Accounting",
  "Business Management",
  "Economics",
  "Industry and Enterprise",
  "Legal Studies",
];

const performingArtsSubjects = ["Dance", "Drama", "Music", "Theatre Studies"];

const visualArtsSubjects = [
  "Art Creative Practice",
  "Art Making and Exhibiting",
  "Media",
  "Visual Communication Design",
];

const designTechnologiesSubjects = [
  "Agricultural and Horticultural Studies",
  "Food Studies",
  "Product Design and Technologies",
  "Systems Engineering",
];

const healthPhysicalEducationSubjects = [
  "Health and Human Development",
  "Outdoor and Environmental Studies",
  "Physical Education",
];

const digitalTechnologiesSubjects = [
  "Algorithmics (HESS)",
  "Applied Computing",
];

const secondLanguagesSubjects = [
  "Arabic",
  "Chinese Second Language",
  "Chinese Second Language Advanced",
  "French",
  "German",
  "Greek",
  "Indonesian Second Language",
  "Italian",
  "Japanese Second Language",
  "Korean Second Language",
  "Spanish",
  "Vietnamese Second Language",
];

const classicalLanguagesSubjects = [
  "Classical Greek",
  "Classical Hebrew",
  "Latin",
];

const firstLanguagesSubjects = [
  "Chinese First Language",
  "Indonesian First Language",
  "Japanese First Language",
  "Korean First Language",
  "Vietnamese First Language",
];

const otherLanguageSubjects = [
  "Armenian",
  "Auslan",
  "Bengali",
  "Bosnian",
  "Chin Hakha",
  "Croatian",
  "Dutch",
  "Filipino",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Karen",
  "Khmer",
  "Macedonian",
  "Maltese",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Swedish",
  "Tamil",
  "Turkish",
  "Yiddish",
];

const otherSubjects = [
  "Extended Investigation",
  "Aboriginal Languages of Victoria",
  "Chinese Language, Culture and Society",
];

const vceVocationalMajorSubjects = [
  "VCE VM Literacy",
  "VCE VM Numeracy",
  "VCE VM Work Related Skills",
  "VCE VM Personal Development Skills",
];

const vceVetPrograms = [
  "Structured Workplace Learning Recognition for VET",
  "Agriculture, Horticulture, Conservation and Land Management",
  "Animal Studies",
  "Applied Fashion Design and Technology",
  "Applied Language",
  "Automotive",
  "Building and Construction",
  "Business",
  "Cisco",
  "Civil Infrastructure",
  "Community Services",
  "Creative and Digital Media",
  "Dance - VCE VET",
  "Electrical Industry",
  "Engineering",
  "Equine Studies",
  "Furnishing",
  "Hair and Beauty",
  "Health",
  "Hospitality",
  "Information, Digital Media and Technology",
  "Integrated Technologies",
  "Laboratory Skills",
  "Music Industry",
  "Plumbing",
  "Small Business",
  "Sport and Recreation",
];

const yearLevelOptions = [
  { value: "7", label: "Year 7" },
  { value: "8", label: "Year 8" },
  { value: "9", label: "Year 9" },
  { value: "10", label: "Year 10" },
  { value: "11", label: "Year 11" },
  { value: "12", label: "Year 12" },
];

const formSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email address").min(1, "Required"),
  role: z.enum(["parent", "student"]),
  yearLevel: z.enum(["7", "8", "9", "10", "11", "12", "N/A"]),
  subjects: z.array(z.string()).min(1, "Required"),
  school: z.string().min(1, "Required"),
  interests: z.array(z.string()).min(1, "Required"),
  tutoringGoal: z.string().min(1, "Required"),
  parentLink: z.string().optional(),
});

const SignupCard = ({
  session,
  updateSession,
}: {
  session: Session;
  updateSession: UpdateSession; // our updateSession func passed from main page
}) => {
  // Local state management for subjects and interests
  const [subjects, setSubjects] = useState<string[]>(["Biology"]);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>("");

  // create the zod form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: session?.user
      ? {
          firstName: session.user.name.split(" ")[0],
          lastName:
            session.user.name.split(" ")[
              session.user.name.split(" ").length - 1
            ], // last of name
          email: session.user.email,
          yearLevel: "12",
          interests: [],
          subjects: ["Biology"],
        }
      : {},
  });

  // watch the role
  const { handleSubmit, control, register, setValue, watch } = form;
  const role = watch("role");

  const isParent = watch("role") === "parent";

  useEffect(() => {
    if (isParent) {
      setValue("yearLevel", "N/A"); // default value for parents
      setValue("subjects", ["N/A"]); // default value for parents
      setValue("school", "N/A"); // default value for parents
      setValue("interests", ["N/A"]); // default value for parents
      setValue("tutoringGoal", "N/A"); // default value for parents
    } else {
      setValue("yearLevel", "12"); // default value for students
      setValue("subjects", ["Biology"]); // default value for students
      setValue("school", ""); // default value for students
      setValue("interests", []); // default value for students
      setValue("tutoringGoal", ""); // default value for students
    }
  }, [isParent, setValue]);

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
                {subject}
                <div
                  key={subject + "button"}
                  className="ml-1 hover:text-red-500"
                  onClick={removeSubjectFromList(subject)}
                >
                  <X className="h-3 w-3" />
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
                {interest}
                <div
                  key={interest + "button"}
                  className="ml-1 hover:text-red-500"
                  onClick={removeInterestFromList(interest)}
                >
                  <X className="h-3 w-3" />
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

  // handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    // server function handles the logic, I don't need to worry about it
    await createUser({
      id: session?.user?.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: values.role,
      image: session?.user?.image,
      yearLevel: Number(values.yearLevel),
      subjects: values.subjects,
      school: values.school,
      interests: values.interests,
      tutoringGoal: values.tutoringGoal,
      parentLink: values.parentLink,
      subscriptionActive: session?.user?.subscriptionActive,
      subscriptionName: session?.user?.subscriptionName,
    });

    // update the session
    updateSession({
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      email: values.email,
    });
  };

  if (session?.user) {
    // render the form component
    return (
      <div className="flex justify-center w-full py-10 bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        First Name
                      </FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Please enter your email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        You are a:
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel>Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="parent" />
                            </FormControl>
                            <FormLabel>Parent/Guardian</FormLabel>
                          </FormItem>
                        </RadioGroup>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Year Level
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Subjects
                          </FormLabel>
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
                                      {scienceSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="English">
                                      {englishSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Mathematics">
                                      {mathematicsSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Humanities">
                                      {humanitiesSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Business & Economics">
                                      {businessEconomicsSubjects.map(
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
                                      {performingArtsSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Visual Arts">
                                      {visualArtsSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Design Technologies">
                                      {designTechnologiesSubjects.map(
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
                                      {healthPhysicalEducationSubjects.map(
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
                                      {digitalTechnologiesSubjects.map(
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
                                      {secondLanguagesSubjects.map(
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
                                      {classicalLanguagesSubjects.map(
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
                                      {firstLanguagesSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Other Languages">
                                      {otherLanguageSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="Other subjects">
                                      {otherSubjects.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup heading="VCE Vocational Majors">
                                      {vceVocationalMajorSubjects.map(
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
                                      {vceVetPrograms.map((subject) => (
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
                                      ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandSeparator />
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            School
                          </FormLabel>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Interests
                          </FormLabel>
                          <FormDescription>
                            Your interests help us make content that is
                            relevant, and interesting to you.
                          </FormDescription>
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
                    <FormField
                      control={form.control}
                      name="parentLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Parent Link (Optional)
                          </FormLabel>
                          <FormDescription>
                            If your parent sent you a link, please paste that
                            link below.
                          </FormDescription>
                          <FormControl>
                            <Input {...field} placeholder="Your parent Link" />
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
                <div className="flex justify-end">
                  <Button type="submit" className="hover:bg-light-teal">
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default SignupCard;

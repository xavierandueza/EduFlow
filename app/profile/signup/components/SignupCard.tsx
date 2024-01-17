"use client";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus, UserPlus, User } from "lucide-react";

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
  yearLevel: z.enum(["7", "8", "9", "10", "11", "12"]),
  subjects: z.array(z.string()).min(1, "Required"),
  school: z.string().min(1, "Required"),
  interests: z.array(z.string()).min(1, "Required"),
  tutoringGoal: z.string().min(1, "Required"),
  parentLink: z.string().optional(),
});

const SignupCard = ({ session }: { session: Session }) => {
  // Local state management for subjects
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
                className="px-2 py-1 bg-light-teal hover:bg-dark-teal"
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
                className="px-2 py-1 bg-light-teal hover:bg-dark-teal"
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

  // handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  // watch the role
  const { handleSubmit, control, watch } = form;
  const role = watch("role");

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
                          <FormControl>
                            <Select
                              onValueChange={(subject) =>
                                handleSelectSubject(subject)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subjects you are taking" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Biology",
                                  "Chemistry",
                                  "Physics",
                                  "Maths",
                                  "English",
                                ].map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                          <RenderSubjects />
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
                          <div className="flex items-center">
                            <FormControl>
                              <Input
                                value={currentInterest}
                                onChange={(e) =>
                                  setCurrentInterest(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                                placeholder="Type and press enter to add an interest"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={handleAddInterest}
                              size="icon"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                          <FormMessage />
                          <RenderInterests />
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
                            link below
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
                  <></>
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

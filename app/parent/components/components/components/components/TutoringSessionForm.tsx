import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TutoringSession } from "@/app/utils/interfaces";
import { insertTutoringSession } from "@/app/utils/databaseFunctionsFirestore";
import { useTutoringSessions } from "../../../contexts/TutoringSessionContext";
import { db } from "@/app/firebase";
import { doc, collection } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

const subjectOptions = [{ value: "biology", label: "Biology" }];

const weekdayOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const formSchema = z.object({
  subject: z.string(),
  weekday: z.string(),
  startTime: z.number().gte(0).lte(2400),
  duration: z.number().gte(0).lte(75), // minutes now
});

const TutoringSessionForm = ({
  studentId,
  existingTutoringSessionId,
}: {
  studentId: string;
  existingTutoringSessionId?: string;
}) => {
  const { toast } = useToast();

  const { childTutoringSession, setChildTutoringSession } =
    useTutoringSessions();

  console.log(
    "existingTutoringSessionId in TutoringSessionForm",
    existingTutoringSessionId
  );

  const index = childTutoringSession.findIndex((session) =>
    session.hasOwnProperty(existingTutoringSessionId)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingTutoringSessionId
      ? {
          subject:
            childTutoringSession[index][existingTutoringSessionId].subject,
          weekday:
            childTutoringSession[index][existingTutoringSessionId].weekday,
          startTime:
            childTutoringSession[index][existingTutoringSessionId].startTime,
          duration:
            childTutoringSession[index][existingTutoringSessionId].duration,
        }
      : {
          subject: "biology",
          weekday: "monday",
          startTime: 1700,
          duration: 60,
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (existingTutoringSessionId) {
      try {
        // make a duplicate of the session context
        const newChildTutoringSession = [...childTutoringSession];
        // Modify the session context
        newChildTutoringSession[index][existingTutoringSessionId] =
          values as TutoringSession;

        await insertTutoringSession({
          studentId: studentId,
          tutoringSession: values as TutoringSession,
          tutoringSessionId: existingTutoringSessionId,
        });
        // Save to the context
        setChildTutoringSession(newChildTutoringSession);

        // toast notify that the session has been updated
        toast({
          title: "Tutoring Session Updated",
          description: "Your tutoring session has been updated.",
          duration: 3000,
        });
      } catch (error) {
        console.error(error);
        // toast notify that there was an issue
        toast({
          variant: "destructive",
          title: "Error updating tutoring session",
          description:
            "There was an error updating your tutoring session. Please try again later.",
          duration: 3000,
        });
      }
    } else {
      // create a new session in the db
      try {
        const newSessionRef = await doc(
          collection(db, "students", studentId, "tutoringSessions")
        );
        // get the new session Id
        const newSessionId = newSessionRef.id;

        // insert data into the db
        await insertTutoringSession({
          studentId: studentId,
          tutoringSession: values as TutoringSession,
          tutoringSessionId: newSessionId,
        });

        // logic for adding to the session context
        const updatedSessions = [
          ...childTutoringSession,
          { [newSessionId]: values as TutoringSession },
        ];
        setChildTutoringSession(updatedSessions);

        // toast notify that a new session has been created
        toast({
          title: "Tutoring Session Added",
          description: "Your new tutoring session has been added.",
          duration: 3000,
        });
      } catch (error) {
        console.error(error);
        // toast notify that there was an issue
        toast({
          variant: "destructive",
          title: "Error creating tutoring session",
          description:
            "There was an error creating your tutoring session. Please try again later.",
          duration: 3000,
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the subject for the tutoring session" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="weekday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day of the week for the tutoring session" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {weekdayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter the start time for the tutoring session"
                  onChange={(e) => {
                    try {
                      field.onChange(parseInt(e.target.value, 10));
                    } catch (error) {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Duration (Minutes)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter the duration for the tutoring session"
                  onChange={(e) => {
                    try {
                      field.onChange(parseInt(e.target.value, 10));
                    } catch (error) {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Button className="float-right hover:text-light-teal" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default TutoringSessionForm;

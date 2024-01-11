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
  existingTutoringSession,
}: {
  studentId: string;
  existingTutoringSessionId?: string;
  existingTutoringSession?: TutoringSession;
}) => {
  console.log("studentId on TutoringSessionForm.tsx file is: " + studentId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingTutoringSession
      ? {
          subject: existingTutoringSession.subject,
          weekday: existingTutoringSession.weekday,
          startTime: existingTutoringSession.startTime,
          duration: existingTutoringSession.duration,
        }
      : {
          subject: "biology",
          weekday: "monday",
          startTime: 1700,
          duration: 60,
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (existingTutoringSession) {
      await insertTutoringSession({
        studentId: studentId,
        tutoringSession: values as TutoringSession,
        tutoringSessionId: existingTutoringSessionId,
      });
    } else {
      await insertTutoringSession({
        studentId: studentId,
        tutoringSession: values as TutoringSession,
      });
    }
    console.log(`studentId: ${studentId}`);
    existingTutoringSession
      ? console.log(`existingTutoringSessionId: ${existingTutoringSessionId}`)
      : null;
    console.log(values);

    console.log("Successfully updated");
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

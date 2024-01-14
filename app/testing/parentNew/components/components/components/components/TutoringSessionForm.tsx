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
  FormDescription,
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
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const subjectOptions = [{ value: "biology", label: "Biology" }];

const formSchema = z.object({
  subject: z.string(),
  date: z.date().refine((date) => date >= new Date(), {
    message: "Date cannot be in the past",
  }),
  startTimeHour: z.number().gte(1).lte(12),
  startTimeMinute: z.number().gte(0).lte(59),
  isAM: z.boolean(),
  duration: z.number().gte(0).lte(75),
  repeats: z.boolean(),
});

const constructDateTime = ({
  date,
  startTimeHour,
  startTimeMinute,
  isAM,
}: {
  date: Date;
  startTimeHour: number;
  startTimeMinute: number;
  isAM: boolean;
}) => {
  if (isAM) {
    // if AM and the hour is 12, then we subtract 12 hours to convert to 24 hour time
    startTimeHour = startTimeHour % 12;
  } else {
    // if PM and the hour is not 12, then we add 12 hours to convert to 24 hour time
    if (startTimeHour !== 12) {
      startTimeHour = startTimeHour + 12;
    }
  }

  // set the correct time
  date.setHours(startTimeHour, startTimeMinute);

  // can reset the seconds and milliseconds, but it's not worth doing.
  return date;
};

const TutoringSessionForm = ({
  studentId,
  existingTutoringSessionId,
}: {
  studentId: string;
  existingTutoringSessionId?: string;
}) => {
  const currentDate = new Date();
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

  const extractDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return new Date(year, month, day);
  };

  const extractHour = (date: Date) => {
    const hour = date.getHours() % 12;

    return hour === 0 ? 12 : hour;
  };

  const extractIsAM = (date: Date) => {
    const isAM = date.getHours() < 12;

    return isAM;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingTutoringSessionId
      ? {
          subject:
            childTutoringSession[index][existingTutoringSessionId].subject,
          date: extractDate(
            childTutoringSession[index][existingTutoringSessionId].dateTime
          ),
          startTimeHour: extractHour(
            childTutoringSession[index][existingTutoringSessionId].dateTime
          ),
          startTimeMinute:
            childTutoringSession[index][
              existingTutoringSessionId
            ].dateTime.getMinutes(),
          isAM: extractIsAM(
            childTutoringSession[index][existingTutoringSessionId].dateTime
          ),
          duration:
            childTutoringSession[index][existingTutoringSessionId].duration,
          repeats:
            childTutoringSession[index][existingTutoringSessionId].repeats,
        }
      : {
          subject: "biology",
          date: addDays(currentDate, 7),
          startTimeHour: 5,
          startTimeMinute: 0,
          isAM: false,
          duration: 60,
          repeats: false,
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values: ");
    console.log(values);

    // construct the date time
    const dateTime = constructDateTime({
      date: values.date,
      startTimeHour: values.startTimeHour,
      startTimeMinute: values.startTimeMinute,
      isAM: values.isAM,
    });

    // print the dateTime for confirmation
    console.log(dateTime);

    // create the new tutoringSession
    const tutoringSession: TutoringSession = {
      subject: values.subject,
      dateTime: dateTime,
      duration: values.duration,
      repeats: values.repeats,
    };

    if (existingTutoringSessionId) {
      try {
        // make a duplicate of the session context
        const newChildTutoringSession = [...childTutoringSession];
        // Modify the session context
        newChildTutoringSession[index][existingTutoringSessionId] =
          tutoringSession;

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
          tutoringSession: tutoringSession,
          tutoringSessionId: newSessionId,
        });

        // logic for adding to the session context
        const updatedSessions = [
          ...childTutoringSession,
          { [newSessionId]: tutoringSession },
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
                    <SelectValue placeholder="Select subject" />
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarDaysIcon className="h-4 w-4 opacity-50 mr-2" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="flex flex-row">
          <div className="w-[70px]">
            <FormField
              control={form.control}
              name="startTimeHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="HH"
                      max="12"
                      min="1"
                      onChange={(e) => {
                        try {
                          let value = parseInt(e.target.value, 10);

                          // If the value exceeds 55, reset it to 55
                          if (value > 11) {
                            value = 12;
                          }
                          field.onChange(value);
                        } catch (error) {
                          field.onChange(e.target.value.toString());
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <p className="flex flex-col justify-end mx-2 font-semibold text-2xl py-1.5">
            :
          </p>
          <div className="flex flex-col justify-end w-[74px]">
            <FormField
              control={form.control}
              name="startTimeMinute"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="MM"
                      step="5"
                      max="59"
                      min="0"
                      onChange={(e) => {
                        try {
                          let value = parseInt(e.target.value, 10);

                          // If the value exceeds 55, reset it to 55
                          if (value > 59) {
                            value = 59;
                          }
                          field.onChange(value);
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
          </div>
          <div className="flex flex-col justify-end pl-2">
            <FormField
              control={form.control}
              name="isAM"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Button
                      variant="outline"
                      type="button" // Make sure to set the type to "button" to prevent form submission
                      className="hover:text-light-teal"
                      onClick={() => field.onChange(!field.value)}
                    >
                      {field.value ? "AM" : "PM"}
                    </Button>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
          </div>
        </div>
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
                  step="5"
                  min="30"
                  max="75"
                  onChange={(e) => {
                    try {
                      let value = parseInt(e.target.value, 10);

                      // If the value exceeds 55, reset it to 55
                      if (value > 75) {
                        value = 75;
                      } else if (value < 30 || isNaN(value)) {
                        // If the value is less than 0 or not a number, reset it to 0
                        value = 30;
                      }
                      field.onChange(value);
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
          name="repeats"
          render={({ field }) => (
            <FormItem className="">
              <div className="space-y-0.5">
                <FormLabel>Set as repeating</FormLabel>
                <FormDescription>
                  Do you want this tutoring session to repeat every week?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="float-right hover:text-light-teal" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default TutoringSessionForm;

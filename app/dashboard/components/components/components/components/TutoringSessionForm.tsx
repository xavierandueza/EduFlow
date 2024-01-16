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
import { format, addDays, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useRef, useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  mode: z.string(),
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
  date.setHours(startTimeHour, startTimeMinute, 0, 0);

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
  const [showRepeatsOption, setShowRepeatsOption] = useState(false);

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

  useEffect(() => {
    if (
      existingTutoringSessionId &&
      childTutoringSession[index][existingTutoringSessionId].repeats
    ) {
      setShowRepeatsOption(true);
    }
  }, [existingTutoringSessionId, childTutoringSession, index]);

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
          mode: "single",
        }
      : {
          subject: "biology",
          date: addDays(currentDate, 7),
          startTimeHour: 5,
          startTimeMinute: 0,
          isAM: false,
          duration: 60,
          repeats: false,
          mode: "single",
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

    // create the new tutoringSession, not doing the repeatsFromOriginalSessionId yet
    const tutoringSession: TutoringSession = {
      subject: values.subject,
      dateTime: dateTime,
      duration: values.duration,
      repeats: values.repeats,
    };

    // make a duplicate of the session context for modification
    let newChildTutoringSession = [...childTutoringSession];

    if (existingTutoringSessionId) {
      try {
        // Updating an existingTutoringSession
        if (
          values.mode === "single" &&
          childTutoringSession[index][existingTutoringSessionId].repeats &&
          values.repeats
        ) {
          // IF the mode is single AND the session was previously repeating AND is currently set to repeating
          // set the repeats value to false
          tutoringSession.repeats = false;

          // Create a DateTime that is a week from the current value
          const pushedBackDateTime = constructDateTime({
            date: addDays(
              childTutoringSession[index][existingTutoringSessionId].dateTime,
              6
            ) as Date, // add 7 days to the current date, not sure why I need to use 6 tbh, 0 indexing?
            startTimeHour:
              childTutoringSession[index][
                existingTutoringSessionId
              ].dateTime.getHours(),
            startTimeMinute:
              childTutoringSession[index][
                existingTutoringSessionId
              ].dateTime.getMinutes(),
            isAM:
              childTutoringSession[index][
                existingTutoringSessionId
              ].dateTime.getHours() < 12,
          });

          console.log("pushedBackDateTime: ", pushedBackDateTime);
          // Create a new session with this time
          const pushedBackTutoringSession: TutoringSession = {
            subject:
              childTutoringSession[index][existingTutoringSessionId].subject,
            dateTime: pushedBackDateTime,
            duration:
              childTutoringSession[index][existingTutoringSessionId].duration,
            repeats: true,
            repeatsFromOriginalSessionId:
              childTutoringSession[index][existingTutoringSessionId]
                .repeatsFromOriginalSessionId,
          };

          // Now for the new session
          // By definition this cannot repeat, so the repeatsFromOriginalSessionId is null
          tutoringSession.repeatsFromOriginalSessionId = null;

          // modify the session context
          newChildTutoringSession[index][existingTutoringSessionId] =
            tutoringSession;

          // insert the new childTutoringSession into this list
          const newSessionRef = await doc(
            collection(db, "students", studentId, "tutoringSessions")
          );

          newChildTutoringSession = [
            ...newChildTutoringSession,
            { [newSessionRef.id]: pushedBackTutoringSession },
          ];

          // new doc into db
          await insertTutoringSession({
            studentId: studentId,
            tutoringSession: pushedBackTutoringSession,
          });

          // update the childTutoringSession context with pushed back value
          setChildTutoringSession(newChildTutoringSession);

          // update the current document
          await insertTutoringSession({
            studentId: studentId,
            tutoringSession: tutoringSession,
            tutoringSessionId: existingTutoringSessionId,
          });

          // update the id for the tutoringSession
          newChildTutoringSession[index][existingTutoringSessionId] =
            tutoringSession;
        } else if (
          values.mode === "single" &&
          !childTutoringSession[index][existingTutoringSessionId].repeats
        ) {
          // IF the mode is single, wasn't repeating before, and now IS repeating
          // simple logic - just update the current one
          // set the repeatsFromOriginalSessionId
          tutoringSession.repeatsFromOriginalSessionId =
            existingTutoringSessionId;

          // modify the session context
          newChildTutoringSession[index][existingTutoringSessionId] =
            tutoringSession;

          // insert data into db
          await insertTutoringSession({
            studentId: studentId,
            tutoringSession: tutoringSession,
            tutoringSessionId: existingTutoringSessionId,
          });
        } else if (
          values.mode === "all" &&
          childTutoringSession[index][existingTutoringSessionId].repeats
        ) {
          // can only happen when its repeating
          // Need to update all the sessions that have the same repeatsFromOriginalSessionId
          // Pretty complex logic to do this.
          // Probably best to change the next one, then push back all of the rest 7 days from this?

          // simplify logic - for now just update the current one
          // set the repeatsFromOriginalSessionId
          tutoringSession.repeatsFromOriginalSessionId =
            childTutoringSession[index][
              existingTutoringSessionId
            ].repeatsFromOriginalSessionId;

          // modify the session context
          newChildTutoringSession[index][existingTutoringSessionId] =
            tutoringSession;

          // insert data into db
          await insertTutoringSession({
            studentId: studentId,
            tutoringSession: tutoringSession,
            tutoringSessionId: existingTutoringSessionId,
          });
        }

        // update session context from the if/else statements
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
        // create a new doc in the db
        const newSessionRef = await doc(
          collection(db, "students", studentId, "tutoringSessions")
        );
        // get the new session Id
        const newSessionId = newSessionRef.id;

        // set the repeatsFromOriginalSessionId
        tutoringSession.repeatsFromOriginalSessionId = values.repeats
          ? newSessionRef.id
          : null;

        // insert data into the db
        await insertTutoringSession({
          studentId: studentId,
          tutoringSession: tutoringSession,
          tutoringSessionId: newSessionId,
        });

        // logic for adding to the session context
        newChildTutoringSession = [
          ...childTutoringSession,
          { [newSessionId]: tutoringSession },
        ];
        setChildTutoringSession(newChildTutoringSession);

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
              <FormLabel className="font-semibold">Subject</FormLabel>
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
              <FormLabel className="font-semibold">Date</FormLabel>
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
                  <FormLabel className="font-semibold">Start Time</FormLabel>
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
              <FormLabel className="font-semibold">
                Session Duration (Minutes)
              </FormLabel>
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
        {/*If this is a repeating session, we don't want to show this */}
        {showRepeatsOption ? (
          <FormField
            control={form.control}
            name="repeats"
            render={({ field }) => <></>}
          />
        ) : (
          <FormField
            control={form.control}
            name="repeats"
            render={({ field }) => (
              <FormItem className="">
                <div className="space-y-0.5">
                  <FormLabel className="font-semibold">
                    Set as repeating
                  </FormLabel>
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
        )}
        {showRepeatsOption ? (
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Edit</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue="single"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="r1" />
                      <Label htmlFor="r1">Only this session</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="all" id="r2" />
                      <Label htmlFor="r2">
                        All recurring sessions at this time
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          ></FormField>
        ) : (
          <FormField
            control={form.control}
            name="mode"
            defaultValue="single"
            render={({ field }) => <></>}
          ></FormField>
        )}
        <Button className="float-right hover:text-light-teal" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default TutoringSessionForm;

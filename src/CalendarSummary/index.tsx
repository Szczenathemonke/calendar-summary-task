import React, { useEffect, useState } from "react";
import { getCalendarEvents } from "../api-client";

interface CalendarEvent {
  uuid: string;
  title: string;
  durationInMinutes: number;
}
interface CalendarDay {
  id: number;
  date: Date;
  numberOfEvents?: number;
  totalDuration?: number;
  longestEvent?: string;
  eventsArray: CalendarEvent[] | [];
}

function getWeek(): CalendarDay[] {
  const currentDate = new Date();
  let week = [];

  for (let i = 0; i < 7; i++) {
    let newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + i);
    const day: CalendarDay = {
      id: i,
      date: newDate,
      numberOfEvents: undefined,
      totalDuration: undefined,
      longestEvent: undefined,
      eventsArray: [],
    };
    week.push(day);
  }
  return week;
}
function getTotalDuration(eventArr: CalendarEvent[]): number {
  let result = 0;
  for (let i = 0; i < eventArr.length; i++) {
    result += eventArr[i].durationInMinutes;
  }
  return result;
}
function getLongestEvent(eventArr: CalendarEvent[]): string | undefined {
  let findMax = eventArr.reduce((acc, event) => {
    return Math.max(acc, event.durationInMinutes);
  }, 0);
  let result = eventArr.find((e) => e.durationInMinutes === findMax)?.title;

  return result;
}

const CalendarSummary: React.FunctionComponent = () => {
  const [events, setEvents] = useState<CalendarDay[] | []>([]);

  console.log(events);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<void>[] = [];
        const week = getWeek();
        week.forEach((day) => {
          const promise = getCalendarEvents(day.date)
            .then((res) => {
              setEvents((oldEvents) =>
                oldEvents.map((oldEvent) =>
                  oldEvent.id === day.id
                    ? {
                        ...oldEvent,
                        eventsArray: res,
                        numberOfEvents: res.length,
                        totalDuration: getTotalDuration(res),
                        longestEvent: getLongestEvent(res),
                      }
                    : oldEvent
                )
              );
            })
            .catch((rej) => console.error(rej));

          promises.push(promise);
        });
        await Promise.all(promises);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Calendar summary</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Number of events</th>
            <th>Total duration [min]</th>
            <th>Longest event</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.date.toISOString().slice(0, 10)}</td>
              <td>{e.numberOfEvents}</td>
              <td>{e.totalDuration}</td>
              <td>{e.longestEvent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarSummary;

// const week = getWeek();

//   useEffect(() => {
//     week.map((day) =>
//       getCalendarEvents(day.date)
//         .then((res) => {
//           day.eventsArray = res;
//           day.numberOfEvents = res.length;
//           day.totalDuration = getTotalDuration(res);
//           day.longestEvent = getLongestEvent(res);
//         })
//         .catch((rej) => console.error(rej))
//     );
//   }, [week]);
//   console.log(week);

// const [loading, setLoading] = useState<boolean>(true);

// useEffect(() => {
//   setEvents(getWeek());
//   events.map((day) =>
//     getCalendarEvents(day.date)
//       .then((res) => {
//         setEvents((old) => ({
//           ...old,
//           eventsArray: res,
//           numberOfEvents: res.length,
//           totalDuration: getTotalDuration(res),
//           longestEvent: getLongestEvent(res),
//         }));
//       })
//       .catch((rej) => console.error(rej))
//       .finally(() => setLoading(false))
//   );
//   if (loading) {

//     events.map((day) => getCalendarEvents(day.date));
//   }
// }, []);

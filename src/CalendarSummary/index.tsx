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

  const week = getWeek();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatedEvents = await Promise.all(
          week.map(async (day) => {
            try {
              const res = await getCalendarEvents(day.date);

              return {
                id: day.id,
                date: day.date,
                eventsArray: res,
                numberOfEvents: res.length,
                totalDuration: getTotalDuration(res),
                longestEvent: getLongestEvent(res),
              };
            } catch (error) {
              console.error(error);
              return {
                id: day.id,
                date: day.date,
                eventsArray: [],
                numberOfEvents: 0,
                totalDuration: 0,
                longestEvent: undefined,
              };
            }
          })
        );
        setEvents(updatedEvents);
      } catch (error) {
        console.error(error);
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
              <td className="text-center">
                {e.date.toISOString().slice(0, 10)}
              </td>
              <td className="text-center">{e.numberOfEvents}</td>
              <td className="text-center">{e.totalDuration}</td>
              <td>{e.longestEvent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarSummary;

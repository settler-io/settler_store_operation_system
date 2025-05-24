"use client";

import ja from "@fullcalendar/core/locales/ja";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { css } from "styled-system/css";

export type CalendarProps = {
  reservations: Array<{
    title: string;
    start: Date;
    end: Date;
    description: string;
  }>;
};

export function Calendar(props: CalendarProps) {
  return (
    <div
      className={css({
        width: "100%",
      })}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={props.reservations || []}
        weekends={true}
        headerToolbar={{
          start: "prevYear,nextYear",
          center: "title",
          end: "today prev,next",
        }}
        contentHeight={"600px"}
        locale={ja}
      />
    </div>
  );
}

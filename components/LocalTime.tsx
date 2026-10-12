"use client";

import { useEffect, useState } from "react";

/* The time where Abhishek is, on the location card. Rendered empty on the
   server and filled in on the client, so a static build never freezes a stale
   time into the page; the line holds its height either way. Ticks once a
   minute, on the minute. */
export default function LocalTime({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" });
    const update = () => setNow(format.format(new Date()));
    update();
    let interval = 0;
    const timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [timeZone]);

  return (
    <span className="local-time" suppressHydrationWarning>
      {now ?? " "}
    </span>
  );
}

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function TimeAgo({ date }: { date: Date }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const cb = () => {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    };

    const interval = setInterval(cb, 1000);

    cb();

    return () => {
      clearInterval(interval);
    };
  }, [date]);

  return <span>{timeAgo}</span>;
}

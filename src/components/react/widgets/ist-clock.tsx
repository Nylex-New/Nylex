import { useEffect, useState } from "react";

const ISTClock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();

      // Convert to IST (GMT+5:30)
      const options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      } as const;

      const istTime = new Intl.DateTimeFormat("en-GB", options).format(date);
      setTime(istTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-xs md:text-base tracking-tighter md:tracking-normal font-mono font-normal text-end">
      {time} GMT+5:30
    </p>
  );
};

export default ISTClock;

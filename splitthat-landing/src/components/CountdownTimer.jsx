import React, { useState, useEffect } from "react";

function CountdownTimer() {
  // Set the target date 4 days from now
  const targetDate = new Date("2025-08-28T18:00:00Z");

  // Function to calculate time remaining
  const calculateTimeRemaining = () => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      // The countdown is over
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  // Set up the timer to update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this effect runs only once

  // Return the JSX for the timer display
  return (
    <div className="countdown-timer flex justify-center space-x-[2rem] items-center text-center">
      <div className="time-unit flex flex-col space-y-0">
        <span className="font-bold text-[5rem]">{timeRemaining.days}</span>
        <span className="text-md">days</span>
      </div>
      <div className="time-unit flex flex-col space-y-0">
        <span className="font-bold text-[5rem]">{timeRemaining.hours}</span>
        <span className="text-md">hours</span>
      </div>
      <div className="time-unit flex flex-col space-y-0">
        <span className="font-bold text-[5rem]">{timeRemaining.minutes}</span>
        <span className="text-md">minutes</span>
      </div>
      <div className="time-unit flex flex-col space-y-0">
        <span className="font-bold text-[5rem]">{timeRemaining.seconds}</span>
        <span className="text-md">seconds</span>
      </div>
    </div>
  );
}

export default CountdownTimer;
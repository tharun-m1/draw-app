import { useEffect, useRef, useState } from "react";

function useScreenSize() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const handleResize = () => {
    if (timeRef.current !== null) {
      clearTimeout(timeRef.current);
    }
    timeRef.current = setTimeout(() => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }, 800);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeRef.current !== null) {
        clearTimeout(timeRef.current);
      }
    };
  }, []);

  return { width, height };
}

export default useScreenSize;

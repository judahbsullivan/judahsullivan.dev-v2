"use client";

export function Mouse() {
  return (
    <>
      <div
        id="mouse-circle"
        className="pointer-events-none z-50 fixed top-0 left-0 w-8 h-8 rounded-full bg-indigo-500 opacity-75 -translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        id="mouse-ring"
        className="pointer-events-none fixed z-50 top-0 left-0 w-8 h-8 rounded-full border-2 border-indigo-500 opacity-0 -translate-x-1/2 -translate-y-1/2 transform"
      ></div>
    </>
  );
}


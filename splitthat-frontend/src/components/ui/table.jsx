export function Table({ children }) {
  return (
    <table className="w-full border-separate border-spacing-0">
      {children}
    </table>
  );
}

export function THead({ children }) {
  return <thead className="bg-secondary">{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children }) {
  return <tr className="border-b last:border-b-0">{children}</tr>;
}

export function TH({ className = "", children }) {
  return (
    <th
      className={
        "sticky top-0 z-10 whitespace-nowrap px-3 py-2 text-left " +
        "text-sm font-semibold " +
        className
      }
    >
      {children}
    </th>
  );
}

export function TD({ className = "", children }) {
  return (
    <td className={"px-3 py-2 align-top text-sm " + className}>
      {children}
    </td>
  );
}
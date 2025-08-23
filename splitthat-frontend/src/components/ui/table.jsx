export function Table({ children }) {
  return (
    <div className="relative border rounded-lg overflow-hidden">
      <div className="overflow-auto h-full">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ children }) {
  return <thead>{children}</thead>;
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
        "sticky top-0 z-20 whitespace-nowrap px-3 py-2 " +
        "text-sm font-semibold bg-secondary/95 backdrop-blur-sm " +
        "border-b border-border " +
        className
      }
    >
      {children}
    </th>
  );
}

export function TD({ className = "", children }) {
  return (
    <td className={"px-3 py-2 text-sm bg-background " + className}>
      {children}
    </td>
  );
}
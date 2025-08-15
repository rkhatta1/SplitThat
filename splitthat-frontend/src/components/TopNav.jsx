export default function TopNav() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-14 items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary" />
          <span className="text-lg font-semibold">SplitThat</span>
        </div>
      </div>
    </header>
  );
}
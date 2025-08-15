import { useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Table, THead, TR, TH, TBody, TD } from "../components/ui/table";
import { useSplit } from "../state/SplitContext";
import { computeTotals } from "../utils/splitting";
import { money } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function ItemizedEditor() {
  const nav = useNavigate();
  const {
    participants,
    result,
    setResult,
    distribution,
    setDistribution
  } = useSplit();

  const [filter, setFilter] = useState("");

  if (!result) {
    return (
      <div className="min-h-full">
        <TopNav />
        <main className="container py-8">
          <p className="text-sm">
            No data. Go back to upload.
          </p>
          <Button className="mt-4" onClick={() => nav("/")}>
            Back to upload
          </Button>
        </main>
      </div>
    );
  }

  const items = result.items.filter((it) =>
    it.item_name?.toLowerCase?.().includes(filter.toLowerCase())
  );

  const totals = useMemo(
    () =>
      computeTotals(
        result.items,
        participants,
        result.tax,
        result.tip,
        distribution
      ),
    [result, participants, distribution]
  );

  function updateItem(idx, patch) {
    const next = [...result.items];
    next[idx] = { ...next[idx], ...patch };
    setResult({ ...result, items: next });
  }

  function toggleAssign(idx, person) {
    const current = result.items[idx].assigned_to || [];
    const has = current.includes(person);
    const next = has
      ? current.filter((p) => p !== person)
      : [...current, person];
    updateItem(idx, { assigned_to: next });
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "splitthat-result.json";
    a.click();
  }

  function getConfidenceClass(confidence) {
    switch (confidence) {
      case "high":
        return "bg-blue-100";
      case "medium":
        return "bg-green-100";
      default:
        return "";
    }
  }

  return (
    <div className="min-h-full">
      <TopNav />
      <main className="container py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-primary/10 px-4 py-3">
          <div className="font-semibold">
            Choose split options
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Tax:</span>
            <select
              value={distribution.tax}
              onChange={(e) =>
                setDistribution((d) => ({
                  ...d,
                  tax: e.target.value
                }))
              }
              className="rounded border bg-background px-2 py-1"
            >
              <option value="equal">Equal</option>
              <option value="proportional">Proportional</option>
            </select>
            <span className="ml-3">Tip:</span>
            <select
              value={distribution.tip}
              onChange={(e) =>
                setDistribution((d) => ({
                  ...d,
                  tip: e.target.value
                }))
              }
              className="rounded border bg-background px-2 py-1"
            >
              <option value="equal">Equal</option>
              <option value="proportional">Proportional</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-base font-medium">
                Itemized expense
              </div>
              <Input
                placeholder="Filter items…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="overflow-auto scrollbar-thin">
              <Table>
                <THead>
                  <TR>
                    <TH className="min-w-[220px]">Item</TH>
                    <TH className="min-w-[80px]">$</TH>
                    {participants.map((p) => (
                      <TH key={p} className="text-center">
                        {p}
                      </TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {items.map((it, idx) => {
                    const globalIdx = result.items.findIndex(
                      (g) => g.id === it.id
                    );
                    return (
                      <TR key={it.id} className="">
                        <TD className="">
                          <Input
                            className={`${getConfidenceClass(it.confidence)}`}
                            value={it.item_name || ""}
                            onChange={(e) =>
                              updateItem(globalIdx, {
                                item_name: e.target.value
                              })
                            }
                          />
                        </TD>
                        <TD>
                          <Input
                            type="number"
                            step="0.01"
                            value={it.price}
                            onChange={(e) =>
                              updateItem(globalIdx, {
                                price: e.target.value
                              })
                            }
                          />
                        </TD>
                        {participants.map((p) => (
                          <TD key={p} className="text-center">
                            <Checkbox
                              checked={
                                it.assigned_to?.includes(p) || false
                              }
                              onChange={() =>
                                toggleAssign(globalIdx, p)
                              }
                            />
                          </TD>
                        ))}
                      </TR>
                    );
                  })}

                  {/* Totals section */}
                  <TR>
                    <TD className="text-right font-medium">
                      Subtotal
                    </TD>
                    <TD className="font-medium">
                      ${totals.subtotal.toFixed(2)}
                    </TD>
                    <TD colSpan={participants.length}></TD>
                  </TR>

                  {result.tax?.amount ? (
                    <TR>
                      <TD className="text-right">+ Tax</TD>
                      <TD>${totals.taxAmount.toFixed(2)}</TD>
                      <TD colSpan={participants.length}></TD>
                    </TR>
                  ) : null}

                  {result.tip?.amount ? (
                    <TR>
                      <TD className="text-right">+ Tip</TD>
                      <TD>${totals.tipAmount.toFixed(2)}</TD>
                      <TD colSpan={participants.length}></TD>
                    </TR>
                  ) : null}

                  <TR>
                    <TD className="text-right font-semibold">
                      Grand total
                    </TD>
                    <TD className="font-semibold">
                      ${totals.grandTotal.toFixed(2)}
                    </TD>
                    <TD colSpan={participants.length}></TD>
                  </TR>

                  {/* Per person totals */}
                  <TR>
                    <TD className="text-right font-medium">
                      Per person
                    </TD>
                    <TD></TD>
                    {participants.map((p) => (
                      <TD key={p} className="text-center">
                        ${money(totals.totals[p]).toFixed(2)}
                      </TD>
                    ))}
                  </TR>
                </TBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => nav("/")}>
                Start over
              </Button>
              <Button onClick={exportJson}>Export JSON</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
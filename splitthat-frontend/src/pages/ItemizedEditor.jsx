import { useMemo, useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Table, THead, TR, TH, TBody, TD } from "../components/ui/table";
import { useSplit } from "../state/SplitContext";
import { computeTotals } from "../utils/splitting";
import { cn, money } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SidebarPane from "../components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MdDelete } from "react-icons/md";

export default function ItemizedEditor() {
  const nav = useNavigate();
  const {
    participants,
    result,
    setResult,
    distribution,
    setDistribution,
    currentUser,
    selectedGroup,
    groups,
    expenseId,
    open,
    setOpen,
    setCurrentSplit,
    setRefreshSplits,
    shopName,
    setShopName,
    paidBy,
    setPaidBy,
    dateOfPurchase,
    setDateOfPurchase
  } = useSplit();

  const [filter, setFilter] = useState("");
  
  

  useEffect(() => {
    if (result && shopName === "") {
      setShopName(result.shop_name || "Los Pollos Hermanos");
    } else if (result && dateOfPurchase === "") {
      setDateOfPurchase(result.date_of_purchase || "");
    }
  }, [result, shopName, dateOfPurchase]);

  useEffect(() => {
    if (currentUser && paidBy === null) {
      setPaidBy(currentUser.splitwise_id);
    }
  }, [currentUser, paidBy]);

  const selectedGroupName = useMemo(() => {
    if (selectedGroup && groups) {
      const group = groups.find((g) => g.id === parseInt(selectedGroup));
      return group ? group.name : null;
    }

    return null;
  }, [selectedGroup, groups]);

  if (!result) {
    return (
      <div className="min-h-full flex items-center justify-center">
        {/* <TopNav /> */}
        <main className="container py-8 w-full flex flex-col items-center">
          <p className="text-sm">No data. Go back to upload.</p>
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
        participants.map(
          (p) => `${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`
        ),
        result.tax,
        result.tip,
        distribution
      ),
    [result, participants, distribution]
  );

  function addItem(index) {
    const newItem = {
      // Create a unique ID to prevent key collisions and editing bugs
      id: `new-${Date.now()}`,
      item_name: "",
      price: 0,
      assigned_to: [],
      quantity: "1",
      status: "shopped",
      confidence: "high",
    };

    const nextItems = [...result.items];
    nextItems.splice(index + 1, 0, newItem); // Insert item at the next index
    setResult({ ...result, items: nextItems });
  }

  function deleteItem(itemId) {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const nextItems = result.items.filter((it) => it.id !== itemId);
      setResult({ ...result, items: nextItems });
    }
  }

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
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "splitthat-result.json";
    a.click();
  }

  function publishToSplitwise() {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      alert("Please login first.");
      return;
    }

    if (!currentUser) {
      alert(
        "Could not determine the current user. Please try logging in again."
      );
      cnsole.error("Current user is not set in SplitContext.");
      return;
    }

    console.log("Current user ID:", currentUser);

    // Format the comment
    let comment = "";
    result.items.forEach((item) => {
      comment += `${item.item_name} - ${item.price.toFixed(2)} (${item.assigned_to.join(", ")})\n`;
    });
    if (result.tax) {
      comment += `Tax: ${result.tax.amount.toFixed(2)}\n`;
    }
    if (result.tip) {
      comment += `Tip: ${result.tip.amount.toFixed(2)}\n`;
    }

    // Construct the users array with correct paid_share and owed_share
    const users = participants.map((p) => ({
      user_id: p.id,
      first_name: p.first_name,
      last_name: p.last_name || null,
      paid_share:
        p.id === paidBy
          ? totals.grandTotal.toFixed(2)
          : "0.00",
      owed_share:
        totals.totals[`${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`],
    }));

    // Fix rounding issues for owed_share
    const totalOwed = users.reduce(
      (sum, user) => sum + parseFloat(user.owed_share),
      0
    );
    const difference = totals.grandTotal - totalOwed;

    if (difference !== 0) {
      // Add the difference to the first user's owed_share
      users[0].owed_share = (
        parseFloat(users[0].owed_share) + difference
      ).toFixed(2);
    }

    // Convert owed_share to string with 2 decimal places
    users.forEach((user) => {
      user.owed_share = parseFloat(user.owed_share).toFixed(2);
    });

    // Construct the request body
    const title = `${shopName} - ${dateOfPurchase}`;
    const requestBody = {
      cost: totals.grandTotal,
      description: title, 
      users: users,
      items: result.items,
      subtotal: totals.subtotal,
      tax: result.tax,
      tip: result.tip,
      comment: comment,
      group_id: selectedGroup ? parseInt(selectedGroup) : null,
      expense_id: expenseId,
      title: title,
      distribution: distribution,
      date_of_purchase: dateOfPurchase,
      shop_name: shopName,
    };

    console.log("Request Body:", requestBody);

    api
      .fetch("http://localhost:8000/api/v1/publish-split", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })
      .then((response) => {
        if (response.ok) {
          alert("Split published successfully!");
          setCurrentSplit(null);
          setRefreshSplits(c => c + 1);
        } else {
          alert("Failed to publish split.");
        }
      })
      .catch((error) => {
        console.error("Error publishing split:", error);
        alert("An error occurred while publishing the split.");
      });
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
    <div className="max-h-screen flex flex-col overflow-hidden">
      {/* <TopNav /> */}
      <div className="flex flex-1 overflow-y-auto">
        <SidebarProvider>
        <SidebarPane />
        <main className="flex-1 container py-6 overflow-y-auto flex flex-col max-h-screen">
          <div className="mb-4 h-1/15 flex flex-wrap items-center justify-between gap-3 rounded-md bg-primary/10 px-4 py-3">
            <div className="font-semibold">Choose split options</div>
            <div className="flex items-center gap-2 text-sm">
              <span>Tax:</span>
              <select
                value={distribution.tax}
                onChange={(e) =>
                  setDistribution((d) => ({
                    ...d,
                    tax: e.target.value,
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
                    tip: e.target.value,
                  }))
                }
                className="rounded border bg-background px-2 py-1"
              >
                <option value="equal">Equal</option>
                <option value="proportional">Proportional</option>
              </select>
            </div>
          </div>

          <Card className={"flex-1 overflow-hidden"}>
            <CardContent className={"justify-between flex flex-col h-full"}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-base font-medium">
                  Itemized expense{" "}
                  {selectedGroupName && `- ${selectedGroupName}`}
                </div>
                <Input
                  placeholder="Filter items…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="Shop Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  type="date"
                  value={dateOfPurchase}
                  onChange={(e) => setDateOfPurchase(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(parseInt(e.target.value))}
                  className="rounded border bg-background px-2 py-1 max-w-xs"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name || ""}
                    </option>
                  ))}
                </select>
              </div>

                <Table>
                  <THead>
                    <TR>
                      <TH className="min-w-[220px] text-left">Item</TH>
                      <TH className="min-w-[80px] text-left">$</TH>
                      {participants.map((p) => (
                        <TH key={p.id}>
                          {`${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`}
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
                          <TD className="relative group">
                            <Input
                              className={`${getConfidenceClass(it.confidence)}`}
                              value={it.item_name || ""}
                              onChange={(e) =>
                                updateItem(globalIdx, {
                                  item_name: e.target.value,
                                })
                              }
                            />
                            <div className="absolute right-[1rem] backdrop-blur-none group-hover:backdrop-blur-sm top-1/2 flex -translate-y-1/2 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 mr-[0.4rem] text-lg bg-white opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => addItem(globalIdx)}
                              aria-label="Add item below"
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-red-400 hover:bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => deleteItem(it.id)}
                              aria-label="Delete item"
                            >
                              <MdDelete className="text-white" />
                            </Button>
                          </div>
                          </TD>
                          <TD>
                            <Input
                              type="number"
                              step="0.01"
                              value={it.price}
                              onChange={(e) =>
                                updateItem(globalIdx, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </TD>
                          {participants.map((p) => (
                            <TD key={p.id} className="text-center items-center justify-center">
                              <Checkbox
                                checked={
                                  it.assigned_to?.includes(
                                    `${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`
                                  ) || false
                                }
                                onChange={() =>
                                  toggleAssign(
                                    globalIdx,
                                    `${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`
                                  )
                                }
                              />
                            </TD>
                          ))}
                        </TR>
                      );
                    })}

                    {/* Totals section */}
                    <TR>
                      <TD className="text-right font-medium">Subtotal</TD>
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
                      <TD className="text-right font-semibold">Grand total</TD>
                      <TD className="font-semibold">
                        ${totals.grandTotal.toFixed(2)}
                      </TD>
                      <TD colSpan={participants.length}></TD>
                    </TR>

                    {/* Per person totals */}
                    <TR>
                      <TD className="text-right font-medium">Per person</TD>
                      <TD></TD>
                      {participants.map((p) => (
                        <TD key={p.id} className="text-center">
                          $
                          {money(
                            totals.totals[
                              `${p.first_name}${p.last_name ? ` ${p.last_name}` : ""}`
                            ]
                          ).toFixed(2)}
                        </TD>
                      ))}
                    </TR>
                  </TBody>
                </Table>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={() => nav("/")}>
                  Start over
                </Button>
                <Button onClick={exportJson}>Export JSON</Button>
                <Button onClick={publishToSplitwise}>
                  Publish to Splitwise
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        </SidebarProvider>
      </div>
    </div>
  );
}

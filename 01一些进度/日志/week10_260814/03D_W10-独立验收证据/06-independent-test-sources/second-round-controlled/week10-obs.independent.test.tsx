// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDeleteButton } from "../components/common/ConfirmDeleteButton";
import { TradeTable } from "../components/dashboard/DashboardShell";
import { createSimpleTrade } from "../test/fixtures";

afterEach(cleanup);

describe("Week 10 independent P2 observations", () => {
  it("OBS-01 records rejected Promise behavior without leaving permanent busy state", async () => {
    const user = userEvent.setup();
    const rejection = new Error("independent OBS-01 rejected Promise");
    const onConfirm = vi.fn(() => Promise.reject(rejection));

    render(
      <ConfirmDeleteButton
        ariaLabel="删除 OBS-01 记录"
        label="删除"
        onConfirm={onConfirm}
      />,
    );

    const button = screen.getByRole("button", {
      name: "删除 OBS-01 记录",
    });
    await user.click(button);
    await user.click(button);

    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(button.getAttribute("aria-busy")).toBe("false");
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it("OBS-02 records duplicate accessible delete names for same-type same-asset same-date trades", () => {
    const first = createSimpleTrade(
      "obs-02-first",
      "buy",
      "BTC",
      "0.1",
      "2026-07-25",
    );
    const second = {
      ...createSimpleTrade(
        "obs-02-second",
        "buy",
        "BTC",
        "0.2",
        "2026-07-25",
      ),
      price: first.price,
      totalValue: first.totalValue,
    };

    render(
      <TradeTable
        onDelete={() => "applied"}
        trades={[first, second]}
      />,
    );

    const buttons = screen.getAllByRole("button", {
      name: "删除 买入 BTC 2026-07-25",
    });
    expect(buttons).toHaveLength(2);
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createBackupEnvelope,
  parseBackupJson,
  serializeBackupEnvelope,
} from "../backup/backupEnvelope";
import { BackupControls } from "../components/backup/BackupControls";
import { createInitialLedgerData } from "../state/initialLedgerData";
import { createSimpleTrade } from "../test/fixtures";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const exportedAt = "2026-07-25T12:00:00.000Z";
const clock = { now: () => new Date(exportedAt) };
const limit = 8 * 1024 * 1024;

function renderControls(
  overrides: Partial<ComponentProps<typeof BackupControls>> = {},
) {
  const onImport = vi.fn(async () => ({ ok: true }));
  render(
    <BackupControls
      clock={clock}
      hydrationStatus="ready"
      isDirty={false}
      isReadOnly={false}
      ledgerData={createInitialLedgerData()}
      onImport={onImport}
      persistenceOperation="idle"
      persistenceStatus="idle"
      {...overrides}
    />,
  );
  return onImport;
}

function validSerialized(ledger = createInitialLedgerData()) {
  const envelope = createBackupEnvelope(ledger, {
    appVersion: "0.1.0",
    exportedAt,
  });
  if (!envelope.ok) throw new Error("valid backup fixture failed");
  return serializeBackupEnvelope(envelope.value);
}

function fileWithText(serialized: string, name = "ledger.json") {
  const file = new File([serialized], name, { type: "application/json" });
  const text = vi.fn(async () => serialized);
  Object.defineProperty(file, "text", { configurable: true, value: text });
  return { file, text };
}

function padTo(serialized: string, size: number) {
  const current = new TextEncoder().encode(serialized).byteLength;
  if (current > size) throw new Error("fixture larger than target");
  return `${serialized}${" ".repeat(size - current)}`;
}

function captureDownload() {
  const OriginalBlob = Blob;
  const calls: Array<{ parts?: BlobPart[]; options?: BlobPropertyBag }> = [];
  class CaptureBlob extends OriginalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      calls.push({ parts, options });
      super(parts, options);
    }
  }
  let filename = "";
  vi.stubGlobal("Blob", CaptureBlob);
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:independent-backup"),
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
    filename = this.download;
  });
  return { calls, filename: () => filename };
}

describe("T5-04 controlled BackupControls boundaries", () => {
  it("T5-04a dirty export captures the current in-memory ledger and labels it as rescue data", async () => {
    const ledger = createInitialLedgerData();
    ledger.trades = [
      createSimpleTrade("dirty-memory", "buy", "BTC", "1", "2026-07-25"),
    ];
    const capture = captureDownload();
    renderControls({
      ledgerData: ledger,
      isDirty: true,
      persistenceStatus: "saving",
    });
    await userEvent.setup().click(
      screen.getByRole("button", { name: "导出完整账本备份" }),
    );
    const serialized = capture.calls[0]?.parts?.[0];
    expect(typeof serialized).toBe("string");
    const parsed = parseBackupJson(String(serialized));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.ledgerData.trades[0].id).toBe("dirty-memory");
    expect(screen.getByText(/可能新于最后成功保存的版本/)).toBeTruthy();
    expect(capture.filename()).toMatch(/^local-first-trading-ledger-backup-v1-/);
  });

  it("T5-04b read-only export remains a plaintext rescue and never claims importability", async () => {
    const capture = captureDownload();
    renderControls({ isReadOnly: true });
    await userEvent.setup().click(
      screen.getByRole("button", { name: "导出完整账本备份" }),
    );
    expect(capture.calls).toHaveLength(1);
    expect(screen.getByText(/当前账本只读，仅可导出/)).toBeTruthy();
    expect(screen.getByText(/可能因集合或字符串超限而无法由当前版本重新导入/)).toBeTruthy();
  });

  it("T5-04c accepts an exact 8 MiB legal V1 file and reaches confirmation", async () => {
    const serialized = padTo(validSerialized(), limit);
    const fixture = fileWithText(serialized, "exact-8mib.json");
    renderControls();
    await userEvent.setup().upload(
      screen.getByLabelText("选择账本备份文件"),
      fixture.file,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "确认恢复备份" })).toBeTruthy(),
    );
    expect(fixture.file.size).toBe(limit);
    expect(fixture.text).toHaveBeenCalledOnce();
  });

  it("T5-04d rejects 8 MiB + 1 before File.text", async () => {
    const serialized = padTo(validSerialized(), limit + 1);
    const fixture = fileWithText(serialized, "over-8mib.json");
    renderControls();
    await userEvent.setup().upload(
      screen.getByLabelText("选择账本备份文件"),
      fixture.file,
    );
    expect(screen.getByText("无法导入：文件超过 8 MiB 限制。")).toBeTruthy();
    expect(fixture.file.size).toBe(limit + 1);
    expect(fixture.text).not.toHaveBeenCalled();
  });

  it("T5-04e isolates invalid JSON, wrong schema, future fact, and user cancel without import", async () => {
    const cases: Array<{ name: string; serialized: string; expected: RegExp }> = [];
    cases.push({ name: "bad.json", serialized: "{", expected: /BACKUP_BAD_JSON/ });
    cases.push({
      name: "schema.json",
      serialized: JSON.stringify({ backupFormatVersion: 99 }),
      expected: /BACKUP_/,
    });
    const future = createInitialLedgerData();
    future.trades = [
      createSimpleTrade("future-import", "buy", "BTC", "1", "2099-01-01"),
    ];
    cases.push({
      name: "future.json",
      serialized: validSerialized(future),
      expected: /LEDGER_IMPORT_FUTURE_FACT/,
    });
    for (const testCase of cases) {
      cleanup();
      const onImport = renderControls();
      const fixture = fileWithText(testCase.serialized, testCase.name);
      await userEvent.setup().upload(
        screen.getByLabelText("选择账本备份文件"),
        fixture.file,
      );
      await waitFor(() => expect(screen.getByText(testCase.expected)).toBeTruthy());
      expect(onImport).not.toHaveBeenCalled();
    }
    cleanup();
    const onImport = renderControls();
    const valid = fileWithText(validSerialized(), "cancel.json");
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText("选择账本备份文件"), valid.file);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "确认恢复备份" })).toBeTruthy(),
    );
    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(onImport).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "确认恢复备份" }),
    ).toBeNull();
  });

  it("T5-04f keeps the current ledger and shows no success when onImport fails", async () => {
    const onImport = vi.fn(async () => ({
      ok: false,
      code: "LEDGER_IMPORT_WRITE_FAILED",
    }));
    renderControls({ onImport });
    const fixture = fileWithText(validSerialized(), "write-failure.json");
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText("选择账本备份文件"), fixture.file);
    await user.click(screen.getByRole("button", { name: "确认恢复备份" }));
    await waitFor(() =>
      expect(
        screen.getByText("恢复写入失败，当前页面与本地记录未变更。"),
      ).toBeTruthy(),
    );
    expect(screen.queryByText("备份已恢复并保存到本地。")).toBeNull();
    expect(onImport).toHaveBeenCalledOnce();
  });
});

import type { RegisterState } from "../lib/registerTypes";

function downloadTextFile(
  fileName: string,
  fileContent: string,
  mimeType: string,
) {
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(
    new Blob([fileContent], { type: mimeType }),
  );
  downloadLink.download = fileName;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
}

export const exportBackupAsJson = (stationName: string, state: RegisterState) =>
  downloadTextFile(
    `${stationName}-backup.json`,
    JSON.stringify(
      {
        station: stationName,
        exportedAt: new Date().toISOString(),
        data: state,
      },
      null,
      2,
    ),
    "application/json",
  );

export function importBackupFromJson(
  backupFile: File,
  onBackupLoaded: (backupData: Partial<RegisterState>) => void,
) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    try {
      onBackupLoaded(JSON.parse(String(fileReader.result)).data);
    } catch {
      alert("This is not a valid backup file.");
    }
  };
  fileReader.readAsText(backupFile);
}

export function exportRowsAsCsv(
  fileName: string,
  rows: Record<string, unknown>[],
) {
  if (!rows.length) {
    alert("Nothing to export for this date.");
    return;
  }
  const columnNames = [...new Set(rows.flatMap(Object.keys))];
  const quoteCsvValue = (value: unknown) =>
    '"' + String(value ?? "").replace(/"/g, '""') + '"';
  downloadTextFile(
    fileName,
    [
      columnNames.map(quoteCsvValue).join(","),
      ...rows.map((row) =>
        columnNames
          .map((columnName) => quoteCsvValue(row[columnName]))
          .join(","),
      ),
    ].join("\n"),
    "text/csv",
  );
}

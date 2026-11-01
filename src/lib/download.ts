export function download(text: string, name: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

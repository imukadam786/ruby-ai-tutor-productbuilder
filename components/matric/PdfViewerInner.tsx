"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import type { ToolbarPlugin, ToolbarSlot, TransformToolbarSlot } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PdfViewerInner({ url }: { url: string }) {
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    // Strip easy-download and print vectors from the toolbar
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    Print: () => <></>,
    PrintMenuItem: () => <></>,
    Open: () => <></>,
    OpenMenuItem: () => <></>,
  });

  // renderDefaultToolbar is assigned synchronously right after plugin creation;
  // the renderToolbar closure only executes during React render (after this block)
  let renderDefaultToolbar!: ToolbarPlugin["renderDefaultToolbar"];

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
    ),
  });

  renderDefaultToolbar =
    defaultLayoutPluginInstance.toolbarPluginInstance.renderDefaultToolbar;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div
        style={{ height: "100%", userSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
}

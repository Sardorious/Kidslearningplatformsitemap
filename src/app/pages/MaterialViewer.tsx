import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import { ArrowLeft, FileText, Image, Music, Video, File } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   MaterialViewer – Internal, non-downloadable media viewer
   Route: /material/view?url=...&type=...&name=...
   ───────────────────────────────────────────────────────── */

function getCategory(type: string, url: string): "pdf" | "doc" | "image" | "audio" | "video" | "unknown" {
    const t = type.toLowerCase();
    const ext = url.split(".").pop()?.toLowerCase() || "";

    if (t === "pdf" || ext === "pdf") return "pdf";
    if (["doc", "docx", "document"].includes(t) || ["doc", "docx"].includes(ext)) return "doc";
    if (t === "image" || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
    if (t === "audio" || ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
    if (t === "video" || ["mp4", "webm", "ogv", "mov", "avi"].includes(ext)) return "video";
    return "unknown";
}

// Blocks right-click context menu on a DOM element
function useNoRightClick(ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const block = (e: MouseEvent) => e.preventDefault();
        el.addEventListener("contextmenu", block);
        return () => el.removeEventListener("contextmenu", block);
    }, [ref]);
}

/* ── PDF Reader ── */
function PdfReader({ url, name }: { url: string; name: string }) {
    // Append params to hide Chrome's built-in PDF toolbar/download button
    const safeUrl = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

    return (
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl">
            {/* Overlay prevents direct interaction with Chrome's download button */}
            <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-inner">
                <iframe
                    src={safeUrl}
                    title={name}
                    className="w-full h-full"
                    style={{ border: "none", minHeight: "75vh" }}
                />
                {/* Transparent overlay on top-right corner to block Chrome PDF download icon */}
                <div
                    className="absolute top-0 right-0 w-12 h-12 z-10"
                    style={{ background: "transparent" }}
                    onContextMenu={e => e.preventDefault()}
                />
            </div>
        </div>
    );
}

/* ── DOC Viewer (via Google Docs embed) ── */
function DocViewer({ url, name }: { url: string; name: string }) {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-inner">
            <iframe
                src={viewerUrl}
                title={name}
                className="w-full"
                style={{ border: "none", minHeight: "75vh" }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
        </div>
    );
}

/* ── Image Viewer ── */
function ImageViewer({ url, name }: { url: string; name: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useNoRightClick(ref as React.RefObject<HTMLElement>);

    return (
        <div
            ref={ref}
            className="flex-1 flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden border border-gray-800 min-h-[60vh]"
            style={{ userSelect: "none" }}
        >
            <img
                src={url}
                alt={name}
                draggable={false}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                style={{ userSelect: "none", WebkitUserDrag: "none" } as any}
                onContextMenu={e => e.preventDefault()}
            />
        </div>
    );
}

/* ── Audio Player ── */
function AudioPlayer({ url, name }: { url: string; name: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl min-h-[40vh] p-10 gap-6 border border-purple-700">
            <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm">
                <Music className="w-14 h-14 text-white" />
            </div>
            <div className="text-center">
                <p className="text-xl font-black text-white mb-1">{name}</p>
                <p className="text-purple-300 text-sm">Audio Track</p>
            </div>
            {/* controlsList="nodownload" removes the download button from the audio controls */}
            <audio
                controls
                controlsList="nodownload noremoteplayback"
                className="w-full max-w-md rounded-xl"
                onContextMenu={e => e.preventDefault()}
            >
                <source src={url} />
                Your browser does not support audio playback.
            </audio>
        </div>
    );
}

/* ── Video Player ── */
function VideoPlayer({ url, name }: { url: string; name: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    useNoRightClick(ref as React.RefObject<HTMLElement>);

    return (
        <div className="flex-1 flex flex-col gap-4">
            <div className="relative bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                {/* controlsList="nodownload" removes download button from the video controls */}
                <video
                    ref={ref}
                    controls
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    className="w-full max-h-[75vh]"
                    onContextMenu={e => e.preventDefault()}
                >
                    <source src={url} />
                    Your browser does not support video playback.
                </video>
            </div>
            <p className="text-center text-sm text-gray-500">{name}</p>
        </div>
    );
}

/* ── Unknown Fallback ── */
function UnknownViewer({ name }: { name: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <File className="w-16 h-16 text-gray-300" />
            <div>
                <p className="text-lg font-black text-gray-700">{name}</p>
                <p className="text-gray-400 text-sm mt-1">This file type cannot be previewed in the browser.</p>
            </div>
        </div>
    );
}

/* ── Type icons ── */
const categoryIcons: Record<string, { icon: any; label: string; color: string }> = {
    pdf: { icon: FileText, label: "PDF Document", color: "text-red-500 bg-red-50" },
    doc: { icon: FileText, label: "Document", color: "text-blue-500 bg-blue-50" },
    image: { icon: Image, label: "Image", color: "text-green-500 bg-green-50" },
    audio: { icon: Music, label: "Audio", color: "text-purple-500 bg-purple-50" },
    video: { icon: Video, label: "Video", color: "text-orange-500 bg-orange-50" },
    unknown: { icon: File, label: "File", color: "text-gray-500 bg-gray-100" },
};

/* ── Main Component ── */
export function MaterialViewer() {
    const [params] = useSearchParams();
    const url = params.get("url") || "";
    const type = params.get("type") || "";
    const name = params.get("name") || "Material";

    const category = getCategory(type, url);
    const meta = categoryIcons[category];
    const Icon = meta.icon;

    // Prevent keyboard shortcuts for saving (Ctrl+S, Ctrl+Shift+S)
    useEffect(() => {
        const block = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
                e.preventDefault();
            }
        };
        window.addEventListener("keydown", block);
        return () => window.removeEventListener("keydown", block);
    }, []);

    if (!url) {
        return (
            <div className="text-center py-20">
                <div className="text-5xl mb-4">🔗</div>
                <p className="text-xl font-bold text-gray-700">No file URL provided.</p>
                <Link to="/" className="text-purple-600 hover:underline text-sm mt-2 inline-block">← Go Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-purple-400 hover:text-purple-700 hover:shadow-md transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex-1" />

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${meta.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-2xl font-black text-gray-900 truncate">{name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">Viewing in internal {meta.label.toLowerCase()} viewer · Downloads disabled</p>
            </div>

            {/* Content area */}
            <div className="flex flex-col min-h-[60vh]">
                {category === "pdf" && <PdfReader url={url} name={name} />}
                {category === "doc" && <DocViewer url={url} name={name} />}
                {category === "image" && <ImageViewer url={url} name={name} />}
                {category === "audio" && <AudioPlayer url={url} name={name} />}
                {category === "video" && <VideoPlayer url={url} name={name} />}
                {category === "unknown" && <UnknownViewer name={name} />}
            </div>
        </div>
    );
}

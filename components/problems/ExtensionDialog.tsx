"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Puzzle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Zap,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export function ExtensionDialog() {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  function checkInstallation() {
    if (typeof window === "undefined") return;
    const installed =
      document.documentElement.dataset.dsaTrackerInstalled === "true" ||
      Boolean((window as unknown as { __DSA_TRACKER_EXTENSION_INSTALLED__?: boolean }).__DSA_TRACKER_EXTENSION_INSTALLED__);
    setIsInstalled(installed);
  }

  useEffect(() => {
    const timer = setTimeout(checkInstallation, 0);

    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "DSA_TRACKER_EXTENSION_READY" ||
        event.data?.type === "DSA_SUBMISSION_CODE_RESULT"
      ) {
        setIsInstalled(true);
      }
    }

    window.addEventListener("message", handleMessage);
    const interval = setInterval(checkInstallation, 2500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, []);

  function handleCopyExtensionsUrl() {
    navigator.clipboard.writeText("chrome://extensions");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  function handleCopyBuildCmd() {
    navigator.clipboard.writeText("pnpm extension:build");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-[#444444] bg-[#262626] text-zinc-200 hover:bg-[#333333] hover:text-white hover:border-zinc-500 shadow-xs cursor-pointer text-xs sm:text-sm font-medium"
            aria-label="Browser Extension Status and Setup"
          >
            <Puzzle className="size-4 text-primary" />
            <span className="hidden sm:inline">Chrome Extension</span>
            <span className="sm:hidden">Extension</span>
            {isInstalled ? (
              <span className="flex size-2 rounded-full bg-emerald-500" title="Extension Connected" />
            ) : (
              <span className="flex size-2 rounded-full bg-amber-500/80 animate-pulse" title="Extension Not Detected" />
            )}
          </Button>
        }
      />

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-[#222222] border-[#383838] text-white p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/20">
              <Puzzle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight">
                DSA Tracker Extension
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-zinc-400">
                Bridge LeetCode submissions directly into your personal knowledge playbook.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Status Indicator Card */}
          <div
            className={`flex items-start gap-3.5 rounded-xl border p-4 ${
              isInstalled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            {isInstalled ? (
              <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">
                  {isInstalled ? "Extension Active & Connected" : "Extension Not Detected"}
                </span>
                <button
                  type="button"
                  onClick={checkInstallation}
                  className="text-xs flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                  title="Re-check status"
                >
                  <RefreshCw className="size-3" />
                  <span>Check</span>
                </button>
              </div>
              <p className="text-xs mt-1 text-zinc-300 leading-relaxed">
                {isInstalled
                  ? "The extension content bridge is active in this tab. New submissions on LeetCode will automatically capture code and sync metrics."
                  : "If you have already installed the extension, ensure it is enabled in your browser and refresh the page."}
              </p>
            </div>
          </div>

          {/* Key Features Pill Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            <div className="rounded-lg border border-[#383838] bg-[#1a1a1a] p-3 space-y-1">
              <Zap className="size-4 text-amber-400" />
              <div className="text-xs font-semibold text-white">Live Capture</div>
              <div className="text-[11px] text-zinc-400 leading-normal">
                Auto-records runtime, memory, and code upon submit.
              </div>
            </div>
            <div className="rounded-lg border border-[#383838] bg-[#1a1a1a] p-3 space-y-1">
              <Code2 className="size-4 text-cyan-400" />
              <div className="text-xs font-semibold text-white">Code Extraction</div>
              <div className="text-[11px] text-zinc-400 leading-normal">
                Fetch historical code directly into your problem view.
              </div>
            </div>
            <div className="rounded-lg border border-[#383838] bg-[#1a1a1a] p-3 space-y-1">
              <ShieldCheck className="size-4 text-emerald-400" />
              <div className="text-xs font-semibold text-white">Private & Direct</div>
              <div className="text-[11px] text-zinc-400 leading-normal">
                Securely syncs to your authenticated account.
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-3 rounded-xl border border-[#383838] bg-[#1a1a1a] p-4 sm:p-5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Installation & Setup Guide
            </h4>

            <ol className="space-y-3 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  1
                </span>
                <div className="flex-1 min-w-0">
                  <span>Build the extension bundle:</span>
                  <div className="mt-1 flex items-center gap-2 rounded-md bg-[#262626] border border-[#444444] px-2.5 py-1.5 font-mono text-xs text-zinc-200">
                    <span className="flex-1 truncate select-all">pnpm extension:build</span>
                    <button
                      type="button"
                      onClick={handleCopyBuildCmd}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  2
                </span>
                <div className="flex-1 min-w-0">
                  <span>Navigate to Chrome Extensions page:</span>
                  <div className="mt-1 flex items-center gap-2 rounded-md bg-[#262626] border border-[#444444] px-2.5 py-1.5 font-mono text-xs text-zinc-200">
                    <span className="flex-1 truncate select-all">chrome://extensions</span>
                    <button
                      type="button"
                      onClick={handleCopyExtensionsUrl}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  3
                </span>
                <div className="flex-1">
                  <span>
                    Enable <strong>Developer mode</strong> in the top-right corner.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  4
                </span>
                <div className="flex-1">
                  <span>
                    Click <strong>Load unpacked</strong> and select the{" "}
                    <code className="rounded bg-[#262626] px-1.5 py-0.5 font-mono text-zinc-200 border border-[#444444]">
                      extension/
                    </code>{" "}
                    folder of this repository.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  5
                </span>
                <div className="flex-1">
                  <span>
                    Click the extension icon in your toolbar, log in with your account, and solve any problem on LeetCode!
                  </span>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href="https://leetcode.com/problemset/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>Open LeetCode Problemset</span>
            <ExternalLink className="size-3" />
          </a>

          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-[#444444] bg-[#262626] text-zinc-200 hover:bg-[#333333] hover:text-white"
              >
                Close
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

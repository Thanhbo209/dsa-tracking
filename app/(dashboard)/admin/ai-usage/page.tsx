import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { getActiveModel } from "@/lib/analysis/model-state";
import { getPrimaryModel, getFallbackModel } from "@/lib/analysis/models";
import {
  Cpu,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Model Quota & Usage Monitor",
  description: "Live state, quota cooldowns, and automatic failover audit log.",
};

export default async function AiUsageAdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/admin/ai-usage");
  }

  const authorized = isAdminUser(user);
  if (!authorized) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#222222] border border-red-900/40 rounded-xl p-6 text-center">
          <ShieldAlert className="size-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Access Denied</h2>
          <p className="text-xs text-zinc-400 mt-2">
            Your account ({user.email}) does not have administrative privileges to view AI model quota metrics.
          </p>
        </div>
      </div>
    );
  }

  // Ensure active model state is resolved and cooldowns evaluated
  await getActiveModel();

  const [state, switchEvents, modelAnalysisGroups] = await Promise.all([
    prisma.aiModelState.findUnique({
      where: { id: "default" },
    }),
    prisma.aiModelSwitchEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.submissionAnalysis.groupBy({
      by: ["modelName", "status"],
      _count: { _all: true },
    }),
  ]);

  const primaryModel = state?.primaryModel || getPrimaryModel();
  const fallbackModel = state?.fallbackModel || getFallbackModel();
  const activeModel = state?.activeModel || primaryModel;
  const inCooldown = state?.inCooldown && state.cooldownExpiresAt ? state.cooldownExpiresAt > new Date() : false;

  // Aggregate model stats
  const statsByModel: Record<string, { total: number; successful: number; failed: number }> = {};
  for (const group of modelAnalysisGroups) {
    const model = group.modelName || "unknown";
    if (!statsByModel[model]) {
      statsByModel[model] = { total: 0, successful: 0, failed: 0 };
    }
    statsByModel[model].total += group._count._all;
    if (group.status === "FAILED") {
      statsByModel[model].failed += group._count._all;
    } else {
      statsByModel[model].successful += group._count._all;
    }
  }

  const adminEmailsConfigured = Boolean(process.env.ADMIN_EMAILS);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383838] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="size-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Quota & Failover Monitor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time tracking of active Gemini models, automatic quota failovers, and rate-limit cooldown windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!adminEmailsConfigured ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40"
              title="ADMIN_EMAILS is not set in environment variables. Access is open to all authenticated users."
            >
              <Info className="size-3.5" />
              Auth Mode: Open Authenticated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <CheckCircle2 className="size-3.5" />
              Role: Restricted Admin
            </span>
          )}
        </div>
      </div>

      {/* Status Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Model */}
        <div className="bg-[#222222] border border-[#383838] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Current Active Model
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                activeModel === primaryModel
                  ? "bg-blue-950 text-blue-400 border border-blue-800"
                  : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}
            >
              {activeModel === primaryModel ? "Primary" : "Fallback"}
            </span>
          </div>
          <div className="mt-3 font-mono text-xl font-bold text-white tracking-tight">
            {activeModel}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Primary: <code className="text-zinc-300">{primaryModel}</code>
            <br />
            Fallback: <code className="text-zinc-300">{fallbackModel}</code>
          </p>
        </div>

        {/* Card 2: Cooldown State */}
        <div className="bg-[#222222] border border-[#383838] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Failover / Cooldown Status
            </span>
            {inCooldown ? (
              <AlertTriangle className="size-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-3 text-lg font-bold">
            {inCooldown ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                Cooldown Active
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                Healthy (No Active Cooldown)
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {inCooldown && state?.cooldownExpiresAt ? (
              <span>
                Expires:{" "}
                <strong className="text-zinc-200">
                  {new Date(state.cooldownExpiresAt).toLocaleString()}
                </strong>
              </span>
            ) : (
              <span>Requests route directly to active model without delay.</span>
            )}
          </div>
        </div>

        {/* Card 3: Switch Statistics */}
        <div className="bg-[#222222] border border-[#383838] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total Failover Events
            </span>
            <ArrowRightLeft className="size-4 text-zinc-400" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-white tracking-tight">
            {switchEvents.length}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Last switch:{" "}
            {state?.lastSwitchedAt ? (
              <span className="text-zinc-300">
                {new Date(state.lastSwitchedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-zinc-500">None recorded</span>
            )}
          </p>
        </div>
      </div>

      {/* Model Analysis Volume & Reliability */}
      <div className="bg-[#222222] border border-[#383838] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#383838]">
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Analyses by Model
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f1f] text-zinc-400 border-b border-[#383838]">
              <tr>
                <th className="px-5 py-3 font-medium">Model Name</th>
                <th className="px-5 py-3 font-medium">Total Runs</th>
                <th className="px-5 py-3 font-medium">Successful</th>
                <th className="px-5 py-3 font-medium">Failed</th>
                <th className="px-5 py-3 font-medium">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e] font-mono text-zinc-300">
              {Object.keys(statsByModel).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-zinc-500 font-sans">
                    No submission analyses recorded yet.
                  </td>
                </tr>
              ) : (
                Object.entries(statsByModel).map(([model, stats]) => {
                  const rate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
                  return (
                    <tr key={model} className="hover:bg-[#282828] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                        {model}
                        {model === activeModel && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">{stats.total}</td>
                      <td className="px-5 py-3.5 text-emerald-400">{stats.successful}</td>
                      <td className="px-5 py-3.5 text-red-400">{stats.failed}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-sans">
                          <span>{rate}%</span>
                          <div className="w-20 bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failover Switch Audit Log */}
      <div className="bg-[#222222] border border-[#383838] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#383838] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Failover Switch Event Audit History
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Logs every model transition triggered by 429 quota or rate-limit violations.
            </p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Showing latest {switchEvents.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1f1f] text-zinc-400 border-b border-[#383838]">
              <tr>
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Transition</th>
                <th className="px-5 py-3 font-medium">Quota Type</th>
                <th className="px-5 py-3 font-medium">Cooldown Expiry</th>
                <th className="px-5 py-3 font-medium">Violation / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e] text-zinc-300">
              {switchEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                    No failover events recorded. All models operating within capacity.
                  </td>
                </tr>
              ) : (
                switchEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-[#282828] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono whitespace-nowrap">
                      <span className="text-red-400">{event.fromModel}</span>
                      <span className="text-zinc-500 mx-1.5">→</span>
                      <span className="text-emerald-400 font-semibold">{event.toModel}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          event.category === "daily"
                            ? "bg-red-950 text-red-400 border border-red-800/40"
                            : "bg-yellow-950 text-yellow-400 border border-yellow-800/40"
                        }`}
                      >
                        {event.category === "daily" ? "Daily Quota" : "Short Window"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                      {event.cooldownExpiresAt
                        ? new Date(event.cooldownExpiresAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300 max-w-md truncate" title={event.reason}>
                      {event.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

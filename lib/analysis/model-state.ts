import { prisma } from "@/lib/db/prisma";
import { getPrimaryModel, getFallbackModel, getOppositeModel } from "./models";
import { analyzeQuotaError, type QuotaAnalysis } from "./quota";

export interface SwitchResult {
  newModel: string;
  switched: boolean;
  quotaAnalysis: QuotaAnalysis;
}

/**
 * Returns the currently active model from the persisted database state.
 * Initializes the singleton row if it does not yet exist.
 * If cooldown has expired, clears the cooldown flag but keeps the currently
 * active model ("stay on active model until it also fails").
 */
export async function getActiveModel(): Promise<string> {
  const primary = getPrimaryModel();
  const fallback = getFallbackModel();

  let state = await prisma.aiModelState.findUnique({
    where: { id: "default" },
  });

  if (!state) {
    state = await prisma.aiModelState.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        activeModel: primary,
        primaryModel: primary,
        fallbackModel: fallback,
        inCooldown: false,
      },
      update: {},
    });
    return state.activeModel;
  }

  // Check if cooldown has expired
  if (state.inCooldown && state.cooldownExpiresAt && state.cooldownExpiresAt <= new Date()) {
    state = await prisma.aiModelState.update({
      where: { id: "default" },
      data: {
        inCooldown: false,
        cooldownExpiresAt: null,
      },
    });
  }

  return state.activeModel;
}

/**
 * Concurrency-safe atomic model switch triggered by a quota error.
 * Uses a conditional WHERE clause guarding on the expected prior activeModel.
 * If another request already switched the model, re-reads the fresh activeModel
 * and avoids duplicate switch events.
 */
export async function switchModelOnQuotaError(
  currentModel: string,
  error: unknown,
): Promise<SwitchResult> {
  const quotaAnalysis = analyzeQuotaError(error, currentModel);
  const targetModel = getOppositeModel(currentModel);

  // Atomic update: only update if activeModel is still currentModel
  const updateResult = await prisma.aiModelState.updateMany({
    where: {
      id: "default",
      activeModel: currentModel,
    },
    data: {
      activeModel: targetModel,
      inCooldown: true,
      cooldownExpiresAt: quotaAnalysis.cooldownExpiresAt,
      lastSwitchedAt: new Date(),
      switchReason: quotaAnalysis.reason,
    },
  });

  if (updateResult.count === 0) {
    // Another concurrent request already switched the model!
    const freshState = await prisma.aiModelState.findUnique({
      where: { id: "default" },
    });

    return {
      newModel: freshState?.activeModel || targetModel,
      switched: false,
      quotaAnalysis,
    };
  }

  // We won the race and updated the row: log the switch event
  await prisma.aiModelSwitchEvent.create({
    data: {
      fromModel: currentModel,
      toModel: targetModel,
      category: quotaAnalysis.category,
      reason: quotaAnalysis.reason,
      retryDelaySeconds: quotaAnalysis.retryDelaySeconds,
      cooldownExpiresAt: quotaAnalysis.cooldownExpiresAt,
    },
  });

  return {
    newModel: targetModel,
    switched: true,
    quotaAnalysis,
  };
}

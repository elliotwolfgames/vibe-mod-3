import type { ModuleConfig } from "./configuration"
import type { AppActions } from './actions'
import { ModuleResultType, ModuleResult, BaseActions } from 'wolfy-module-kit'
import { AppActionsSchema } from './actions'

// DO NOT MODIFY FROZEN REGION BELOW
// region Frozen
// Result data to be sent to the parent
// includes the data value, result type, & an array of action UIDs
export interface CustomModuleResult {
  data?: any,
  actions: string[],
  type: ModuleResultType
}
// endregion Frozen

/**
 * Result interpretation function
 * Processes the module result and determines what actions should be taken
 */
export function interpretResult(
  config: ModuleConfig,
  actions: Record<string, any>,
  resultData: any,
): ModuleResult {
  // DO NOT MODIFY FROZEN REGION BELOW
  // region Frozen

  // Default action is "done"
  // This will change based on how the module wants to handle its result
  let actionToTrigger: AppActions = BaseActions.Done

  // endregion Frozen

  // Determine action based on game completion for hidden object detective game
  if (resultData?.gameType === 'hidden_object_investigation') {
    if (resultData.detailsForParent?.investigationComplete) {
      actionToTrigger = AppActionsSchema.enum.CaseSolvedPerfect;
    } else if (resultData.completed && resultData.detailsForParent?.suspectIdentified) {
      actionToTrigger = AppActionsSchema.enum.CaseSolved;
    } else if (resultData.completed) {
      actionToTrigger = AppActionsSchema.enum.CasePartiallyResolved;
    } else if (resultData.timeExpired) {
      actionToTrigger = AppActionsSchema.enum.TimeExpired;
    } else {
      actionToTrigger = AppActionsSchema.enum.CaseIncomplete;
    }
  }

  // DO NOT MODIFY FROZEN REGION BELOW
  // region Frozen

  const actionUid = actions?.[actionToTrigger];

  if (!actionUid) {
    throw new Error(`Action key "${actionToTrigger}" not found in config.actions map.`)
  }

  return {
    type: config.expectedResultType,
    data: resultData,
    actions: [actionUid]
  };

  // endregion Frozen
};

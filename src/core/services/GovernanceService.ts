import { CompanyConfig, UserGroup, ValidationError } from '../../types';
import { VersionStore } from '../config/versionStore';
import { ValidationService } from './ValidationService';
import { AccessPolicyResolver } from '../governance/AccessPolicyResolver';

/**
 * GovernanceService
 * The supreme authority for configuration lifecycle and access security.
 */
export const GovernanceService = {
    /**
     * Attempts to promote a draft configuration to LIVE status.
     * Includes mandatory integrity check before deployment.
     */
    async publishConfiguration(config: CompanyConfig): Promise<{ success: boolean; versionId?: string; errors?: ValidationError[] }> {
        const validation = ValidationService.validateConfig(config);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const result = await VersionStore.publishDraft(config);
        return { success: true, versionId: result.publishedVersionId };
    },

    /**
     * Reverts the system state to a previous historical point.
     */
    async rollbackToVersion(versionId: string): Promise<void> {
        await VersionStore.rollbackTo(versionId);
    },

    /**
     * Injects enforced security filters into a data query based on user group.
     */
    applyAccessPolicies(activeFilters: Record<string, any>, group?: UserGroup): Record<string, any> {
        return AccessPolicyResolver.mergeRestrictions(activeFilters, group);
    },

    /**
     * Checks if the current draft differs from the live version.
     */
    isOutOfSync(draft: CompanyConfig, live: CompanyConfig | null): boolean {
        if (!live) return true;
        return JSON.stringify(draft) !== JSON.stringify(live);
    }
};
import type Listener from "./listener.ts";

/**
 * Interface defining the blueprint for game upgrades.
 * It enforces requirements for identifying properties, cost management,
 * state modification logic, and observer pattern integration.
 */
export interface Upgrade {
    get id(): string;
    get description(): string;
    get cost(): number;
    applyUpgrade(): void;

    set description(value: string);
    registerListener(listener: Listener) : void;
}
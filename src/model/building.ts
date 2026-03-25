import type Listener from "./listener.ts";

/**
 * Interface defining the blueprint for game buildings.
 * It enforces requirements for identifying properties, cost management,
 * state modification logic, and observer pattern integration.
 */
export interface Building {
    dbId?: number;
    get id(): string;
    get name(): string;
    get description(): string;
    get cost(): number;
    applyBuilding(): void;

    set description(value: string);
    registerListener(listener: Listener): void;

    saveBuilding(building: Building): Promise<Building>;
}
import type Listener from "./listener.ts";

export interface Upgrade {
    get id(): string;
    get description(): string;
    get cost(): number;
    applyUpgrade(): void;
    registerListener(listener: Listener) : void;
}
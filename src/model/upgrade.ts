export interface Upgrade {
    get description(): string;

    applyUpgrade(): void;
}
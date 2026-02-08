import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import Additiveupgrade from "./additiveupgrade.ts";
import Multiplicativeupgrade from "./multiplicativeupgrade.ts";

/**
 * Core engine for the clicker game simulation.
 * Manages the currency (totalClicks), the strength of each click (clickPower),
 * and handles the logic for purchasing and applying various upgrades.
 */
export default class ClickerSimulation {
    #totalClicks: number;
    #clickPower: number;
    #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;

    constructor() {
        this.#totalClicks = 0;
        this.#clickPower = 1;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();

        this.#checkClickerSimulation();
    }

    /**
     * Validates that the simulation state remains within logical bounds (non-negative values).
     */
    #checkClickerSimulation() {
        assert(this.#totalClicks >= 0, "Total Clicks must be greater or equal to 0");
        assert(this.#clickPower >= 0, "Click power must be greater or equal to 0");
    }

    // getters and setters -------------------------
    get totalClicks(): number {
        return this.#totalClicks;
    }

    get clickPower(): number {
        return this.#clickPower;
    }

    get upgrades(): Array<Upgrade> {
        return this.#upgrades;
    }
    // ----------------------------------------------

    /**
     * Adds a unique upgrade instance to the available upgrades pool.
     * If an instance of the upgrade already exists in the list, then it is not added.
     */
    addUpgrade(upgrade: Upgrade): void {
        if (!this.#upgrades.includes(upgrade)) {
            this.#upgrades.push(upgrade);
        }
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    /**
     * Retrieves an upgrade by its unique identifier.
     * @throws {UpgradeNotFoundException} If the ID does not exist in the collection.
     */
    getUpgradeById(id: string): Upgrade {
        const upgrade = this.#upgrades.find(u => u.id === id);
        if (!upgrade) throw new UpgradeNotFoundException("ID does not match any existing upgrade");
        return upgrade;
    }

    /**
     * Processes the purchase of an upgrade. Subtracts the cost and updates click power
     * based on the specific upgrade type (Additive or Multiplicative).
     * @throws {InsuficientClicksException} If totalClicks is less than the upgrade cost.
     */
    applyUpgrade(upgrade: Upgrade): void {
        if (this.#totalClicks - upgrade.cost < 0) {
            // console.log(this.#totalClicks - upgrade.cost);
            throw new InsuficientClicksException(upgrade.cost - this.totalClicks);
        }
        this.#totalClicks -= upgrade.cost;

        if(upgrade instanceof Additiveupgrade) {
            this.#clickPower += upgrade.additiveEffect;
        } else if(upgrade instanceof Multiplicativeupgrade) {
            this.#clickPower = Math.ceil(
                this.#clickPower *= upgrade.multiplicativeEffect);
        }
        upgrade.applyUpgrade();
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    /**
     * Modifies the total click count, typically called when the user clicks or
     * passive income is generated.
     *  Note: takes in a parameter instead of processing the totalClicks
     *  internally for testing purposes and flexibility
     */
    updateTotalClicks(by: number): void {
        this.#totalClicks += by;
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    /**
     * Notifies all registered listeners of a change in the simulation state.
     */
    notifyAll(): void  {
        this.#listeners.forEach((listener: Listener) => {listener.notify()})
    }

    /**
     * Registers a new listener to be notified of future state changes.
     */
    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}

/**
 * Exception thrown when searching for an upgrade ID that does not exist.
 */
export class UpgradeNotFoundException extends Error { }

/**
 * Exception thrown when an upgrade purchase is attempted without enough clicks.
 */
export class InsuficientClicksException extends Error {
    public missing: number;

    constructor(missing: number) {
        super(`Insufficient clicks! Missing: ${missing}`);
        this.missing = missing;
    }
}
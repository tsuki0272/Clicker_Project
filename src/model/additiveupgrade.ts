import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";

/**
 * Represents an upgrade that provides a flat numerical boost to click power.
 * Implements the Upgrade interface and maintains a list of listeners to
 * notify listeners when the upgrade state (like cost or effect) changes.
 */
export default class Additiveupgrade implements Upgrade {
    #id: string;
    #description: string;
    #cost: number;
    #additiveEffect: number;
    #listeners: Array<Listener>;

    constructor(id: string, cost: number, additiveEffect: number) {
        this.#id = id;
        this.#description = `Increases CLICK POWER by ${additiveEffect}`;
        this.#cost = cost;
        this.#additiveEffect = additiveEffect;
        this.#listeners = new Array<Listener>();

        this.#checkUpgrade();
    }

    /**
     * Validates that all upgrade properties meet the required logical constraints.
     */
    #checkUpgrade() {
        assert(this.#id.length > 0, "ID length must be greater than 0");
        assert(this.#description.length > 0, "Description length must be greater than 0");
        assert(this.#cost > 0, "Cost must be greater than 0");
        assert(this.#additiveEffect > 0, "Additive Effect must be greater than 0");
    }

    // getters and setters -------------------------
    get id(): string {
        return this.#id;
    }

    get description() : string {
        return this.#description;
    }

    set description(description: string) {
        this.#description = description;
    }

    get cost(): number {
        return this.#cost;
    }

    get additiveEffect() : number {
        return this.#additiveEffect;
    }
    // ----------------------------------------------

    /**
     * Executes the upgrade logic: scales the cost for the next tier,
     * updates the description, and triggers listener notifications.
     */
    applyUpgrade() : void {
        this.#cost *= 3;
        this.#checkUpgrade();
        this.notifyAll();
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
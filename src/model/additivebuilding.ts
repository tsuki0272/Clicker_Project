import {assert} from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Building} from "./building.ts";

export default class Additivebuilding implements Building {
    #id: string;
    #description: string;
    #cost: number;
    #additiveValue: number;
    #listeners: Array<Listener>;

    constructor(id: string, cost: number, additiveValue: number) {
        this.#id = id;
        this.#description = `Increases AUTOMATIC CLICKS by ${additiveValue}`;
        this.#cost = cost;
        this.#additiveValue = additiveValue;
        this.#listeners = new Array<Listener>();

        this.#checkBuilding();
    }

    /**
     * Validates that all upgrade properties meet the required logical constraints.
     */
    #checkBuilding() {
        assert(this.#id.length > 0, "ID length must be greater than 0");
        assert(this.#description.length > 0, "Description length must be greater than 0");
        assert(this.#cost > 0, "Cost must be greater than 0");
        assert(this.#additiveValue > 0, "Additive Value must be greater than 0");
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

    get additiveValue() : number {
        return this.#additiveValue;
    }
    // ----------------------------------------------

    /**
     * Executes the upgrade logic: scales the cost for the next tier,
     * updates the description, and triggers listener notifications.
     */
    applyBuilding() : void {
        this.#cost *= 4;
        this.#checkBuilding();
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
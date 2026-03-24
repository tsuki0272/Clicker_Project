import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import db from "./connection.ts";
import type ClickerSimulation from "./clickersimulation.ts";

/**
 * Represents a multiplicative upgrade that scales the user's click power.
 * Implements the Upgrade interface and maintains a list of listeners to
 * notify listeners when the upgrade state (like cost or effect) changes.
 */
export default class Multiplicativeupgrade implements Upgrade {
    #id: string;
    #accountID: ClickerSimulation;
    #description: string;
    #cost: number;
    #multiplicativeEffect: number;
    #listeners: Array<Listener>;

    constructor(id: string, cost: number, multiplicativeEffect: number, account: ClickerSimulation) {
        this.#id = id;
        this.#accountID = account;
        this.#description = `Multiplies CLICK POWER by ${multiplicativeEffect.toFixed(2)}`;
        this.#cost = cost;
        this.#multiplicativeEffect = multiplicativeEffect;
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
        assert(this.#multiplicativeEffect > 0, "Multiplicative Effect must be greater than 0");
    }

    // getters and setters -------------------------
    get id(): string {
        return this.#id;
    }

    set id(id: string) {
        this.#id = id;
    }

    get description() : string {
        return this.#description;
    }

    get cost(): number {
        return this.#cost;
    }

    get multiplicativeEffect() : number {
        return this.#multiplicativeEffect;
    }
    // ----------------------------------------------

    // Keep the static method as-is, then add:
    saveUpgrade(upgrade: Multiplicativeupgrade): void {
        Multiplicativeupgrade.saveUpgrade(upgrade);
    }

    static async saveUpgrade(upgrade: Multiplicativeupgrade): Promise<Upgrade> {
        let results = await db().exec(
            `insert into upgrade(id, description, cost, additive_effect, account_id) 
            values(default, '${upgrade.description}', ${upgrade.cost}, ${upgrade.multiplicativeEffect}, '${upgrade.#accountID}') 
            returning id`)

        results.forEach((result) => {
            result.rows.forEach((row) => {
                upgrade.id = row['id'];
                console.log(`Upgrade has ID ${upgrade.id}`);
            })
        })
        // @ts-ignore
        return upgrade;
    }

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
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
    id?: number;
    #name: string;
    #accountID: ClickerSimulation;
    #description: string;
    #cost: number;
    #multiplicativeEffect: number;
    #listeners: Array<Listener>;

    constructor(name: string, description: string, cost: number, multiplicativeEffect: number, account: ClickerSimulation) {
        this.#name = name;
        this.#accountID = account;
        this.#description = description;
        this.#cost = cost;
        this.#multiplicativeEffect = multiplicativeEffect;
        this.#listeners = new Array<Listener>();

        this.#checkUpgrade();
    }

    /**
     * Validates that all upgrade properties meet the required logical constraints.
     */
    #checkUpgrade() {
        assert(this.#name.length > 0, "Upgrade name length must be greater than 0");
        assert(this.#description.length > 0, "Description length must be greater than 0");
        assert(this.#cost > 0, "Cost must be greater than 0");
        assert(this.#multiplicativeEffect > 0, "Multiplicative Effect must be greater than 0");
    }

    // getters and setters -------------------------
    get name(): string {
        return this.#name;
    }

    set name(name: string) {
        this.#name = name;
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

    /**
     * Instance method that delegates to the static saveUpgrade method.
     */
    saveUpgrade(upgrade: Multiplicativeupgrade): Promise<Upgrade> {
        return Multiplicativeupgrade.saveUpgrade(upgrade);
    }

    /**
     * Persists a new upgrade record to the database and assigns the generated DB id
     * back to the upgrade instance.
     */
    static async saveUpgrade(upgrade: Multiplicativeupgrade): Promise<Upgrade> {
        let results = await db().query<{
            id: number
        }>(
            "insert into upgrade(name, description, cost, multiplicative_effect, account_id) values($1, $2, $3, $4, $5) returning id",
            [upgrade.name, upgrade.description, upgrade.cost, upgrade.multiplicativeEffect, upgrade.#accountID.username]);

        results.rows.forEach((row) => {
            upgrade.id = row['id'];
            console.log(`Upgrade has ID: ${upgrade.id}`);
        })
        return upgrade;
    }

    /**
     * Retrieves all multiplicative upgrades for a given account from the database,
     * filtering by account_id and ensuring only multiplicative rows are returned.
     */
    static async getUpgradesForAccount(clickerSimulation: ClickerSimulation): Promise<Array<Upgrade>> {
        let results = await db().query<
            {
                id: number;
                name: string;
                description: string;
                cost: number;
                multiplicative_effect: number;
                account_id: string;
            }>(
            "select id, name, description, cost, multiplicative_effect, account_id from upgrade where account_id = $1 and multiplicative_effect is not null",
            [clickerSimulation.username]);
        let allUpgrades = new Array<Upgrade>();

        results.rows.forEach((row) => {
            let upgrade = new Multiplicativeupgrade(row.name, row.description,
                row.cost, row.multiplicative_effect, clickerSimulation);
            upgrade.id = row.id;
            allUpgrades.push(upgrade);
        })
        return allUpgrades;
    }

    /**
     * Updates the upgrade's cost in the database after it has been purchased
     * and its cost has been scaled for the next tier.
     */
    static async updateUpgrade(upgrade: Multiplicativeupgrade): Promise<void> {
        await db().query(
            "update upgrade set cost = $1 where name = $2 and account_id = $3",
            [upgrade.cost, upgrade.name, upgrade.#accountID.username]);
    }

    /**
     * Executes the upgrade logic: scales the cost for the next tier,
     * updates the description, and triggers listener notifications.
     */
    applyUpgrade() : void {
        this.#cost *= 3;
        this.#checkUpgrade();
        this.notifyAll();
        Multiplicativeupgrade.updateUpgrade(this);
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
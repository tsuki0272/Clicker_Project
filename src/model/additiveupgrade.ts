import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import db from "./connection.ts";
import type ClickerSimulation from "./clickersimulation.ts";

/**
 * Represents an upgrade that provides a flat numerical boost to click power.
 * Implements the Upgrade interface and maintains a list of listeners to
 * notify listeners when the upgrade state (like cost or effect) changes.
 */
export default class Additiveupgrade implements Upgrade {
    id?: number;
    #name: string;
    #accountID: ClickerSimulation;
    #description: string;
    #cost: number;
    #additiveEffect: number;
    #listeners: Array<Listener>;

    constructor(name: string, description: string, cost: number, additiveEffect: number, account: ClickerSimulation) {
        this.#name = name;
        this.#accountID = account;
        this.#description = description;
        this.#cost = cost;
        this.#additiveEffect = additiveEffect;
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
        assert(this.#additiveEffect > 0, "Additive Effect must be greater than 0");
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
     * Instance method that delegates to the static saveUpgrade method.
     */
    saveUpgrade(upgrade: Additiveupgrade): Promise<Upgrade> {
        return Additiveupgrade.saveUpgrade(upgrade);
    }

    /**
     * Persists a new upgrade record to the database and assigns the generated DB id
     * back to the upgrade instance.
     */
    static async saveUpgrade(upgrade: Additiveupgrade): Promise<Upgrade> {
        let results = await db().query<{
            id: number
        }>(
            "insert into upgrade(name, description, cost, additive_effect, account_id) values($1, $2, $3, $4, $5) returning id",
            [upgrade.name, upgrade.description, upgrade.cost, upgrade.additiveEffect, upgrade.#accountID.username]);

        results.rows.forEach((row) => {
            upgrade.id = row['id'];
            console.log(`Upgrade has ID: ${upgrade.id}`);
        })
        return upgrade;
    }

    /**
     * Retrieves all additive upgrades for a given account from the database,
     * filtering by account_id and ensuring only additive rows are returned.
     */
    static async getUpgradesForAccount(clickerSimulation: ClickerSimulation): Promise<Array<Upgrade>> {
        let results = await db().query<
            {
                id: number;
                name: string;
                description: string;
                cost: number;
                additive_effect: number;
                account_id: string;
            }>(
            "select id, name, description, cost, additive_effect, account_id from upgrade where account_id = $1 and additive_effect is not null",
            [clickerSimulation.username]);

        let allUpgrades = new Array<Upgrade>();

        results.rows.forEach((row) => {
            let upgrade = new Additiveupgrade(row.name, row.description,
                row.cost, row.additive_effect, clickerSimulation);
            upgrade.id = row.id;
            allUpgrades.push(upgrade);
        })
        return allUpgrades;
    }

    /**
     * Reads all additive upgrade templates from the inventory table.
     * Called during account creation to seed a new account's upgrades.
     */
    static async getFromInventory(account: ClickerSimulation): Promise<Array<Additiveupgrade>> {
        let results = await db().query<{
            name: string;
            description: string;
            cost: number;
            additive_effect: number;
        }>(
            "select name, description, cost, additive_effect from upgrade_inventory where additive_effect is not null"
        );

        return results.rows.map(row =>
            new Additiveupgrade(row.name, row.description, row.cost, row.additive_effect, account)
        );
    }

    /**
     * Updates the upgrade's cost in the database after it has been purchased
     * and its cost has been scaled for the next tier.
     */
    static async updateUpgrade(upgrade: Additiveupgrade): Promise<void> {
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
        Additiveupgrade.updateUpgrade(this);
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
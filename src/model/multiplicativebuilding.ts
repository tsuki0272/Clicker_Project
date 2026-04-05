import {assert} from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Building} from "./building.ts";
import db from "./connection.ts";
import type ClickerSimulation from "./clickersimulation.ts";

/**
 * Represents a building that scales the automatic CPS by a multiplier.
 * Implements the Building interface and maintains a list of listeners to
 * notify listeners when the building state (like cost) changes.
 */
export default class Multiplicativebuilding implements Building {
    dbId?: number;
    #name: string;
    #accountID: ClickerSimulation;
    #description: string;
    #cost: number;
    #multiplicativeValue: number;
    #listeners: Array<Listener>;

    constructor(name: string, description: string, cost: number, multiplicativeValue: number, account: ClickerSimulation) {
        this.#name = name;
        this.#accountID = account;
        this.#description = description;
        this.#cost = cost;
        this.#multiplicativeValue = multiplicativeValue;
        this.#listeners = new Array<Listener>();

        this.#checkBuilding();
    }

    /**
     * Validates that all building properties meet the required logical constraints.
     */
    #checkBuilding() {
        assert(this.#name.length > 0, "Name length must be greater than 0");
        assert(this.#description.length > 0, "Description length must be greater than 0");
        assert(this.#cost > 0, "Cost must be greater than 0");
        assert(this.#multiplicativeValue > 0, "Multiplicative Value must be greater than 0");
    }

    get id(): string { return this.#name; }
    get name(): string { return this.#name; }
    get description(): string { return this.#description; }
    set description(description: string) { this.#description = description; }
    get cost(): number { return this.#cost; }
    get multiplicativeValue(): number { return this.#multiplicativeValue; }

    /**
     * Instance method that delegates to the static saveBuilding method.
     */
    saveBuilding(building: Multiplicativebuilding): Promise<Building> {
        return Multiplicativebuilding.saveBuilding(building);
    }

    /**
     * Persists a new building record to the database and assigns the generated DB id
     * back to the building instance.
     */
    static async saveBuilding(building: Multiplicativebuilding): Promise<Building> {
        let result = await db().query<{id: number}>(
            "insert into building(name, description, cost, multiplicative_value, account_id) values($1, $2, $3, $4, $5) returning id",
            [building.name, building.description, building.cost, building.multiplicativeValue, building.#accountID.username]);

        result.rows.forEach((row) => {
            building.dbId = row.id;
            console.log(`Building has ID: ${building.dbId}`);
        })
        return building;
    }

    /**
     * Retrieves all multiplicative buildings for a given account from the database,
     * filtering by account_id and ensuring only multiplicative rows are returned.
     */
    static async getBuildingsForAccount(clickerSimulation: ClickerSimulation): Promise<Array<Building>> {
        let results = await db().query<{
            id: number;
            name: string;
            description: string;
            cost: number;
            multiplicative_value: number;
            account_id: string;
        }>(
            "select id, name, description, cost, multiplicative_value, account_id from building where account_id = $1 and multiplicative_value is not null",
            [clickerSimulation.username]);

        let allBuildings = new Array<Building>();
        results.rows.forEach((row) => {
            let building = new Multiplicativebuilding(row.name, row.description, row.cost, row.multiplicative_value, clickerSimulation);
            building.dbId = row.id;
            allBuildings.push(building);
        })
        return allBuildings;
    }

    /**
     * Reads all multiplicative building templates from the inventory table.
     * Called during account creation to seed a new account's buildings.
     */
    static async getFromInventory(account: ClickerSimulation): Promise<Array<Multiplicativebuilding>> {
        let results = await db().query<{
            name: string;
            description: string;
            cost: number;
            multiplicative_value: number;
        }>(
            "select name, description, cost, multiplicative_value from building_inventory where multiplicative_value is not null"
        );

        return results.rows.map(row =>
            new Multiplicativebuilding(row.name, row.description, row.cost, row.multiplicative_value, account)
        );
    }

    /**
     * Updates the building's cost in the database after it has been purchased
     * and its cost has been scaled for the next tier.
     */
    static async updateBuilding(building: Multiplicativebuilding): Promise<void> {
        await db().query(
            "update building set cost = $1 where name = $2 and account_id = $3",
            [building.cost, building.name, building.#accountID.username]);
    }

    /**
     * Executes the building logic: scales the cost for the next tier,
     * validates the new state, and triggers listener notifications.
     */
    applyBuilding(): void {
        this.#cost *= 4;
        this.#checkBuilding();
        this.notifyAll();
        Multiplicativebuilding.updateBuilding(this);
    }

    /**
     * Notifies all registered listeners of a change in the building state.
     */
    notifyAll(): void {
        this.#listeners.forEach((listener: Listener) => { listener.notify() })
    }

    /**
     * Registers a new listener to be notified of future state changes.
     */
    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}
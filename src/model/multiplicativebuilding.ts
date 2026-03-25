import {assert} from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Building} from "./building.ts";
import db from "./connection.ts";
import type ClickerSimulation from "./clickersimulation.ts";

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

    saveBuilding(building: Multiplicativebuilding): Promise<Building> {
        return Multiplicativebuilding.saveBuilding(building);
    }

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

    applyBuilding(): void {
        this.#cost *= 4;
        this.#checkBuilding();
        this.notifyAll();
    }

    notifyAll(): void {
        this.#listeners.forEach((listener: Listener) => { listener.notify() })
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}
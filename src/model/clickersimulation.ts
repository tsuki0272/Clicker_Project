import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import Additiveupgrade from "./additiveupgrade.ts";
import Multiplicativeupgrade from "./multiplicativeupgrade.ts";
import type {Building} from "./building.ts";
import Additivebuilding from "./additivebuilding.ts";
import Multiplicativebuilding from "./multiplicativebuilding.ts";
import db from "./connection.ts";

/**
 * Core engine for the clicker game simulation.
 * Manages the currency (totalClicks), the strength of each click (clickPower),
 * and handles the logic for purchasing and applying various upgrades.
 */
export default class ClickerSimulation {
    #username: string;
    #password: string;
    #totalClicks: number;
    #clickPower: number;
    #autoCPS: number; // autoclick cps
    #upgrades: Array<Upgrade>;
    #buildings: Array<Building>;
    #listeners: Array<Listener>;

    constructor(username: string, password: string, totalClicks: number, clickPower: number) {
        this.#username = username;
        this.#password = password;
        this.#totalClicks = totalClicks;
        this.#clickPower = clickPower;
        this.#autoCPS = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#buildings= new Array<Building>();
        this.#listeners = new Array<Listener>();

        this.#checkClickerSimulation();
    }

    /**
     * Validates that the simulation state remains within logical bounds (non-negative values),
     * and that the username and password are valid entries.
     */
    #checkClickerSimulation() {
        assert(this.#username.length > 0, "Username length must be greater than 0");
        assert(this.#password.length > 0, "Password length must be greater than 0");
        assert(this.#totalClicks >= 0, "Total Clicks must be greater or equal to 0");
        assert(this.#clickPower >= 0, "Click power must be greater or equal to 0");
    }

    // getters and setters -------------------------
    get username(): string {
        return this.#username;
    }

    get password(): string {
        return this.#password;
    }

    get totalClicks(): number {
        return this.#totalClicks;
    }

    get clickPower(): number {
        return this.#clickPower;
    }

    get autoCPS(): number {
        return this.#autoCPS;
    }

    get upgrades(): Array<Upgrade> {
        return this.#upgrades;
    }

    get buildings(): Array<Building> {
        return this.#buildings;
    }
    // ----------------------------------------------

    static async hashPassword(username: string, password: string): Promise<string> {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );
        const salt = enc.encode(username);
        const derivedBits = await window.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 10000,
                hash: "SHA-256",
            },
            keyMaterial,
            256
        );
        return Array.from(new Uint8Array(derivedBits))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    static async getAllAccounts(): Promise<Array<ClickerSimulation>> {
        const allAccounts = new Array<ClickerSimulation>();

        let results = await db()
            .query<{username: string, password: string, total_clicks: number, click_power: number}>(
                "select username, password, total_clicks, click_power from account");

        for(let row of results.rows) {
            let account = new ClickerSimulation(
                row.username, row.password, row.total_clicks, row.click_power);

            const additiveUpgrades = await Additiveupgrade.getUpgradesForAccount(account);
            const multiplicativeUpgrades = await Multiplicativeupgrade.getUpgradesForAccount(account);
            additiveUpgrades.forEach(u => account.addUpgrade(u));
            multiplicativeUpgrades.forEach(u => account.addUpgrade(u));

            const additiveBuildings = await Additivebuilding.getBuildingsForAccount(account);
            const multiplicativeBuildings = await Multiplicativebuilding.getBuildingsForAccount(account);
            additiveBuildings.forEach(b => account.addBuilding(b));
            multiplicativeBuildings.forEach(b => account.addBuilding(b));

            allAccounts.push(account);
        }
        return allAccounts;
    }

    static async saveClickerSimulation(clickerSimulation: ClickerSimulation): Promise<ClickerSimulation> {
        await db().query("insert into account(username, password, total_clicks, click_power) values($1, $2, $3, $4) on conflict do nothing returning username",
            [clickerSimulation.username, clickerSimulation.password, clickerSimulation.totalClicks, clickerSimulation.clickPower])

        clickerSimulation.upgrades.forEach(upgrade => {
            if(!upgrade.id) {
                upgrade.saveUpgrade(upgrade);
            }
        })

        clickerSimulation.buildings.forEach(building => {
            if(!building.dbId) {
                building.saveBuilding(building);
            }
        })
        return clickerSimulation;
    }

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
     * Adds a unique building instance to the available buildings pool.
     * If an instance of the building already exists in the list, then it is not added.
     */
    addBuilding(building: Building): void {
        if (!this.#buildings.includes(building)) {
            this.#buildings.push(building);
        }
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    /**
     * Retrieves an upgrade by its unique identifier.
     * @throws {UpgradeNotFoundException} If the ID does not exist in the collection.
     */
    getUpgradeByName(name: string): Upgrade {
        const upgrade = this.#upgrades.find(u => u.name === name);
        if (!upgrade) throw new UpgradeNotFoundException("ID does not match any existing upgrade");
        return upgrade;
    }

    /**
     * Retrieves a building by its unique identifier.
     * @throws {UpgradeNotFoundException} If the ID does not exist in the collection.
     */
    getBuildingById(id: string): Building {
        const building = this.#buildings.find(b => b.id === id);
        if (!building) throw new BuildingNotFoundException("ID does not match any existing upgrade");
        return building;
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
     * Processes the purchase of a building. Subtracts the cost and calls setInterval to update clicks every second
     * based on the specific building type (Additive or Multiplicative).
     * @throws {InsuficientClicksException} If totalClicks is less than the building cost.
     */
    applyBuilding(building: Building): void {
        if (this.#totalClicks - building.cost < 0) {
            // console.log(this.#totalClicks - upgrade.cost);
            throw new InsuficientClicksException(building.cost - this.totalClicks);
        }

        if(building instanceof Additivebuilding) {
            this.#autoCPS += building.additiveValue;
        } else if(building instanceof Multiplicativebuilding) {
            if(this.#autoCPS === 0) {
                throw new InvalidBuildingPurchaseException("");
            }
            this.#autoCPS = Math.ceil(
                this.#autoCPS *= building.multiplicativeValue);
        }
        this.#totalClicks -= building.cost;
        building.applyBuilding();
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
 * Exception thrown when searching for an upgrade ID that does not exist.
 */
export class BuildingNotFoundException extends Error { }

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

export class InvalidBuildingPurchaseException extends Error { }
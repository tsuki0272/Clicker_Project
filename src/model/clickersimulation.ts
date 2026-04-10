import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import Additiveupgrade from "./additiveupgrade.ts";
import Multiplicativeupgrade from "./multiplicativeupgrade.ts";
import type {Building} from "./building.ts";
import Additivebuilding from "./additivebuilding.ts";
import Multiplicativebuilding from "./multiplicativebuilding.ts";
import db from "./connection.ts";
import seedrandom from 'seedrandom';

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
    #markovNumerator: number[][] = [];
    #markovDenominator: number[] = [];
    #lastPurchasedIndex: number = 0;
    #upgradesPurchased: number = 0;
    #rng: seedrandom.PRNG = seedrandom('default');

    constructor(username: string, password: string, totalClicks: number, clickPower: number, autoCPS: number) {
        this.#username = username;
        this.#password = password;
        this.#totalClicks = totalClicks;
        this.#clickPower = clickPower;
        this.#autoCPS = autoCPS;
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

    get upgradesPurchased(): number {
        return this.#upgradesPurchased;
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

        return new Uint8Array(derivedBits).toHex();
    }

    static async getAllAccounts(): Promise<Array<ClickerSimulation>> {
        const allAccounts = new Array<ClickerSimulation>();

        let results = await db()
            .query<{username: string, password: string, total_clicks: number, click_power: number, auto_cps: number}>(
                "select username, password, total_clicks, click_power, auto_cps from account");


        for(let row of results.rows) {
            let account = new ClickerSimulation(
                row.username, row.password, row.total_clicks, row.click_power, row.auto_cps);


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
        const result = await db().query<{username: string}>(
            "insert into account(username, password, total_clicks, click_power, auto_cps) values($1, $2, $3, $4, $5) on conflict do nothing returning username",
            [clickerSimulation.username, clickerSimulation.password, clickerSimulation.totalClicks, clickerSimulation.clickPower, clickerSimulation.autoCPS])

        if (result.rows.length === 0) throw new DuplicateUsernameException("Username is already taken");

        clickerSimulation.upgrades.forEach(upgrade => {
            if(!upgrade.id) upgrade.saveUpgrade(upgrade);
        })

        clickerSimulation.buildings.forEach(building => {
            if(!building.dbId) building.saveBuilding(building);
        })
        return clickerSimulation;
    }

    static async updateAccount(clickerSimulation: ClickerSimulation): Promise<void> {
        await db().query(
            "update account set total_clicks = $1, click_power = $2, auto_cps = $3 where username = $4",
            [clickerSimulation.totalClicks, clickerSimulation.clickPower, clickerSimulation.autoCPS, clickerSimulation.username]);
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
     * Retrieves an account by its hashed password.
     * Queries the database for the matching account name and hashed password, returning an error if invalid.
     */
    static async getAccountByUsername(username: string, hashedPassword: string): Promise<ClickerSimulation> {
        const result = await db().query<{username: string, password: string, total_clicks: number, click_power: number, auto_cps: number}>(
            "select username, password, total_clicks, click_power, auto_cps from account where username = $1 and password = $2",
            [username, hashedPassword]);

        if (result.rows.length === 0) throw new Error("Invalid username or password");

        const row = result.rows[0];
        const account = new ClickerSimulation(row.username, row.password, row.total_clicks, row.click_power, row.auto_cps);

        const additiveUpgrades = await Additiveupgrade.getUpgradesForAccount(account);
        const multiplicativeUpgrades = await Multiplicativeupgrade.getUpgradesForAccount(account);
        additiveUpgrades.forEach(u => account.addUpgrade(u));
        multiplicativeUpgrades.forEach(u => account.addUpgrade(u));

        const additiveBuildings = await Additivebuilding.getBuildingsForAccount(account);
        const multiplicativeBuildings = await Multiplicativebuilding.getBuildingsForAccount(account);
        additiveBuildings.forEach(b => account.addBuilding(b));
        multiplicativeBuildings.forEach(b => account.addBuilding(b));

        return account;
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
            throw new InsuficientClicksException(upgrade.cost - this.totalClicks);
        }
        this.#totalClicks -= upgrade.cost;

        if(upgrade instanceof Additiveupgrade) {
            this.#clickPower += upgrade.additiveEffect;
        } else if(upgrade instanceof Multiplicativeupgrade) {
            this.#clickPower = Math.ceil(
                this.#clickPower *= upgrade.multiplicativeEffect);
        }

        const index = this.#upgrades.indexOf(upgrade);
        if (index !== -1) this.#lastPurchasedIndex = index;
        this.#upgradesPurchased++;

        upgrade.applyUpgrade();
        this.notifyAll();
        ClickerSimulation.updateAccount(this);
        this.#checkClickerSimulation();
    }

    /**
     * Processes the purchase of a building. Subtracts the cost and calls setInterval to update clicks every second
     * based on the specific building type (Additive or Multiplicative).
     * @throws {InsuficientClicksException} If totalClicks is less than the building cost.
     */
    applyBuilding(building: Building): void {
        if (this.#totalClicks - building.cost < 0) {
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

        const index = this.#buildings.indexOf(building);
        if (index !== -1) this.#lastPurchasedIndex = this.#upgrades.length + index;

        building.applyBuilding();
        this.notifyAll();
        ClickerSimulation.updateAccount(this);
        this.#checkClickerSimulation();
    }

    /**
     * Loads the trained Markov model weights into the simulation.
     * numerator[i][j] is the count of transitions from state i to state j.
     * denominator[i] is the total number of transitions out of state i.
     */
    loadMarkovModel(numerator: number[][], denominator: number[]): void {
        this.#markovNumerator = numerator;
        this.#markovDenominator = denominator;
    }

    /**
     * Reseeds the random number generator used by the Markov chain.
     * Calling this with the same seed will produce the same sequence of purchases.
     */
    setSeed(seed: string): void {
        this.#rng = seedrandom(seed);
    }

    /**
     * Uses the trained Markov chain to pick and attempt to purchase the next item.
     * Selects the next state from the row of the last purchased item's index,
     * sampling proportionally to the transition counts. Silently skips if the
     * player cannot afford the selected item.
     */
    roboBuyNext(): void {
        if (this.#markovNumerator.length === 0) return;

        const row = this.#markovNumerator[this.#lastPurchasedIndex];
        const total = this.#markovDenominator[this.#lastPurchasedIndex];
        if (total === 0) return;

        let rand = this.#rng() * total;
        let nextIndex = row.length - 1;
        for (let i = 0; i < row.length; i++) {
            rand -= row[i];
            if (rand <= 0) {
                nextIndex = i;
                break;
            }
        }

        try {
            if (nextIndex < this.#upgrades.length) {
                this.applyUpgrade(this.#upgrades[nextIndex]);
            } else {
                const buildingIndex = nextIndex - this.#upgrades.length;
                if (buildingIndex < this.#buildings.length) {
                    this.applyBuilding(this.#buildings[buildingIndex]);
                }
            }
        } catch (e) {
            // Not enough clicks this tick; robo-buy will retry on the next interval
        }
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
        ClickerSimulation.updateAccount(this);
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

export class DuplicateUsernameException extends Error { }

export class InvalidUsernameException extends Error { }

export class InvalidPasswordException extends Error { }
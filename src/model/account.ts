import db from "./connection.ts";
import type ClickerSimulation from "./clickersimulation.ts";
import {assert} from "../assertions.ts";

export default class Account {
    #username: string;
    #password: string;
    #clickerSim?: ClickerSimulation;

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;

        this.#checkAccount();
    }

    #checkAccount() {
        assert(this.#username.length > 0, "Username length must be greater than 0");
        assert(this.#password.length > 0, "Password length must be greater than 0");
    }

    addClickerSimulation(clickerSim: ClickerSimulation): void {
        if (this.#clickerSim === undefined) {
            this.#clickerSim = clickerSim;
        }
        this.#checkAccount();
    }

    get username(): string {
        return this.#username;
    }

    get password(): string {
        return this.#password;
    }

    set username(username: string) {
        this.#username = username;
    }

    set password(password: string) {
        this.#password = password;
    }

    static async getAllAccounts() : Promise<Array<Account>> {
        const allAccounts = new Array<Account>();

        let results = await db()
            .query<{username: string, password: string}>("select username, password from account");

        for(let row of results.rows) {
            let account = new Account(row.username, row.password);
            allAccounts.push(account);
        }

        return allAccounts;
    }
}
import Account from "../model/account.ts";
import LoginView from "../view/login-view.ts";

export default class AccountController {
    #loginView: LoginView;

    constructor() {
        this.#loginView = new LoginView(this);
    }

    addAccount(username: string, password: string): void {
        let account = new Account(username, password);
        console.log(account);
        // new ClickerSimulationController();
    }

    logIntoAccount(username: string, password: string): void {

    }
}
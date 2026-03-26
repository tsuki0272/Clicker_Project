import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

/**
 * Renders the initial welcome page with options to create a new account
 * or log into an existing one.
 */
export default class LoginPageView {
    #controller: ClickerSimulationController;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;
        this.render();
    }

    /**
     * Renders the welcome page into the DOM and binds navigation buttons
     * to the controller's showCreateAccount and showLogin methods.
     */
    render(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
            <p style="font-size: 24px;"><b>WELCOME</b></p>
            <button id="new-account-button">New Account</button>
            <button id="existing-account-button">Existing Account</button>
        `;

        document.querySelector("#new-account-button")!
            .addEventListener("click", () => this.#controller.showCreateAccount());

        document.querySelector("#existing-account-button")!
            .addEventListener("click", () => this.#controller.showLogin());
    }
}
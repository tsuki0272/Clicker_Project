import ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import {DuplicateUsernameException} from "../model/clickersimulation.ts";

/**
 * Renders the account registration form and validates input before
 * delegating account creation to the controller. Displays errors for
 * empty fields or duplicate usernames.
 */
export default class CreateAccountView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;
        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "error-dialog";
        this.render();
    }

    /**
     * Renders the registration form into the DOM and binds button event listeners.
     */
    render(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
        <p style="font-size: 24px;"><b>CREATE ACCOUNT</b></p>

        <label for="username">Username:</label>
        <input type="text" id="username"><br><br>

        <label for="password">Password:</label>
        <input type="password" id="password"><br><br>

        <button id="create-account-button">Create Account</button>
        <button id="back-button">Back</button>
    `;

        document.querySelector("#create-account-button")!
            .addEventListener("click", () => this.#addAccount());

        document.querySelector("#back-button")!
            .addEventListener("click", () => this.#controller.showLoginPage());
    }

    /**
     * Reads the username and password from the form, validates them,
     * and delegates to the controller. Shows an error dialog on failure.
     */
    #addAccount(): void {
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        if (username.length === 0) {
            this.#showError("Username cannot be empty.");
            return;
        }
        if (password.length === 0) {
            this.#showError("Password cannot be empty.");
            return;
        }

        this.#controller.addAccount(username, password).catch(e => {
            if (e instanceof DuplicateUsernameException) {
                this.#showError("Username is already taken.");
            } else {
                this.#showError("An error occurred. Please try again.");
            }
        });
    }

    /**
     * Displays an error dialog with the given message.
     */
    #showError(message: string): void {
        this.#dialog.innerHTML = `
            <button id="close-dialog">X</button>
            <p>${message}</p>
        `;
        document.body.appendChild(this.#dialog);
        this.#dialog.show();
        this.#dialog.querySelector("#close-dialog")!
            .addEventListener("click", () => this.#dialog.close());
    }
}
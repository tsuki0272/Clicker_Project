import AssertionError from "../assertions.ts";
import ClickerSimulationController from "../controller/clickersimulation-controller.ts";

export default class CreateAccountView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;
        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "error-dialog";
        this.render();
    }

    render(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
            <p style="font-size: 24px;"><b>CREATE ACCOUNT</b></p>

            <label for="username">Username:</label>
            <input type="text" id="username"><br><br>

            <label for="password">Password:</label>
            <input type="password" id="password"><br><br>

            <button id="create-account-button">Create Account</button>
        `;

        document.querySelector("#create-account-button")!
            .addEventListener("click", () => {
                this.addAccount();
            });

    }

    addAccount(): void {
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            this.#controller.addAccount(username, password);
        } catch (e) {
            if (e instanceof AssertionError) {
                this.showError(e.message);
            }
        }
    }

    showError(message: string): void {
        this.#dialog.innerHTML = `
            <button id="close-dialog">X</button>
            <p>${message}</p>
        `;

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("#close-dialog")!
            .addEventListener("click", () => this.#closeDialog());
    }

    #closeDialog(): void {
        this.#dialog.close();
    }
}
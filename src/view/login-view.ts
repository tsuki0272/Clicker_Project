import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

/**
 * Renders the login form and delegates authentication to the controller.
 * Displays an error dialog if the username or password does not match.
 */
export default class LoginView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;
        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "error-dialog";
        this.render();
    }

    /**
     * Renders the login form into the DOM and binds button event listeners.
     */
    render(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
        <p style="font-size: 24px;"><b>LOGIN</b></p>

        <label for="username">Username:</label>
        <input type="text" id="username"><br><br>

        <label for="password">Password:</label>
        <input type="password" id="password"><br><br>

        <button id="login-button">Login</button>
        <button id="back-button">Back</button>
    `;

        document.querySelector("#login-button")!
            .addEventListener("click", () => this.#login());

        document.querySelector("#back-button")!
            .addEventListener("click", () => this.#controller.showLoginPage());
    }

    /**
     * Reads the username and password from the form and delegates to the
     * controller. Shows an error dialog if authentication fails.
     */
    #login(): void {
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        this.#controller.login(username, password).catch(() => {
            this.#showError("Username or password is incorrect.");
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
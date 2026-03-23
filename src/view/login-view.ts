import type AccountController from "../controller/account-controller.ts";
import AssertionError from "../assertions.ts";

export default class LoginView {
    #controller: AccountController;
    #dialog: HTMLDialogElement;

    constructor(controller : AccountController) {
        this.#controller = controller;
        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "error-dialog";
        this.showInitializationPage();
    }

    showInitializationPage(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
            <p id="login-page" style="font-size: 24px;"> <b>LOGIN PAGE</b> </p>
            <button id="existing-account-button">Log Into Existing Account</button>
            <button id="new-account-button">Create New Account</button>    
        `;

        document.querySelector("#existing-account-button")!
            .addEventListener("click", () => {
                this.showExistingAccountPage();
            })

        document.querySelector("#new-account-button")!
            .addEventListener("click", () => {
                this.showNewAccountPage();
            })
    }

    showExistingAccountPage(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
        <p id="login-text"> <b>LOG INTO EXISTING ACCOUNT </b> </p>
        <label for="username">Username:</label>
        <input type="text" id="username"><br><br>
        <label for="password">Password:</label>
        <input type="text" id="password"><br><br>
        <button id="log-into-account-button">Log In</button>
        <br><br>
        <button id="back-to-login-button">Return to Main Page</button>
        `

        document.querySelector("#log-into-account-button")!
            .addEventListener("click", () => {
                this.logIntoAccount();
            })

        document.querySelector("#back-to-login-button")!
            .addEventListener("click", () => {
                this.showInitializationPage();
            })
    }

    showNewAccountPage(): void {
        document.querySelector('#clickerSim')!.innerHTML = `
        <p id="login-text"> <b>CREATE NEW ACCOUNT</b> </p>
        <label for="username">Username:</label>
        <input type="text" id="username"><br><br>
        <label for="password">Password:</label>
        <input type="text" id="password"><br><br>
        <button id="create-new-account-button">Create New Account</button>
        <br><br>
        <button id="back-to-login-button">Return to Main Page</button>
        `

        document.querySelector("#create-new-account-button")!
            .addEventListener("click", () => {
                this.addAccount();
            })

        document.querySelector("#back-to-login-button")!
            .addEventListener("click", () => {
                this.showInitializationPage();
            })
    }

    logIntoAccount(): void {
        const username = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const usernameInput = username!.value;
        const passwordInput = password!.value;

        this.#controller.logIntoAccount(usernameInput, passwordInput);
    }

    addAccount(): void {
        const username = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const usernameInput = username!.value;
        const passwordInput = password!.value;

        try {
            this.#controller.addAccount(usernameInput, passwordInput);
        } catch (e) {
            if(e instanceof AssertionError) {
                this.#dialog.innerHTML = `
                    <button>X</button>
                    <p>${e.message}</p>`

                    document.body.appendChild(this.#dialog);
                    this.#dialog.show();

                this.#dialog.querySelector("button")!
                    .addEventListener("click", () => this.#closeDialog())
            }
        }

    }

    #closeDialog() {
        this.#dialog.close();
    }
}
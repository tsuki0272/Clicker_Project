import Clickersimulation, {DuplicateUsernameException, InvalidUsernameException, InvalidPasswordException} from "../model/clickersimulation.ts";
import Additiveupgrade from "../model/additiveupgrade.ts";
import ClickerSimulationView from "../view/clickersimulation-view.ts";
import Multiplicativeupgrade from "../model/multiplicativeupgrade.ts";
import UpgradeView from "../view/upgrade-view.ts";
import Additivebuilding from "../model/additivebuilding.ts";
import Multiplicativebuilding from "../model/multiplicativebuilding.ts";
import BuildingView from "../view/building-view.ts";
import ClickerSimulation from "../model/clickersimulation.ts";
import LoginPageView from "../view/loginpage-view.ts";
import LoginView from "../view/login-view.ts";
import CreateAccountView from "../view/createaccount-view.ts";
import type {Upgrade} from "../model/upgrade.ts";
import type {Building} from "../model/building.ts";

/**
 * Acts as the intermediary between the ClickerSimulation model and the UI views.
 * Coordinates user input from the views, updates the game state, and manages
 * navigation between the login, registration, and game views.
 */
export default class ClickerSimulationController {
    #clickersimulation?: Clickersimulation;
    #clickerSimulationView?: ClickerSimulationView;
    #loginPageView?: LoginPageView;
    #loginView?: LoginView;
    #createAccountView?: CreateAccountView;
    #upgradeView?: UpgradeView;
    #buildingView?: BuildingView;
    #roboBuyActive: boolean = false;
    #roboBuyInterval?: number;

    constructor() {
        this.#loginPageView = new LoginPageView(this);
    }

    /**
     * Navigates back to the main login page, clearing any active login or
     * registration views.
     */
    showLoginPage(): void {
        this.#createAccountView = undefined;
        this.#loginView = undefined;
        this.#loginPageView = new LoginPageView(this);
    }

    /**
     * Navigates to the account creation view.
     */
    showCreateAccount(): void {
        this.#loginPageView = undefined;
        this.#createAccountView = new CreateAccountView(this);
    }

    /**
     * Navigates to the login view.
     */
    showLogin(): void {
        this.#loginPageView = undefined;
        this.#loginView = new LoginView(this);
    }

    /**
     * Creates a new account with hashed password, initializes default upgrades
     * and buildings, persists everything to the database, then launches the game.
     */
    async addAccount(username: string, password: string): Promise<void> {
        if (username.length === 0) throw new InvalidUsernameException("Username cannot be empty.");
        if (password.length === 0) throw new InvalidPasswordException("Password cannot be empty.");

        const hashedPassword = await Clickersimulation.hashPassword(username, password);
        this.#clickersimulation = new ClickerSimulation(username, hashedPassword, 0, 1, 0);

        // Load upgrades from inventory and register them on the new account
        const additiveUpgrades = await Additiveupgrade.getFromInventory(this.#clickersimulation);
        const multiplicativeUpgrades = await Multiplicativeupgrade.getFromInventory(this.#clickersimulation);
        additiveUpgrades.forEach(u => this.#clickersimulation!.addUpgrade(u));
        multiplicativeUpgrades.forEach(u => this.#clickersimulation!.addUpgrade(u));

        // Load buildings from inventory and register them on the new account
        const additiveBuildings = await Additivebuilding.getFromInventory(this.#clickersimulation);
        const multiplicativeBuildings = await Multiplicativebuilding.getFromInventory(this.#clickersimulation);
        additiveBuildings.forEach(b => this.#clickersimulation!.addBuilding(b));
        multiplicativeBuildings.forEach(b => this.#clickersimulation!.addBuilding(b));

        // saveClickerSimulation will persist the account and all its upgrades/buildings
        await Clickersimulation.saveClickerSimulation(this.#clickersimulation);

        await this.#loadModel();

        this.#createAccountView = undefined;
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation, this);
        this.#upgradeView = new UpgradeView(this, this.#clickersimulation.upgrades);
        this.#buildingView = new BuildingView(this, this.#clickersimulation.buildings);
        this.#clickersimulation.registerListener(this.#upgradeView);
        this.#clickersimulation.registerListener(this.#buildingView);
    }

    /**
     * Authenticates an existing account by hashing the password and querying
     * the database, then launches the game with the retrieved account state.
     */
    async login(username: string, password: string): Promise<void> {
        const hashedPassword = await Clickersimulation.hashPassword(username, password);
        const account = await Clickersimulation.getAccountByUsername(username, hashedPassword);

        this.#clickersimulation = account;

        await this.#loadModel();

        this.#loginView = undefined;
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation, this);
        this.#upgradeView = new UpgradeView(this, this.#clickersimulation.upgrades);
        this.#buildingView = new BuildingView(this, this.#clickersimulation.buildings);
        this.#clickersimulation.registerListener(this.#upgradeView);
        this.#clickersimulation.registerListener(this.#buildingView);
    }

    /**
     * Fetches the trained Markov model from model.json and loads it into the simulation.
     * model.json must be in the model-training directory so it is served statically.
     */
    async #loadModel(): Promise<void> {
        const response = await fetch('/model-training/model.json');
        const { numerator, denominator } = await response.json();
        this.#clickersimulation!.loadMarkovModel(numerator, denominator);
    }

    /**
     * Toggles the robo-buy feature on or off.
     * While active, attempts to auto-purchase an item every second using the Markov chain.
     */
    toggleRoboBuy(): void {
        this.#roboBuyActive = !this.#roboBuyActive;
        if (this.#roboBuyActive) {
            this.#roboBuyInterval = window.setInterval(() => {
                this.#clickersimulation!.roboBuyNext();
            }, 1000);
        } else {
            clearInterval(this.#roboBuyInterval);
        }
    }

    get roboBuyActive(): boolean {
        return this.#roboBuyActive;
    }

    get totalClicks(): number {
        return this.#clickersimulation!.totalClicks;
    }

    /**
     * Increases the total click count based on the current click power
     * and triggers model updates.
     */
    updateTotalClicks(): void {
        if (!this.#clickersimulation) return;
        this.#clickersimulation.updateTotalClicks(this.#clickersimulation.clickPower);
    }

    /**
     * Increases the total click count based on the current autoCPS,
     * called by the view's setInterval on each tick.
     */
    updateTotalClicksAuto(): void {
        if (!this.#clickersimulation) return;
        this.#clickersimulation.updateTotalClicks(this.#clickersimulation.autoCPS);
    }

    /**
     * Attempts to purchase and apply an upgrade instance.
     */
    applyUpgrade(upgrade: Upgrade): void {
        this.#clickersimulation!.applyUpgrade(upgrade);
    }

    /**
     * Attempts to purchase and apply a building instance.
     */
    applyBuilding(building: Building): void {
        this.#clickersimulation!.applyBuilding(building);
    }

    /**
     * Commands the upgrade view to display details for a specific upgrade.
     */
    showUpgradeDescription(upgrade: Upgrade): void {
        this.#upgradeView!.updateUpgradeDescription(upgrade);
    }

    /**
     * Commands the building view to display details for a specific building.
     */
    showBuildingDescription(building: Building): void {
        this.#buildingView!.updateBuildingDescription(building);
    }

    /**
     * Commands the upgrade view to hide or remove the description overlay.
     */
    closeUpgradeDescription(): void {
        this.#upgradeView!.closeView();
    }

    /**
     * Commands the building view to hide or remove the description overlay.
     */
    closeBuildingDescription(): void {
        this.#buildingView!.closeView();
    }
}
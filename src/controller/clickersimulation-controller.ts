import Clickersimulation from "../model/clickersimulation.ts";
import Additiveupgrade from "../model/additiveupgrade.ts";
import ClickerSimulationView from "../view/clickersimulation-view.ts";
import Multiplicativeupgrade from "../model/multiplicativeupgrade.ts";
import UpgradeView from "../view/upgrade-view.ts";
import Additivebuilding from "../model/additivebuilding.ts";
import Multiplicativebuilding from "../model/multiplicativebuilding.ts";
import BuildingView from "../view/building-view.ts";
import ClickerSimulation from "../model/clickersimulation.ts";
import CreateAccountView from "../view/createaccount-view.ts";

/**
 * Acts as the intermediary between the ClickerSimulation model and the UI views.
 * Coordinates user input from the views, updates the game state, and initializes
 * the starting set of upgrades for the simulation.
 */
export default class ClickerSimulationController {
    #clickersimulation?: Clickersimulation;
    #clickerSimulationView?: ClickerSimulationView;
    #createAccountView?: CreateAccountView;
    #upgradeView?: UpgradeView;
    #buildingView?: BuildingView;

    constructor() {

        let accountPromise = ClickerSimulation.getAllAccounts();

        accountPromise.then((allAccounts) => {
            if (allAccounts.length == 0) {
                // if no trainers: then make an instance of create trainer view:
                this.#createAccountView = new CreateAccountView(this);
            } else {
                // if there are trainers: then make an instance of trainer view :
                this.#clickersimulation = allAccounts.at(0);
                this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation!, this);
            }
        })
    }

    addAccount(username: string, password: string): void {
        this.#clickersimulation = new ClickerSimulation(username, password, 0, 1);
        Clickersimulation.saveClickerSimulation(this.#clickersimulation);
        this.#createAccountView = undefined;
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation, this);

        let additiveUpgrade = new Additiveupgrade(
            "additiveUpgrade1", 10, 1, this.#clickersimulation);
        this.#clickersimulation.addUpgrade(additiveUpgrade);

        let multiplicativeUpgrade = new Multiplicativeupgrade(
            "multiplicativeUpgrade1", 20, 1.2, this.#clickersimulation);
        this.#clickersimulation.addUpgrade(multiplicativeUpgrade);

        let additiveBuilding = new Additivebuilding(
            "additiveBuilding1", 15, 1);
        this.#clickersimulation.addBuilding(additiveBuilding);

        let multiplicativeBuilding = new Multiplicativebuilding(
            "multiplicativeBuilding1", 25, 1.5);
        this.#clickersimulation.addBuilding(multiplicativeBuilding);

        this.#upgradeView = new UpgradeView(this);
        this.#buildingView = new BuildingView(this);
    }

    /**
     * Increases the total click count based on the current click power
     * and triggers model updates.
     */
    updateTotalClicks(): void {
        if (!this.#clickersimulation) return;

        this.#clickersimulation.updateTotalClicks(this.#clickersimulation.clickPower);
        // console.log("increased total clicks by " + this.#clickersimulation.clickPower);
    }

    /**
     * Attempts to purchase and apply an upgrade based on its unique ID.
     */
    applyUpgrade(id: string): void {
        if (!this.#clickersimulation) return;

        const upgrade = this.#clickersimulation.getUpgradeById(id);
        this.#clickersimulation.applyUpgrade(upgrade);
    }

    /**
     * Attempts to purchase and apply a building based on its unique ID.
     */
    applyBuilding(id: string): void {
        const building = this.#clickersimulation!.getBuildingById(id);
        this.#clickersimulation!.applyBuilding(building);
    }

    /**
     * Commands the upgrade view to display details for a specific upgrade.
     */
    showUpgradeDescription(id: string): void {
        const upgrade = this.#clickersimulation!.getUpgradeById(id);
        this.#upgradeView!.updateUpgradeDescription(upgrade);
    }

    /**
     * Commands the building view to display details for a specific building.
     */
    showBuildingDescription(id: string): void {
        const building = this.#clickersimulation!.getBuildingById(id);
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
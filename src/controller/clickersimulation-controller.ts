import Clickersimulation from "../model/clickersimulation.ts";
import Additiveupgrade from "../model/additiveupgrade.ts";
import ClickerSimulationView from "../view/clickersimulation-view.ts";
import Multiplicativeupgrade from "../model/multiplicativeupgrade.ts";
import UpgradeView from "../view/upgrade-view.ts";

/**
 * Acts as the intermediary between the ClickerSimulation model and the UI views.
 * Coordinates user input from the views, updates the game state, and initializes
 * the starting set of upgrades for the simulation.
 */
export default class ClickerSimulationController {
    #clickersimulation: Clickersimulation;
    #clickerSimulationView: ClickerSimulationView;
    #upgradeView: UpgradeView;

    constructor() {
        this.#clickersimulation = new Clickersimulation();
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation, this);

        let additiveUpgrade = new Additiveupgrade(
            "additiveUpgrade1", 10, 1);
        this.#clickersimulation.addUpgrade(additiveUpgrade);

        let multiplicativeUpgrade = new Multiplicativeupgrade(
            "multiplicativeUpgrade1", 20, 1.2);
        this.#clickersimulation.addUpgrade(multiplicativeUpgrade);

        this.#upgradeView = new UpgradeView(additiveUpgrade, this);
    }

    /**
     * Increases the total click count based on the current click power
     * and triggers model updates.
     */
    updateTotalClicks(): void {
        this.#clickersimulation.updateTotalClicks(this.#clickersimulation.clickPower);
        // console.log("increased total clicks by " + this.#clickersimulation.clickPower);
    }

    /**
     * Attempts to purchase and apply an upgrade based on its unique ID.
     */
    applyUpgrade(id: string): void {
        const upgrade = this.#clickersimulation.getUpgradeById(id);
        this.#clickersimulation.applyUpgrade(upgrade);
    }

    /**
     * Commands the upgrade view to display details for a specific upgrade.
     */
    showUpgradeDescription(id: string): void {
        const upgrade = this.#clickersimulation.getUpgradeById(id);
        this.#upgradeView.updateUpgradeDescription(upgrade);
    }

    /**
     * Commands the upgrade view to hide or remove the description overlay.
     */
    closeUpgradeDescription(): void {
        this.#upgradeView.closeView();
    }
}
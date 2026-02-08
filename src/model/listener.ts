/**
 * Defines the contract for an observer in the simulation.
 * Objects implementing this interface can subscribe to updates and
 * execute logic whenever a specific event or state change occurs.
 */
export default interface Listener {
    notify(): void;
}
import { expect, test } from 'vitest';
import Additiveupgrade from "../src/model/additiveupgrade";
import Clickersimulation, {InsuficientClicksException, UpgradeNotFoundException} from "../src/model/clickersimulation";
import Multiplicativeupgrade from "../src/model/multiplicativeupgrade";

test('Can add upgrade', () => {
    let au = new Additiveupgrade("additive1", 10, 1);
    let cs = new Clickersimulation();
    cs.addUpgrade(au);
    expect(cs.upgrades).contains(au);
});

test('can get existing upgrade by ID', () => {
    let au;
    let foundUpgrade;
    try {
        au = new Additiveupgrade("additive1", 10, 1);
        let cs = new Clickersimulation();
        cs.addUpgrade(au);
        foundUpgrade = cs.getUpgradeById("additive1");
    } catch (e: any) { }
    expect(foundUpgrade).toBe(au);
});

test('can catch nonexistent upgrade with UpgradeNotFoundException', () => {
    let caught = false;
    try {
        let cs = new Clickersimulation();
        cs.getUpgradeById("NONEXISTENT-ID");
    } catch (e: any) {
        if(e instanceof UpgradeNotFoundException) {
            caught = true;
        }
    }
    expect(caught).equals(true);
});

test('can catch insufficient clicks with InsuficientClicksException', () => {
    let mu = new Multiplicativeupgrade("additive1", 10, 1);
    let cs = new Clickersimulation();
    cs.addUpgrade(mu);
    let caught = false;

    try {
        cs.applyUpgrade(mu);
    } catch (e: any) {
        if(e instanceof InsuficientClicksException) {
            caught = true;
        }
    }
    expect(caught).equals(true);
});

test('can apply upgrade (increase clickPower)', () => {
    let au = new Additiveupgrade("additive1", 10, 1);
    let cs = new Clickersimulation();
    cs.addUpgrade(au);

    let initialClickPower = cs.clickPower;
    cs.updateTotalClicks(100);
    cs.applyUpgrade(au);
    let updatedClickPower = cs.clickPower;
    expect(updatedClickPower - initialClickPower).equals(au.additiveEffect);
});

test("notify clicker simulation listeners", () => {
    let au = new Additiveupgrade("additive1", 10, 1);
    let cs = new Clickersimulation();
    let notified = false;

    cs.registerListener({notify: () => notified = true});
    cs.addUpgrade(au);
    expect(notified).equals(true);
});

test("notify additive listeners", () => {
    let au = new Additiveupgrade("additive1", 10, 1);
    let notified = false;

    au.registerListener({notify: () => notified = true});
    au.applyUpgrade();
    expect(notified).equals(true);
});

test("notify multiplicative listeners", () => {
    let mu = new Multiplicativeupgrade("multiplicative1", 10, 1.1);
    let notified = false;

    mu.registerListener({notify: () => notified = true});
    mu.applyUpgrade();
    expect(notified).equals(true);
});
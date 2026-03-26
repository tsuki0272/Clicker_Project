import { expect, test, beforeEach } from 'vitest';
import Additiveupgrade from "../src/model/additiveupgrade";
import Clickersimulation, {InsuficientClicksException, UpgradeNotFoundException, BuildingNotFoundException, InvalidBuildingPurchaseException, DuplicateUsernameException} from "../src/model/clickersimulation";
import Multiplicativeupgrade from "../src/model/multiplicativeupgrade";
import Additivebuilding from "../src/model/additivebuilding";
import Multiplicativebuilding from "../src/model/multiplicativebuilding";
import db from "../src/model/connection";

const makeAccount = () => new Clickersimulation("user", "password", 0, 1, 0);

beforeEach(async () => {
    await db().exec(`
        delete from building;
        delete from upgrade;
        delete from account;
    `);
});

// ── Upgrades ────────────────────────────────────────────────────────────────

test('can add upgrade', () => {
    let cs = makeAccount();
    let au = new Additiveupgrade("additive1", "Increases CLICK POWER by 1", 10, 1, cs);
    cs.addUpgrade(au);
    expect(cs.upgrades).contains(au);
});

test('can catch nonexistent upgrade with UpgradeNotFoundException', () => {
    let caught = false;
    try {
        let cs = makeAccount();
        cs.getUpgradeByName("NONEXISTENT-ID");
    } catch (e: any) {
        if (e instanceof UpgradeNotFoundException) caught = true;
    }
    expect(caught).equals(true);
});

test('can catch insufficient clicks with InsuficientClicksException', () => {
    let cs = makeAccount();
    let mu = new Multiplicativeupgrade("multiplicative1", "Multiplies CLICK POWER by 1.1", 10, 1.1, cs);
    cs.addUpgrade(mu);
    let caught = false;
    try {
        cs.applyUpgrade(mu);
    } catch (e: any) {
        if (e instanceof InsuficientClicksException) caught = true;
    }
    expect(caught).equals(true);
});

test('can apply additive upgrade (increases clickPower)', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let au = new Additiveupgrade("additive1", "Increases CLICK POWER by 1", 10, 1, cs);
    cs.addUpgrade(au);
    await Additiveupgrade.saveUpgrade(au);
    let initialClickPower = cs.clickPower;
    cs.updateTotalClicks(100);
    cs.applyUpgrade(au);
    expect(cs.clickPower - initialClickPower).equals(au.additiveEffect);
});

test('can apply multiplicative upgrade (scales clickPower)', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let mu = new Multiplicativeupgrade("multiplicative1", "Multiplies CLICK POWER by 1.5", 10, 1.5, cs);
    cs.addUpgrade(mu);
    await Multiplicativeupgrade.saveUpgrade(mu);
    cs.updateTotalClicks(100);
    let initialClickPower = cs.clickPower;
    cs.applyUpgrade(mu);
    expect(cs.clickPower).equals(Math.ceil(initialClickPower * 1.5));
});

test('notify clicker simulation listeners', () => {
    let cs = makeAccount();
    let au = new Additiveupgrade("additive1", "Increases CLICK POWER by 1", 10, 1, cs);
    let notified = false;
    cs.registerListener({ notify: () => notified = true });
    cs.addUpgrade(au);
    expect(notified).equals(true);
});

test('notify additive upgrade listeners', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let au = new Additiveupgrade("additive1", "Increases CLICK POWER by 1", 10, 1, cs);
    await Additiveupgrade.saveUpgrade(au);
    let notified = false;
    au.registerListener({ notify: () => notified = true });
    au.applyUpgrade();
    expect(notified).equals(true);
});

test('notify multiplicative upgrade listeners', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let mu = new Multiplicativeupgrade("multiplicative1", "Multiplies CLICK POWER by 1.1", 10, 1.1, cs);
    await Multiplicativeupgrade.saveUpgrade(mu);
    let notified = false;
    mu.registerListener({ notify: () => notified = true });
    mu.applyUpgrade();
    expect(notified).equals(true);
});

// ── Buildings ────────────────────────────────────────────────────────────────

test('can add building', () => {
    let cs = makeAccount();
    let ab = new Additivebuilding("building1", "Increases AUTOMATIC CLICKS by 1", 15, 1, cs);
    cs.addBuilding(ab);
    expect(cs.buildings).contains(ab);
});

test('can catch nonexistent building with BuildingNotFoundException', () => {
    let caught = false;
    try {
        let cs = makeAccount();
        cs.getBuildingById("NONEXISTENT-ID");
    } catch (e: any) {
        if (e instanceof BuildingNotFoundException) caught = true;
    }
    expect(caught).equals(true);
});

test('can apply additive building (increases autoCPS)', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let ab = new Additivebuilding("building1", "Increases AUTOMATIC CLICKS by 1", 15, 1, cs);
    cs.addBuilding(ab);
    await Additivebuilding.saveBuilding(ab);
    cs.updateTotalClicks(100);
    cs.applyBuilding(ab);
    expect(cs.autoCPS).equals(1);
});

test('can catch insufficient clicks for building with InsuficientClicksException', () => {
    let cs = makeAccount();
    let ab = new Additivebuilding("building1", "Increases AUTOMATIC CLICKS by 1", 15, 1, cs);
    cs.addBuilding(ab);
    let caught = false;
    try {
        cs.applyBuilding(ab);
    } catch (e: any) {
        if (e instanceof InsuficientClicksException) caught = true;
    }
    expect(caught).equals(true);
});

test('can catch multiplicative building on zero autoCPS with InvalidBuildingPurchaseException', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let mb = new Multiplicativebuilding("multbuilding1", "Multiplies AUTOMATIC CLICKS by 1.5", 25, 1.5, cs);
    cs.addBuilding(mb);
    await Multiplicativebuilding.saveBuilding(mb);
    cs.updateTotalClicks(100);
    let caught = false;
    try {
        cs.applyBuilding(mb);
    } catch (e: any) {
        if (e instanceof InvalidBuildingPurchaseException) caught = true;
    }
    expect(caught).equals(true);
});

test('notify additive building listeners', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let ab = new Additivebuilding("building1", "Increases AUTOMATIC CLICKS by 1", 15, 1, cs);
    await Additivebuilding.saveBuilding(ab);
    let notified = false;
    ab.registerListener({ notify: () => notified = true });
    ab.applyBuilding();
    expect(notified).equals(true);
});

test('notify multiplicative building listeners', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let mb = new Multiplicativebuilding("multbuilding1", "Multiplies AUTOMATIC CLICKS by 1.5", 25, 1.5, cs);
    await Multiplicativebuilding.saveBuilding(mb);
    let notified = false;
    mb.registerListener({ notify: () => notified = true });
    mb.applyBuilding();
    expect(notified).equals(true);
});

// ── Account ──────────────────────────────────────────────────────────────────

test('can save and retrieve account', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let accounts = await Clickersimulation.getAllAccounts();
    expect(accounts.length).equals(1);
    expect(accounts[0].username).equals("user");
});

test('can catch duplicate username with DuplicateUsernameException', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let caught = false;
    try {
        let cs2 = makeAccount();
        await Clickersimulation.saveClickerSimulation(cs2);
    } catch (e: any) {
        if (e instanceof DuplicateUsernameException) caught = true;
    }
    expect(caught).equals(true);
});

test('can retrieve account by username and password', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let retrieved = await Clickersimulation.getAccountByUsername("user", "password");
    expect(retrieved.username).equals("user");
});

test('throws error on wrong password', async () => {
    let cs = makeAccount();
    await Clickersimulation.saveClickerSimulation(cs);
    let caught = false;
    try {
        await Clickersimulation.getAccountByUsername("user", "wrongpassword");
    } catch (e: any) {
        caught = true;
    }
    expect(caught).equals(true);
});
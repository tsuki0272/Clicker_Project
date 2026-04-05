---
title: Cursor Clicker
author: Alemtuba Longkumer (longkuma@myumanitoba.ca)
date: Winter 2026
---

# Domain model

## Conventions:
* Cardinality: symbols (1, +, *) on our relationship lines.
* 1: exactly 0 or 1; +: one or more; *: 0 or more.
* If a value can be null/undef: use ? as type prefix.
* If a value must be unique for all instances of that class use ~ as type prefix.
* Relationships will be bidirectional.

```mermaid
classDiagram
    class Clickersimulation {
        -~String username
        -String password
        -number totalClicks
        -number clickPower
        -number autoCPS
        -Array ~Upgrade~ upgrades
        -Array ~Building~ buildings

        +get username() String
        +get password() String
        +get totalClicks() number
        +get clickPower() number
        +get autoCPS() number
        +get upgrades() Array ~Upgrade~
        +get buildings() Array ~Building~
        +addUpgrade(Upgrade upgrade) void
        +addBuilding(Building building) void
        +getUpgradeByName(String name) Upgrade
        +getBuildingById(String id) Building
        +applyUpgrade(Upgrade upgrade) void
        +applyBuilding(Building building) void
        +updateTotalClicks(number by) void
        +static hashPassword(String username, String password) Promise~String~
        +static getAllAccounts() Promise~Array~
        +static saveClickerSimulation(ClickerSimulation cs) Promise~ClickerSimulation~
        +static updateAccount(ClickerSimulation cs) Promise~void~
        +static getAccountByUsername(String username, String password) Promise~ClickerSimulation~
    }

    class Upgrade {
        <<interface>>
        -?number id
        -~String name
        -String description
        -number cost

        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number

        +applyUpgrade() void
        +saveUpgrade(Upgrade upgrade) Promise~Upgrade~
    }

    class Additiveupgrade {
        -?number id
        -~String name
        -String description
        -number cost
        -number additiveEffect

        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get additiveEffect() number

        +applyUpgrade() void
        +saveUpgrade(Upgrade upgrade) Promise~Upgrade~
        +static saveUpgrade(Additiveupgrade upgrade) Promise~Upgrade~
        +static getUpgradesForAccount(ClickerSimulation cs) Promise~Array~
        +static updateUpgrade(Additiveupgrade upgrade) Promise~void~
    }

    class MultiplicativeUpgrade {
        -?number id
        -~String name
        -String description
        -number cost
        -number multiplicativeEffect

        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get multiplicativeEffect() number

        +applyUpgrade() void
        +saveUpgrade(Upgrade upgrade) Promise~Upgrade~
        +static saveUpgrade(MultiplicativeUpgrade upgrade) Promise~Upgrade~
        +static getUpgradesForAccount(ClickerSimulation cs) Promise~Array~
        +static updateUpgrade(MultiplicativeUpgrade upgrade) Promise~void~
    }

    class Building {
        <<interface>>
        -?number dbId
        -~String name
        -String description
        -number cost

        +get id() String
        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number

        +applyBuilding() void
        +saveBuilding(Building building) Promise~Building~
    }

    class AdditiveBuilding {
        -?number dbId
        -~String name
        -String description
        -number cost
        -number additiveValue

        +get id() String
        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get additiveValue() number

        +applyBuilding() void
        +saveBuilding(Building building) Promise~Building~
        +static saveBuilding(AdditiveBuilding building) Promise~Building~
        +static getBuildingsForAccount(ClickerSimulation cs) Promise~Array~
        +static updateBuilding(AdditiveBuilding building) Promise~void~
    }

    class MultiplicativeBuilding {
        -?number dbId
        -~String name
        -String description
        -number cost
        -number multiplicativeValue

        +get id() String
        +get name() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get multiplicativeValue() number

        +applyBuilding() void
        +saveBuilding(Building building) Promise~Building~
        +static saveBuilding(MultiplicativeBuilding building) Promise~Building~
        +static getBuildingsForAccount(ClickerSimulation cs) Promise~Array~
        +static updateBuilding(MultiplicativeBuilding building) Promise~void~
    }

    note for Clickersimulation "Class invariants:
    <ul>
        <li> username.size() >= 1
        <li> password.size() >= 1
        <li> totalClicks >= 0
        <li> clickPower >= 0
        <li> autoCPS >= 0
    </ul>"

    note for Additiveupgrade "Class invariants:
    <ul>
        <li> name.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> additiveEffect > 0
    </ul>"

    note for MultiplicativeUpgrade "Class invariants:
    <ul>
        <li> name.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> multiplicativeEffect > 0
    </ul>"

    note for AdditiveBuilding "Class invariants:
    <ul>
        <li> name.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> additiveValue > 0
    </ul>"

    note for MultiplicativeBuilding "Class invariants:
    <ul>
        <li> name.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> multiplicativeValue > 0
    </ul>"

    Clickersimulation "1" --* "*" Upgrade
    Clickersimulation "1" --* "*" Building

    Upgrade <|.. Additiveupgrade
    Upgrade <|.. MultiplicativeUpgrade

    Building <|.. AdditiveBuilding
    Building <|.. MultiplicativeBuilding
```
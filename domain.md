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

## Changes in Phase 2:
* Added 3 new classes:
  * Account (contains an instance of ClickerSimulation and handles user identification)
  * Building (interface, used for autoclicking)
    * AdditiveBuilding
    * MultiplicativeBuilding

* Made Changes to ClickerSimulation:
  * Added array of Buildings and supporting methods
  * Added new field **autoCPS** that will increase totalClicks automatically
  * Buildings will increase autoCPS by a certain amount with every purchase

* Added data modelling information like cardinality, constraints, and bidirectional relationships.
  * 1 Account is composed of 1 ClickerSimulation
  * 1 ClickerSimulation is composed of many Upgrades

```mermaid
classDiagram
    class Account {
        -~String username
        -String password
        -ClickerSimulation clickerSim
        
        +get username() String
        +get password() String
        +set username() 
        +set password()
    }
    
    class Clickersimulation {
        -number totalClicks
        -number clickPower
        -number autoCPS
        -Array ~Upgrade~ upgrades
        -Array ~Building~ buildings
        
        +get totalClicks() number
        +get clickPower() number
        +get autoCPS() number
        +get upgrades() Array ~Upgrade~
        +get buildings() Array ~Building~
        +addUpgrade(Upgrade upgrade)
        +getUpgradeById(String id) Upgrade
        +updateTotalClicks(number clicks) void
        +addBuilding(Building building)
        +getBuildingById(String id) Building
    }
    
    class Upgrade {
        <<interface>>
        -~String id
        -String description
        -number cost
        
        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number
        
        +applyUpgrade() void
    }
    
    class Additiveupgrade {
        -~String id
        -String description
        -number cost
        -number additiveEffect

        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get additiveEffect() number
        
        +applyUpgrade() void
    }

    class MultiplicativeUpgrade {
        -~String id
        -String description
        -number cost
        -number multiplicativeEffect

        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get multiplicativeEffect() number
        
        +applyUpgrade() void
    }

    class Building {
        <<interface>>
        -~String id
        -String description
        -number cost

        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number

        +buyBuilding() void
    }
    
    class AdditiveBuilding {
        -String id
        -String description
        -number cost
        -number additiveValue

        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get additiveValue() number

        +buyBuilding() void
    }

    class MultiplicativeBuilding {
        -String id
        -String description
        -number cost
        -number multiplicativeValue

        +get id() String
        +get description() String
        +set description(String d)
        +get cost() number
        +get multiplicativeValue() number

        +buyBuilding() void
    }

    note for Account "Class invariants:  
    <ul>
        <li> username.size() >= 1
        <li> password.size() >= 1
    </ul>
    
    "
    
    note for Clickersimulation "Class invariants:  
    <ul>
        <li> totalClicks >= 0
        <li> clickPower >= 0
        <li> autoCPS >= 0
    </ul>"
        
    note for Additiveupgrade "Class invariants: 
    <ul>
        <li> id.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> additiveEffect > 0
    </ul>"

    note for MultiplicativeUpgrade "Class invariants: 
    <ul>
        <li> id.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> multiplicativeEffect > 0
    </ul>"

    note for AdditiveBuilding "Class invariants: 
    <ul>
        <li> id.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> additiveValue > 0
    </ul>"

    note for MultiplicativeBuilding "Class invariants: 
    <ul>
        <li> id.size() > 0
        <li> description.size() > 0
        <li> cost > 0
        <li> multiplicativeValue > 0
    </ul>"
    
    Account "1" --* "1" Clickersimulation
    Clickersimulation "1" --* "*" Upgrade
    Clickersimulation "1" --* "*" Building

    Upgrade <|.. Additiveupgrade
    Upgrade <|.. MultiplicativeUpgrade
    
    Building <|.. AdditiveBuilding
    Building <|.. MultiplicativeBuilding
```
---
title: Flows of interaction for Clicker Project
author: Alemtuba Longkumer (longkuma@myumanitoba.ca)
date: Winter 2026
---

# Flows of Interaction

## Diagrams

### Clicking System
* In this task, the flow of interaction for user clicks on a 'thing' (A CURSOR button in this case) is modelled. Listed below is the desired flow:
  * User clicks on the CURSOR item
  * User is able to see the number of times that the thing has been clicked
```mermaid
flowchart
    subgraph Clicking System
        start[[Display Total Clicks]]
            start == User Clicks CURSOR ==> calculateClick

        calculateClick{Process Click}
            calculateClick -. Calculated Click Value .-> displayUpdatedTotalClicks
            
        displayUpdatedTotalClicks[[Display Updated Total Clicks]]
    end
```

### Purchase Upgrade
* In this task, the flow of interaction for purchasing an upgrade is modelled. Listed below is the desired flow:
  * User can view and purchase an upgrade
  * Purchasing an upgrade will increase the power of clicking (e.g., clicking once gives you 10 clicks).
```mermaid
flowchart
    subgraph Purchasing an Upgrade
    displayUpgrades[[Display Upgrade]]
        displayUpgrades == User Clicks Upgrade ==> hasSufficientClicks
        
    hasSufficientClicks{Process Upgrade Purchase}
      hasSufficientClicks -. Updated click power .-> displayConfirmation
        hasSufficientClicks -. Insufficient Clicks error.-> displayUpgrades

    displayConfirmation[[Display Confirmation of Upgrade Transaction]]
    
    end
```
-- Accounts
create table if not exists account (
    username varchar(255) not null unique,
    password varchar(255) not null,
    total_clicks int not null,
    click_power int not null,
    auto_cps int not null
);

-- Upgrade
-- Using Flattened Hierarchy for Additive/Multiplicative effect
create table if not exists upgrade (
    id serial not null unique,
    name varchar(255) not null,
    description varchar(255) not null,
    cost int not null,
    additive_effect int,
    multiplicative_effect numeric,
    account_id varchar(255) not null,
    foreign key (account_id) references account(username)
        on delete cascade
);

-- Building
-- Using Flattened Hierarchy for Additive/Multiplicative value
create table if not exists building (
    id serial not null unique,
    name varchar(255) not null,
    description varchar(255) not null,
    cost int not null,
    additive_value int,
    multiplicative_value numeric,
    account_id varchar(255) not null,
    foreign key (account_id) references account(username)
        on delete cascade
);

drop table if exists building_inventory;
drop table if exists upgrade_inventory;

create table upgrade_inventory (
    id serial not null unique,
    name varchar(255) not null unique,
    description varchar(255) not null,
    cost int not null,
    additive_effect int,
    multiplicative_effect numeric
);

create table building_inventory (
    id serial not null unique,
    name varchar(255) not null unique,
    description varchar(255) not null,
    cost int not null,
    additive_value int,
    multiplicative_value numeric
);

-- Initializing upgrade inventory
insert into upgrade_inventory(name, description, cost, additive_effect)
values('additiveUpgrade1', 'Increase CLICK POWER by 10', 10, 10);

insert into upgrade_inventory(name, description, cost, multiplicative_effect)
values('multiplicativeUpgrade1', 'Multiply CLICK POWER by 1.2', 20, 1.2);

-- 6 new purchasable upgrades:
insert into upgrade_inventory(name, description, cost, additive_effect)
values('additiveUpgrade2', 'Increase CLICK POWER by 1', 5, 1);

insert into upgrade_inventory(name, description, cost, additive_effect)
values('additiveUpgrade3', 'Increase CLICK POWER by 25', 30, 25);

insert into upgrade_inventory(name, description, cost, additive_effect)
values('additiveUpgrade4', 'Increase CLICK POWER by 50', 75, 50);

insert into upgrade_inventory(name, description, cost, multiplicative_effect)
values('multiplicativeUpgrade2', 'Multiply CLICK POWER by 2.0', 50, 2.0);

insert into upgrade_inventory(name, description, cost, multiplicative_effect)
values('multiplicativeUpgrade3', 'Multiply CLICK POWER by 1.5', 60, 1.5);

insert into upgrade_inventory(name, description, cost, multiplicative_effect)
values('multiplicativeUpgrade4', 'Multiply CLICK POWER by 3.0', 150, 3.0);


-- Initializing building inventory
insert into building_inventory(name, description, cost, additive_value)
values('additiveBuilding1', 'Increase AUTOMATIC CLICKS by 1', 15, 1);

insert into building_inventory(name, description, cost, multiplicative_value)
values('multiplicativeBuilding1', 'Multiply AUTOMATIC CLICKS by 1.5', 25, 1.5);

-- 4 new purchasable buildings:
insert into building_inventory(name, description, cost, additive_value)
values('additiveBuilding2', 'Increase AUTOMATIC CLICKS by 5', 50, 5);

insert into building_inventory(name, description, cost, additive_value)
values('additiveBuilding3', 'Increase AUTOMATIC CLICKS by 10', 120, 10);

insert into building_inventory(name, description, cost, multiplicative_value)
values('multiplicativeBuilding2', 'Multiply AUTOMATIC CLICKS by 2.0', 80, 2.0);

insert into building_inventory(name, description, cost, multiplicative_value)
values('multiplicativeBuilding3', 'Multiply AUTOMATIC CLICKS by 3.0', 300, 3.0);
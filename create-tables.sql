-- Accounts
create table account(
    id serial not null unique,
    username varchar(255) not null unique,
    password varchar(255) not null
);

-- Clicker Simulation
create table clicker_simulation(
    id serial not null unique,
    total_clicks int not null,
    click_power int not null,
    account_id serial,
    foreign key (account_id) references account(id)
        on delete cascade
);

-- Upgrade
-- Using Flattened Hierarchy for Additive/Multiplicative
create table upgrade(
    id serial not null unique,
    description varchar(255) not null,
    cost int not null,
    additive_effect int,
    multiplicative_effect int,
    game_id serial,
    foreign key (game_id) references clicker_simulation(id)
        on delete cascade
);
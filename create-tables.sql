-- Accounts
create table if not exists account (
    id serial not null unique,
    username varchar(255) not null unique,
    password varchar(255) not null,
    total_clicks int not null,
    click_power int not null
);

-- Upgrade
-- Using Flattened Hierarchy for Additive/Multiplicative effect
create table if not exists upgrade (
    id serial not null unique,
    description varchar(255) not null,
    cost int not null,
    additive_effect int,
    multiplicative_effect int,
    account_id serial not null,
    foreign key (account_id) references account(id)
        on delete cascade
);

-- Building
-- Using Flattened Hierarchy for Additive/Multiplicative value
create table if not exists building (
    id serial not null unique,
    description varchar(255) not null,
    cost int not null,
    additive_value int,
    multiplicative_value int,
    account_id serial not null,
    foreign key (account_id) references account(id)
        on delete cascade
);

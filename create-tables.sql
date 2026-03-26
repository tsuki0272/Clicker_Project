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

-- after creating the tables, we could load
-- some default data into our database:

-- insert into account(username, password, total_clicks, click_power, auto_cps) values('test', 'test_pw', 0, 1, 0);
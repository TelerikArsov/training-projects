create table tags(
    id bigserial primary key,
    name text unique not null,
    color text default '#808080',
    visible boolean not null
);

create table categories(
    id bigserial primary key,
    name text unique not null,
    color text default '#808080',
    visible boolean not null
);

create table products(
    id bigserial primary key,
    name text unique not null,
    manifacturer text not null,
    description text not null,
    cost bigint not null,
    category_id bigint REFERENCES categories(id),
    visible boolean not null
);

create table product_tags(
    id bigserial primary key,
    product_id bigint REFERENCES products(id),
    tag_id bigint REFERENCES tags(id)
);

create table users(
    id bigserial primary key,
    username text unique not null,
    password text not null,
    email text unique not null,
    created_on timestamp not null,
    last_login timestamp
);

create table workers(
    id bigserial primary key,
    username text unique not null,
    password text not null,
    email text unique not null,
    created_on timestamp not null,
    last_login timestamp,
    role text
);

create table cart(
    id bigserial primary key,
    user_id bigint REFERENCES users(id),
    created_date timestamp not null
);

create table cart_items(
    id bigserial primary key,
    product_id bigint REFERENCES products(id),
    quantity int not null,
    created_date timestamp not null,
    cart_id bigint REFERENCES cart(id),
    price bigint not null
);

create table orders(
    id bigserial primary key,
    user_id bigint REFERENCES users(id),
    payed bigint not null,
    reciever_name text not null,
    address text not null,
    created_date timestamp not null
);

create table order_items(
    id bigserial primary key,
    product_id bigint REFERENCES products(id),
    quantity int not null,
    created_date timestamp not null,
    order_id bigint REFERENCES orders(id),
    price bigint not null
);

create table product_ratings(
    id bigserial primary key,
    user_id bigint REFERENCES users(id),
    product_id bigint REFERENCES products(id),
    rating smallint not null
);

create table product_quantity(
    id bigserial primary key,
    product_id bigint REFERENCES products(id),
    quantity int not null
);
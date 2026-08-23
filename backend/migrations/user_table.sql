--user table code

create table if not exists users(
    user_id uuid primary key default gen_random_uuid(),
    email text unique not null, 
    password_hash text not null,
    username text default user, 
    dob date not null
);

--pending verifications 
create table if not exists pending_verifications(
    pending_id uuid primary key default gen_random_uuid(),
    email text unique not null, 
    verification_code bigint, 
    expires_at timestamp with time zone DEFAULT (now()+ interval '5 minutes')
);

--password reset table
CREATE TABLE if not exists password_resets (
    reset_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    reset_code bigint NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + interval '5 minutes')
);

--
-- PostgreSQL database dump
--

\restrict ddifKaIA6RFEoq5OEBVnIhpytMeeFv3if3q8h5MNIZrJLBqRpe4aqpEbSPatyKV

-- Dumped from database version 17.6 (Debian 17.6-0+deb13u1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-0+deb13u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: loanstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.loanstatus AS ENUM (
    'ACTIVE',
    'PAID',
    'REFINANCED',
    'DEFAULTED'
);


--
-- Name: paymentfrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.paymentfrequency AS ENUM (
    'MONTHLY',
    'BIWEEKLY',
    'WEEKLY'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    icon character varying,
    balance double precision,
    currency character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    is_default boolean DEFAULT false
);


--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: billing_cycle_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_cycle_overrides (
    id integer NOT NULL,
    billing_cycle_id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    override_start_date date NOT NULL,
    reason character varying
);


--
-- Name: billing_cycle_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_cycle_overrides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_cycle_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_cycle_overrides_id_seq OWNED BY public.billing_cycle_overrides.id;


--
-- Name: billing_cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_cycles (
    id integer NOT NULL,
    name character varying,
    start_day integer NOT NULL,
    is_active boolean,
    next_override_date date
);


--
-- Name: billing_cycles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.billing_cycles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: billing_cycles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.billing_cycles_id_seq OWNED BY public.billing_cycles.id;


--
-- Name: budget_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_plans (
    id integer NOT NULL,
    cycle_name character varying NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    category_id integer NOT NULL,
    amount double precision NOT NULL,
    notes character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: budget_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_plans_id_seq OWNED BY public.budget_plans.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    parent_id integer,
    icon character varying,
    color character varying,
    description character varying,
    expense_type character varying,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: credit_card_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_installments (
    id integer NOT NULL,
    credit_card_id integer NOT NULL,
    concept character varying NOT NULL,
    original_amount numeric(10,2) NOT NULL,
    purchase_date date,
    current_installment integer,
    total_installments integer NOT NULL,
    monthly_payment numeric(10,2) NOT NULL,
    monthly_principal numeric(10,2),
    monthly_interest numeric(10,2),
    interest_rate numeric(5,2),
    remaining_capital numeric(10,2),
    is_active boolean,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_installments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_installments_id_seq OWNED BY public.credit_card_installments.id;


--
-- Name: credit_card_statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_statements (
    id integer NOT NULL,
    credit_card_id integer NOT NULL,
    statement_date date NOT NULL,
    due_date date NOT NULL,
    previous_balance numeric(10,2),
    new_charges numeric(10,2),
    payments_received numeric(10,2),
    interest_charges numeric(10,2),
    fees numeric(10,2),
    new_balance numeric(10,2),
    minimum_payment numeric(10,2),
    total_payment numeric(10,2),
    revolving_balance numeric(10,2),
    installments_balance numeric(10,2),
    pdf_file_path character varying,
    raw_text text,
    ai_parsed boolean,
    ai_confidence numeric(3,2),
    parsing_errors json,
    manual_review_required boolean,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: credit_card_statements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_statements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_statements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_statements_id_seq OWNED BY public.credit_card_statements.id;


--
-- Name: credit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_cards (
    id integer NOT NULL,
    user_id integer,
    name character varying NOT NULL,
    bank character varying NOT NULL,
    card_type character varying,
    last_four_digits character varying(4),
    credit_limit numeric(10,2) NOT NULL,
    current_balance numeric(10,2),
    available_credit numeric(10,2),
    revolving_debt numeric(10,2),
    payment_due_day integer,
    statement_close_day integer,
    revolving_interest_rate numeric(5,2),
    is_active boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: credit_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_cards_id_seq OWNED BY public.credit_cards.id;


--
-- Name: loan_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_payments (
    id integer NOT NULL,
    loan_id integer NOT NULL,
    payment_date date NOT NULL,
    amount double precision NOT NULL,
    principal double precision NOT NULL,
    interest double precision NOT NULL,
    remaining_balance double precision NOT NULL,
    installment_number integer NOT NULL,
    transaction_id integer,
    notes character varying(500),
    created_at timestamp without time zone
);


--
-- Name: loan_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_payments_id_seq OWNED BY public.loan_payments.id;


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    entity character varying(100) NOT NULL,
    original_amount double precision NOT NULL,
    current_debt double precision NOT NULL,
    annual_rate double precision NOT NULL,
    monthly_payment double precision NOT NULL,
    total_installments integer NOT NULL,
    base_installments_paid integer,
    payment_frequency public.paymentfrequency,
    payment_day integer,
    start_date date NOT NULL,
    end_date date,
    status public.loanstatus,
    currency character varying(3),
    notes character varying(500),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: loans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loans_id_seq OWNED BY public.loans.id;


--
-- Name: quick_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quick_templates (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    amount double precision NOT NULL,
    type character varying NOT NULL,
    category_id integer NOT NULL
);


--
-- Name: quick_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quick_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quick_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quick_templates_id_seq OWNED BY public.quick_templates.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    date date NOT NULL,
    category_id integer NOT NULL,
    account_id integer NOT NULL,
    amount double precision NOT NULL,
    currency character varying NOT NULL,
    exchange_rate double precision,
    amount_pen double precision NOT NULL,
    type character varying NOT NULL,
    description character varying,
    notes character varying,
    status character varying NOT NULL,
    transaction_type character varying NOT NULL,
    transfer_id character varying,
    related_transaction_id integer,
    loan_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: billing_cycle_overrides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycle_overrides ALTER COLUMN id SET DEFAULT nextval('public.billing_cycle_overrides_id_seq'::regclass);


--
-- Name: billing_cycles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycles ALTER COLUMN id SET DEFAULT nextval('public.billing_cycles_id_seq'::regclass);


--
-- Name: budget_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_plans ALTER COLUMN id SET DEFAULT nextval('public.budget_plans_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: credit_card_installments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments ALTER COLUMN id SET DEFAULT nextval('public.credit_card_installments_id_seq'::regclass);


--
-- Name: credit_card_statements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_statements ALTER COLUMN id SET DEFAULT nextval('public.credit_card_statements_id_seq'::regclass);


--
-- Name: credit_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards ALTER COLUMN id SET DEFAULT nextval('public.credit_cards_id_seq'::regclass);


--
-- Name: loan_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments ALTER COLUMN id SET DEFAULT nextval('public.loan_payments_id_seq'::regclass);


--
-- Name: loans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans ALTER COLUMN id SET DEFAULT nextval('public.loans_id_seq'::regclass);


--
-- Name: quick_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quick_templates ALTER COLUMN id SET DEFAULT nextval('public.quick_templates_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, name, type, icon, balance, currency, is_active, created_at, is_default) FROM stdin;
2	BCP	bank	wallet	5413.86	PEN	t	2025-11-19 01:11:02-05	t
1	Efectivo	cash	wallet	0	PEN	f	2025-11-19 01:11:02-05	f
\.


--
-- Data for Name: billing_cycle_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.billing_cycle_overrides (id, billing_cycle_id, year, month, override_start_date, reason) FROM stdin;
1	1	2025	10	2025-11-20	Pago Anticipado
2	1	2025	11	2025-11-21	Pago Anticipado
\.


--
-- Data for Name: billing_cycles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.billing_cycles (id, name, start_day, is_active, next_override_date) FROM stdin;
1	default	23	t	\N
2	default	23	t	\N
\.


--
-- Data for Name: budget_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_plans (id, cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at) FROM stdin;
87	Enero	2024-12-23	2025-01-22	19	1600	\N	2025-11-20 10:11:32.553019-05	2025-11-20 10:11:32.553019-05
88	Marzo	2025-02-23	2025-03-22	19	1600	\N	2025-11-20 10:11:36.122111-05	2025-11-20 10:11:36.122111-05
91	Septiembre	2025-08-23	2025-09-22	19	1600	\N	2025-11-20 10:11:36.141677-05	2025-11-20 10:11:36.141677-05
92	Junio	2025-05-23	2025-06-22	19	1600	\N	2025-11-20 10:11:36.154633-05	2025-11-20 10:11:36.154633-05
94	Abril	2025-03-23	2025-04-22	19	1600	\N	2025-11-20 10:11:36.151692-05	2025-11-20 10:11:36.151692-05
96	Octubre	2025-09-23	2025-10-22	19	1600	\N	2025-11-20 10:11:36.166276-05	2025-11-20 10:11:36.166276-05
99	Enero	2024-12-23	2025-01-22	31	300	\N	2025-11-20 10:12:06.829118-05	2025-11-20 10:12:06.829118-05
101	Abril	2025-03-23	2025-04-22	31	300	\N	2025-11-20 10:12:09.939365-05	2025-11-20 10:12:09.939365-05
104	Junio	2025-05-23	2025-06-22	31	300	\N	2025-11-20 10:12:09.942853-05	2025-11-20 10:12:09.942853-05
105	Agosto	2025-07-23	2025-08-22	31	300	\N	2025-11-20 10:12:09.953749-05	2025-11-20 10:12:09.953749-05
107	Mayo	2025-04-23	2025-05-22	31	300	\N	2025-11-20 10:12:09.954511-05	2025-11-20 10:12:09.954511-05
108	Octubre	2025-09-23	2025-10-22	31	300	\N	2025-11-20 10:12:09.965373-05	2025-11-20 10:12:09.965373-05
111	Enero	2024-12-23	2025-01-22	27	100	\N	2025-11-20 10:12:27.233652-05	2025-11-20 10:12:27.233652-05
112	Julio	2025-06-23	2025-07-22	27	100	\N	2025-11-20 10:12:30.169422-05	2025-11-20 10:12:30.169422-05
113	Mayo	2025-04-23	2025-05-22	27	100	\N	2025-11-20 10:12:30.170557-05	2025-11-20 10:12:30.170557-05
116	Marzo	2025-02-23	2025-03-22	27	100	\N	2025-11-20 10:12:30.176443-05	2025-11-20 10:12:30.176443-05
118	Agosto	2025-07-23	2025-08-22	27	100	\N	2025-11-20 10:12:30.194057-05	2025-11-20 10:12:30.194057-05
121	Septiembre	2025-08-23	2025-09-22	27	100	\N	2025-11-20 10:12:30.201381-05	2025-11-20 10:12:30.201381-05
126	Febrero	2025-01-23	2025-02-22	9	100	\N	2025-11-20 10:13:04.509775-05	2025-11-20 10:13:04.509775-05
128	Abril	2025-03-23	2025-04-22	9	100	\N	2025-11-20 10:13:04.513542-05	2025-11-20 10:13:04.513542-05
129	Mayo	2025-04-23	2025-05-22	9	100	\N	2025-11-20 10:13:04.511994-05	2025-11-20 10:13:04.511994-05
131	Junio	2025-05-23	2025-06-22	9	100	\N	2025-11-20 10:13:04.529152-05	2025-11-20 10:13:04.529152-05
132	Agosto	2025-07-23	2025-08-22	9	100	\N	2025-11-20 10:13:04.53761-05	2025-11-20 10:13:04.53761-05
134	Noviembre	2025-10-23	2025-11-22	9	100	\N	2025-11-20 10:13:04.540838-05	2025-11-20 10:13:04.540838-05
141	Marzo	2025-02-23	2025-03-22	21	164	\N	2025-11-20 13:18:39.709641-05	2025-11-20 13:18:39.709641-05
143	Septiembre	2025-08-23	2025-09-22	21	164	\N	2025-11-20 13:18:39.728139-05	2025-11-20 13:18:39.728139-05
146	Julio	2025-06-23	2025-07-22	21	164	\N	2025-11-20 13:18:39.748617-05	2025-11-20 13:18:39.748617-05
148	Abril	2025-03-23	2025-04-22	21	164	\N	2025-11-20 13:18:39.752697-05	2025-11-20 13:18:39.752697-05
149	Noviembre	2025-10-23	2025-11-22	21	164	\N	2025-11-20 13:18:39.763096-05	2025-11-20 13:18:39.763096-05
152	Febrero	2025-01-23	2025-02-22	20	260	\N	2025-11-20 13:19:38.079736-05	2025-11-20 13:19:38.079736-05
154	Abril	2025-03-23	2025-04-22	20	260	\N	2025-11-20 13:19:38.084958-05	2025-11-20 13:19:38.084958-05
155	Junio	2025-05-23	2025-06-22	20	260	\N	2025-11-20 13:19:38.085449-05	2025-11-20 13:19:38.085449-05
156	Mayo	2025-04-23	2025-05-22	20	260	\N	2025-11-20 13:19:38.086004-05	2025-11-20 13:19:38.086004-05
157	Agosto	2025-07-23	2025-08-22	20	260	\N	2025-11-20 13:19:38.105243-05	2025-11-20 13:19:38.105243-05
158	Julio	2025-06-23	2025-07-22	20	260	\N	2025-11-20 13:19:38.101203-05	2025-11-20 13:19:38.101203-05
159	Septiembre	2025-08-23	2025-09-22	20	260	\N	2025-11-20 13:19:38.108976-05	2025-11-20 13:19:38.108976-05
160	Octubre	2025-09-23	2025-10-22	20	260	\N	2025-11-20 13:19:38.116729-05	2025-11-20 13:19:38.116729-05
161	Noviembre	2025-10-23	2025-11-22	20	260	\N	2025-11-20 13:19:38.117379-05	2025-11-20 13:19:38.117379-05
163	Enero	2024-12-23	2025-01-22	22	4178	\N	2025-11-20 13:20:01.126104-05	2025-11-20 13:20:01.126104-05
164	Febrero	2025-01-23	2025-02-22	22	4178	\N	2025-11-20 13:20:04.165837-05	2025-11-20 13:20:04.165837-05
165	Marzo	2025-02-23	2025-03-22	22	4178	\N	2025-11-20 13:20:04.16785-05	2025-11-20 13:20:04.16785-05
166	Abril	2025-03-23	2025-04-22	22	4178	\N	2025-11-20 13:20:04.168798-05	2025-11-20 13:20:04.168798-05
168	Mayo	2025-04-23	2025-05-22	22	4178	\N	2025-11-20 13:20:04.169128-05	2025-11-20 13:20:04.169128-05
169	Junio	2025-05-23	2025-06-22	22	4178	\N	2025-11-20 13:20:04.184714-05	2025-11-20 13:20:04.184714-05
170	Octubre	2025-09-23	2025-10-22	22	4178	\N	2025-11-20 13:20:04.199722-05	2025-11-20 13:20:04.199722-05
171	Agosto	2025-07-23	2025-08-22	22	4178	\N	2025-11-20 13:20:04.197124-05	2025-11-20 13:20:04.197124-05
173	Noviembre	2025-10-23	2025-11-22	22	4178	\N	2025-11-20 13:20:04.198383-05	2025-11-20 13:20:04.198383-05
174	Septiembre	2025-08-23	2025-09-22	22	4178	\N	2025-11-20 13:20:04.199307-05	2025-11-20 13:20:04.199307-05
175	Enero	2024-12-23	2025-01-22	23	3000	\N	2025-11-20 13:20:16.15638-05	2025-11-20 13:20:16.15638-05
176	Febrero	2025-01-23	2025-02-22	23	3000	\N	2025-11-20 13:20:18.452507-05	2025-11-20 13:20:18.452507-05
177	Abril	2025-03-23	2025-04-22	23	3000	\N	2025-11-20 13:20:18.45399-05	2025-11-20 13:20:18.45399-05
178	Mayo	2025-04-23	2025-05-22	23	3000	\N	2025-11-20 13:20:18.455414-05	2025-11-20 13:20:18.455414-05
179	Julio	2025-06-23	2025-07-22	23	3000	\N	2025-11-20 13:20:18.456292-05	2025-11-20 13:20:18.456292-05
180	Marzo	2025-02-23	2025-03-22	23	3000	\N	2025-11-20 13:20:18.452879-05	2025-11-20 13:20:18.452879-05
181	Junio	2025-05-23	2025-06-22	23	3000	\N	2025-11-20 13:20:18.467623-05	2025-11-20 13:20:18.467623-05
182	Agosto	2025-07-23	2025-08-22	23	3000	\N	2025-11-20 13:20:18.476462-05	2025-11-20 13:20:18.476462-05
183	Septiembre	2025-08-23	2025-09-22	23	3000	\N	2025-11-20 13:20:18.486315-05	2025-11-20 13:20:18.486315-05
184	Noviembre	2025-10-23	2025-11-22	23	3000	\N	2025-11-20 13:20:18.493075-05	2025-11-20 13:20:18.493075-05
186	Octubre	2025-09-23	2025-10-22	23	3000	\N	2025-11-20 13:20:18.49016-05	2025-11-20 13:20:18.49016-05
187	Enero	2024-12-23	2025-01-22	8	90	\N	2025-11-20 13:20:48.628333-05	2025-11-20 13:20:48.628333-05
188	Abril	2025-03-23	2025-04-22	8	90	\N	2025-11-20 13:20:51.395065-05	2025-11-20 13:20:51.395065-05
189	Marzo	2025-02-23	2025-03-22	8	90	\N	2025-11-20 13:20:51.39406-05	2025-11-20 13:20:51.39406-05
190	Mayo	2025-04-23	2025-05-22	8	90	\N	2025-11-20 13:20:51.397474-05	2025-11-20 13:20:51.397474-05
191	Febrero	2025-01-23	2025-02-22	8	90	\N	2025-11-20 13:20:51.394608-05	2025-11-20 13:20:51.394608-05
192	Julio	2025-06-23	2025-07-22	8	90	\N	2025-11-20 13:20:51.398479-05	2025-11-20 13:20:51.398479-05
193	Junio	2025-05-23	2025-06-22	8	90	\N	2025-11-20 13:20:51.412448-05	2025-11-20 13:20:51.412448-05
194	Agosto	2025-07-23	2025-08-22	8	90	\N	2025-11-20 13:20:51.429109-05	2025-11-20 13:20:51.429109-05
81	Enero	2024-12-23	2025-01-22	2	100	\N	2025-11-20 09:06:48.419555-05	2025-11-20 09:14:46.829467-05
83	Enero	2024-12-23	2025-01-22	30	100	\N	2025-11-20 09:14:55.20431-05	2025-11-20 09:14:55.20431-05
1	Febrero	2025-01-23	2025-02-22	4	10081	\N	2025-11-19 21:56:19.919002-05	2025-11-20 22:37:41.504948-05
84	Enero	2024-12-23	2025-01-22	10	1000	\N	2025-11-20 09:15:00.119615-05	2025-11-20 09:15:00.119615-05
85	Enero	2024-12-23	2025-01-22	12	100	\N	2025-11-20 09:15:05.049709-05	2025-11-20 09:15:05.049709-05
86	Enero	2024-12-23	2025-01-22	26	600	\N	2025-11-20 09:15:06.821738-05	2025-11-20 09:15:06.821738-05
13	Febrero	2025-01-23	2025-02-22	2	100	\N	2025-11-19 22:40:55.025339-05	2025-11-19 22:40:55.025339-05
33	Febrero	2025-01-23	2025-02-22	10	1000	\N	2025-11-19 22:43:52.909215-05	2025-11-19 22:43:52.909215-05
44	Febrero	2025-01-23	2025-02-22	30	100	\N	2025-11-19 22:44:19.303085-05	2025-11-19 22:44:19.303085-05
59	Febrero	2025-01-23	2025-02-22	12	100	\N	2025-11-19 22:44:41.31287-05	2025-11-19 22:44:41.31287-05
70	Febrero	2025-01-23	2025-02-22	26	600	\N	2025-11-19 22:44:54.900613-05	2025-11-19 22:44:54.900613-05
14	Marzo	2025-02-23	2025-03-22	2	100	\N	2025-11-19 22:40:55.027441-05	2025-11-19 22:40:55.027441-05
195	Septiembre	2025-08-23	2025-09-22	8	90	\N	2025-11-20 13:20:51.432659-05	2025-11-20 13:20:51.432659-05
196	Octubre	2025-09-23	2025-10-22	8	90	\N	2025-11-20 13:20:51.434775-05	2025-11-20 13:20:51.434775-05
82	Enero	2024-12-23	2025-01-22	4	10081	\N	2025-11-20 09:10:58.688476-05	2025-11-20 22:37:36.144777-05
137	Noviembre	2025-10-23	2025-11-22	4	10081	\N	2025-11-20 13:15:11.296454-05	2025-11-20 22:37:41.584903-05
117	Diciembre	2025-11-21	2025-12-20	27	100	\N	2025-11-20 10:12:30.194448-05	2025-11-20 10:12:30.194448-05
124	Diciembre	2025-11-21	2025-12-20	36	350	\N	2025-11-20 10:12:54.24179-05	2025-11-20 10:12:54.24179-05
30	Marzo	2025-02-23	2025-03-22	34	10000	\N	2025-11-19 22:43:38.467283-05	2025-11-19 22:43:38.467283-05
32	Marzo	2025-02-23	2025-03-22	10	1000	\N	2025-11-19 22:43:52.908635-05	2025-11-19 22:43:52.908635-05
46	Marzo	2025-02-23	2025-03-22	30	100	\N	2025-11-19 22:44:19.309514-05	2025-11-19 22:44:19.309514-05
58	Marzo	2025-02-23	2025-03-22	12	100	\N	2025-11-19 22:44:41.309591-05	2025-11-19 22:44:41.309591-05
73	Marzo	2025-02-23	2025-03-22	26	600	\N	2025-11-19 22:44:54.906517-05	2025-11-19 22:44:54.906517-05
15	Abril	2025-03-23	2025-04-22	2	100	\N	2025-11-19 22:40:55.032708-05	2025-11-19 22:40:55.032708-05
34	Abril	2025-03-23	2025-04-22	10	1000	\N	2025-11-19 22:43:52.915608-05	2025-11-19 22:43:52.915608-05
45	Abril	2025-03-23	2025-04-22	30	100	\N	2025-11-19 22:44:19.305775-05	2025-11-19 22:44:19.305775-05
61	Abril	2025-03-23	2025-04-22	12	100	\N	2025-11-19 22:44:41.31934-05	2025-11-19 22:44:41.31934-05
71	Abril	2025-03-23	2025-04-22	26	600	\N	2025-11-19 22:44:54.903869-05	2025-11-19 22:44:54.903869-05
19	Mayo	2025-04-23	2025-05-22	2	100	\N	2025-11-19 22:40:55.048527-05	2025-11-19 22:40:55.048527-05
29	Mayo	2025-04-23	2025-05-22	34	7900	\N	2025-11-19 22:43:34.521874-05	2025-11-19 22:43:34.521874-05
35	Mayo	2025-04-23	2025-05-22	10	1000	\N	2025-11-19 22:43:52.917452-05	2025-11-19 22:43:52.917452-05
50	Mayo	2025-04-23	2025-05-22	30	100	\N	2025-11-19 22:44:19.323378-05	2025-11-19 22:44:19.323378-05
63	Mayo	2025-04-23	2025-05-22	12	100	\N	2025-11-19 22:44:41.333821-05	2025-11-19 22:44:41.333821-05
75	Mayo	2025-04-23	2025-05-22	26	600	\N	2025-11-19 22:44:54.921781-05	2025-11-19 22:44:54.921781-05
18	Junio	2025-05-23	2025-06-22	2	100	\N	2025-11-19 22:40:55.051995-05	2025-11-19 22:40:55.051995-05
37	Junio	2025-05-23	2025-06-22	10	1000	\N	2025-11-19 22:43:52.931637-05	2025-11-19 22:43:52.931637-05
48	Junio	2025-05-23	2025-06-22	30	100	\N	2025-11-19 22:44:19.311022-05	2025-11-19 22:44:19.311022-05
60	Junio	2025-05-23	2025-06-22	12	100	\N	2025-11-19 22:44:41.314979-05	2025-11-19 22:44:41.314979-05
72	Junio	2025-05-23	2025-06-22	26	600	\N	2025-11-19 22:44:54.90552-05	2025-11-19 22:44:54.90552-05
17	Julio	2025-06-23	2025-07-22	2	100	\N	2025-11-19 22:40:55.053691-05	2025-11-19 22:40:55.053691-05
26	Julio	2025-06-23	2025-07-22	34	13000	\N	2025-11-19 22:42:32.673596-05	2025-11-19 22:42:32.673596-05
36	Julio	2025-06-23	2025-07-22	10	1000	\N	2025-11-19 22:43:52.916891-05	2025-11-19 22:43:52.916891-05
47	Julio	2025-06-23	2025-07-22	30	100	\N	2025-11-19 22:44:19.310531-05	2025-11-19 22:44:19.310531-05
62	Julio	2025-06-23	2025-07-22	12	100	\N	2025-11-19 22:44:41.318211-05	2025-11-19 22:44:41.318211-05
74	Julio	2025-06-23	2025-07-22	26	600	\N	2025-11-19 22:44:54.90768-05	2025-11-19 22:44:54.90768-05
16	Agosto	2025-07-23	2025-08-22	2	100	\N	2025-11-19 22:40:55.046578-05	2025-11-19 22:40:55.046578-05
38	Agosto	2025-07-23	2025-08-22	10	1000	\N	2025-11-19 22:43:52.933768-05	2025-11-19 22:43:52.933768-05
49	Agosto	2025-07-23	2025-08-22	30	100	\N	2025-11-19 22:44:19.325342-05	2025-11-19 22:44:19.325342-05
64	Agosto	2025-07-23	2025-08-22	12	100	\N	2025-11-19 22:44:41.336513-05	2025-11-19 22:44:41.336513-05
76	Agosto	2025-07-23	2025-08-22	26	600	\N	2025-11-19 22:44:54.925824-05	2025-11-19 22:44:54.925824-05
20	Septiembre	2025-08-23	2025-09-22	2	100	\N	2025-11-19 22:40:55.077451-05	2025-11-19 22:40:55.077451-05
39	Septiembre	2025-08-23	2025-09-22	10	1000	\N	2025-11-19 22:43:52.933244-05	2025-11-19 22:43:52.933244-05
53	Septiembre	2025-08-23	2025-09-22	30	100	\N	2025-11-19 22:44:19.339648-05	2025-11-19 22:44:19.339648-05
65	Septiembre	2025-08-23	2025-09-22	12	100	\N	2025-11-19 22:44:41.343321-05	2025-11-19 22:44:41.343321-05
78	Septiembre	2025-08-23	2025-09-22	26	600	\N	2025-11-19 22:44:54.928528-05	2025-11-19 22:44:54.928528-05
21	Octubre	2025-09-23	2025-10-22	2	100	\N	2025-11-19 22:40:55.076519-05	2025-11-19 22:40:55.076519-05
40	Octubre	2025-09-23	2025-10-22	10	1000	\N	2025-11-19 22:43:52.942177-05	2025-11-19 22:43:52.942177-05
52	Octubre	2025-09-23	2025-10-22	30	100	\N	2025-11-19 22:44:19.3384-05	2025-11-19 22:44:19.3384-05
68	Octubre	2025-09-23	2025-10-22	12	100	\N	2025-11-19 22:44:41.347257-05	2025-11-19 22:44:41.347257-05
77	Octubre	2025-09-23	2025-10-22	26	600	\N	2025-11-19 22:44:54.929455-05	2025-11-19 22:44:54.929455-05
22	Noviembre	2025-10-23	2025-11-22	2	100	\N	2025-11-19 22:40:55.080329-05	2025-11-19 22:40:55.080329-05
41	Noviembre	2025-10-23	2025-11-22	10	1000	\N	2025-11-19 22:43:52.944462-05	2025-11-19 22:43:52.944462-05
51	Noviembre	2025-10-23	2025-11-22	30	100	\N	2025-11-19 22:44:19.336697-05	2025-11-19 22:44:19.336697-05
55	Noviembre	2025-10-23	2025-11-22	14	650	\N	2025-11-19 22:44:28.10313-05	2025-11-19 22:44:28.10313-05
66	Noviembre	2025-10-23	2025-11-22	12	100	\N	2025-11-19 22:44:41.345903-05	2025-11-19 22:44:41.345903-05
80	Noviembre	2025-10-23	2025-11-22	26	600	\N	2025-11-19 22:44:54.930632-05	2025-11-19 22:44:54.930632-05
89	Febrero	2025-01-23	2025-02-22	19	1600	\N	2025-11-20 10:11:36.123086-05	2025-11-20 10:11:36.123086-05
90	Agosto	2025-07-23	2025-08-22	19	1600	\N	2025-11-20 10:11:36.139651-05	2025-11-20 10:11:36.139651-05
93	Mayo	2025-04-23	2025-05-22	19	1600	\N	2025-11-20 10:11:36.150755-05	2025-11-20 10:11:36.150755-05
95	Julio	2025-06-23	2025-07-22	19	1600	\N	2025-11-20 10:11:36.151011-05	2025-11-20 10:11:36.151011-05
100	Febrero	2025-01-23	2025-02-22	31	300	\N	2025-11-20 10:12:09.935589-05	2025-11-20 10:12:09.935589-05
102	Julio	2025-06-23	2025-07-22	31	300	\N	2025-11-20 10:12:09.942187-05	2025-11-20 10:12:09.942187-05
103	Marzo	2025-02-23	2025-03-22	31	300	\N	2025-11-20 10:12:09.940576-05	2025-11-20 10:12:09.940576-05
106	Septiembre	2025-08-23	2025-09-22	31	300	\N	2025-11-20 10:12:09.957928-05	2025-11-20 10:12:09.957928-05
114	Febrero	2025-01-23	2025-02-22	27	100	\N	2025-11-20 10:12:30.171286-05	2025-11-20 10:12:30.171286-05
115	Abril	2025-03-23	2025-04-22	27	100	\N	2025-11-20 10:12:30.173453-05	2025-11-20 10:12:30.173453-05
119	Junio	2025-05-23	2025-06-22	27	100	\N	2025-11-20 10:12:30.195133-05	2025-11-20 10:12:30.195133-05
120	Octubre	2025-09-23	2025-10-22	27	100	\N	2025-11-20 10:12:30.198404-05	2025-11-20 10:12:30.198404-05
125	Enero	2024-12-23	2025-01-22	9	100	\N	2025-11-20 10:13:00.363054-05	2025-11-20 10:13:00.363054-05
127	Marzo	2025-02-23	2025-03-22	9	100	\N	2025-11-20 10:13:04.510883-05	2025-11-20 10:13:04.510883-05
130	Julio	2025-06-23	2025-07-22	9	100	\N	2025-11-20 10:13:04.512967-05	2025-11-20 10:13:04.512967-05
133	Octubre	2025-09-23	2025-10-22	9	100	\N	2025-11-20 10:13:04.539269-05	2025-11-20 10:13:04.539269-05
135	Septiembre	2025-08-23	2025-09-22	9	100	\N	2025-11-20 10:13:04.541617-05	2025-11-20 10:13:04.541617-05
123	Noviembre	2025-10-23	2025-11-22	36	350	\N	2025-11-20 10:12:51.717879-05	2025-11-20 10:12:51.717879-05
97	Noviembre	2025-10-23	2025-11-22	19	1600	\N	2025-11-20 10:11:36.181567-05	2025-11-20 10:11:36.181567-05
110	Noviembre	2025-10-23	2025-11-22	31	300	\N	2025-11-20 10:12:09.976703-05	2025-11-20 10:12:09.976703-05
122	Noviembre	2025-10-23	2025-11-22	27	100	\N	2025-11-20 10:12:30.196708-05	2025-11-20 10:12:30.196708-05
139	Enero	2024-12-23	2025-01-22	21	164	\N	2025-11-20 13:18:36.951069-05	2025-11-20 13:18:36.951069-05
140	Febrero	2025-01-23	2025-02-22	21	164	\N	2025-11-20 13:18:39.707649-05	2025-11-20 13:18:39.707649-05
142	Agosto	2025-07-23	2025-08-22	21	164	\N	2025-11-20 13:18:39.726101-05	2025-11-20 13:18:39.726101-05
144	Octubre	2025-09-23	2025-10-22	21	164	\N	2025-11-20 13:18:39.739811-05	2025-11-20 13:18:39.739811-05
145	Mayo	2025-04-23	2025-05-22	21	164	\N	2025-11-20 13:18:39.746991-05	2025-11-20 13:18:39.746991-05
147	Junio	2025-05-23	2025-06-22	21	164	\N	2025-11-20 13:18:39.750731-05	2025-11-20 13:18:39.750731-05
151	Enero	2024-12-23	2025-01-22	20	260	\N	2025-11-20 13:19:34.818389-05	2025-11-20 13:19:34.818389-05
153	Marzo	2025-02-23	2025-03-22	20	260	\N	2025-11-20 13:19:38.080558-05	2025-11-20 13:19:38.080558-05
4	Agosto	2025-07-23	2025-08-22	4	10081	\N	2025-11-19 22:34:32.077471-05	2025-11-20 22:37:41.580045-05
11	Octubre	2025-09-23	2025-10-22	4	10081	\N	2025-11-19 22:40:37.135728-05	2025-11-20 22:37:41.583841-05
8	Septiembre	2025-08-23	2025-09-22	4	10081	\N	2025-11-19 22:40:34.458221-05	2025-11-20 22:37:41.583386-05
28	Noviembre	2025-10-23	2025-11-22	34	7972	\N	2025-11-19 22:43:28.722373-05	2025-11-20 22:38:09.747687-05
23	Diciembre	2025-11-21	2025-12-20	2	100	\N	2025-11-19 22:40:55.095676-05	2025-11-19 22:40:55.095676-05
25	Diciembre	2025-11-21	2025-12-20	34	13000	\N	2025-11-19 22:42:20.51383-05	2025-11-19 22:42:37.482015-05
197	Diciembre	2025-11-21	2025-12-20	8	90	\N	2025-11-20 13:20:51.440693-05	2025-11-20 13:20:51.440693-05
199	Diciembre	2025-11-21	2025-12-20	35	4460	Sra Aydee 2160 y Jr 2300	2025-11-20 13:21:14.042107-05	2025-11-28 19:35:30.035471-05
198	Noviembre	2025-10-23	2025-11-22	8	90	\N	2025-11-20 13:20:51.442556-05	2025-11-20 13:20:51.442556-05
200	Diciembre	2025-11-21	2025-12-20	28	5200	USD 2000 - 3 Cuotas 500/500/1000	2025-11-20 13:21:28.769613-05	2025-11-20 23:05:16.172936-05
203	Enero	2024-12-23	2025-01-22	28	500	\N	2025-11-20 13:23:49.225343-05	2025-11-20 13:23:49.225343-05
167	Julio	2025-06-23	2025-07-22	22	5228.18	Doble Cuota	2025-11-20 13:20:04.170398-05	2025-11-20 22:35:25.307729-05
5	Junio	2025-05-23	2025-06-22	4	10081	\N	2025-11-19 22:34:32.083077-05	2025-11-20 22:37:41.513032-05
3	Marzo	2025-02-23	2025-03-22	4	10081	\N	2025-11-19 22:34:32.053547-05	2025-11-20 22:37:41.511742-05
7	Julio	2025-06-23	2025-07-22	4	10081	\N	2025-11-19 22:34:32.077339-05	2025-11-20 22:37:41.511064-05
6	Mayo	2025-04-23	2025-05-22	4	10081	\N	2025-11-19 22:34:32.084421-05	2025-11-20 22:37:41.515174-05
2	Abril	2025-03-23	2025-04-22	4	10081	\N	2025-11-19 22:34:32.052497-05	2025-11-20 22:37:41.533942-05
204	Enero	2024-12-23	2025-01-22	37	90	\N	2025-11-20 22:42:57.182269-05	2025-11-20 22:42:57.182269-05
205	Febrero	2025-01-23	2025-02-22	37	90	\N	2025-11-20 22:43:01.565113-05	2025-11-20 22:43:01.565113-05
206	Marzo	2025-02-23	2025-03-22	37	90	\N	2025-11-20 22:43:01.571728-05	2025-11-20 22:43:01.571728-05
207	Mayo	2025-04-23	2025-05-22	37	90	\N	2025-11-20 22:43:01.579182-05	2025-11-20 22:43:01.579182-05
208	Abril	2025-03-23	2025-04-22	37	90	\N	2025-11-20 22:43:01.574397-05	2025-11-20 22:43:01.574397-05
209	Junio	2025-05-23	2025-06-22	37	90	\N	2025-11-20 22:43:01.579959-05	2025-11-20 22:43:01.579959-05
210	Agosto	2025-07-23	2025-08-22	37	90	\N	2025-11-20 22:43:01.590372-05	2025-11-20 22:43:01.590372-05
211	Septiembre	2025-08-23	2025-09-22	37	90	\N	2025-11-20 22:43:01.60102-05	2025-11-20 22:43:01.60102-05
212	Julio	2025-06-23	2025-07-22	37	90	\N	2025-11-20 22:43:01.602881-05	2025-11-20 22:43:01.602881-05
213	Octubre	2025-09-23	2025-10-22	37	90	\N	2025-11-20 22:43:01.610055-05	2025-11-20 22:43:01.610055-05
215	Noviembre	2025-10-23	2025-11-22	37	90	\N	2025-11-20 22:43:01.614036-05	2025-11-20 22:43:01.614036-05
217	Noviembre	2025-10-23	2025-11-22	35	1000	\N	2025-11-20 23:06:55.831256-05	2025-11-20 23:06:55.831256-05
216	Noviembre	2025-10-23	2025-11-22	28	1988.93	\N	2025-11-20 23:05:00.396665-05	2025-11-20 23:09:46.326855-05
218	Enero	2025-12-23	2026-01-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
219	Marzo	2026-02-23	2026-03-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
220	Septiembre	2026-08-23	2026-09-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
221	Junio	2026-05-23	2026-06-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
222	Abril	2026-03-23	2026-04-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
223	Octubre	2026-09-23	2026-10-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
224	Enero	2025-12-23	2026-01-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
225	Abril	2026-03-23	2026-04-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
226	Junio	2026-05-23	2026-06-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
227	Agosto	2026-07-23	2026-08-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
228	Mayo	2026-04-23	2026-05-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
229	Octubre	2026-09-23	2026-10-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
230	Enero	2025-12-23	2026-01-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
231	Julio	2026-06-23	2026-07-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
232	Mayo	2026-04-23	2026-05-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
233	Marzo	2026-02-23	2026-03-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
234	Agosto	2026-07-23	2026-08-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
235	Septiembre	2026-08-23	2026-09-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
236	Febrero	2026-01-23	2026-02-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
237	Abril	2026-03-23	2026-04-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
238	Mayo	2026-04-23	2026-05-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
239	Junio	2026-05-23	2026-06-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
240	Agosto	2026-07-23	2026-08-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
241	Noviembre	2026-10-23	2026-11-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
242	Diciembre	2026-11-23	2026-12-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
243	Diciembre	2026-11-23	2026-12-22	36	350	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
244	Diciembre	2026-11-23	2026-12-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
245	Diciembre	2026-11-23	2026-12-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
246	Diciembre	2026-11-23	2026-12-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
247	Marzo	2026-02-23	2026-03-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
248	Septiembre	2026-08-23	2026-09-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
249	Julio	2026-06-23	2026-07-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
250	Abril	2026-03-23	2026-04-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
251	Noviembre	2026-10-23	2026-11-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
252	Febrero	2026-01-23	2026-02-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
253	Abril	2026-03-23	2026-04-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
254	Junio	2026-05-23	2026-06-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
255	Mayo	2026-04-23	2026-05-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
256	Agosto	2026-07-23	2026-08-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
257	Julio	2026-06-23	2026-07-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
258	Septiembre	2026-08-23	2026-09-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
259	Octubre	2026-09-23	2026-10-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
260	Noviembre	2026-10-23	2026-11-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
261	Diciembre	2026-11-23	2026-12-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
262	Enero	2025-12-23	2026-01-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
263	Febrero	2026-01-23	2026-02-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
264	Marzo	2026-02-23	2026-03-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
265	Abril	2026-03-23	2026-04-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
266	Mayo	2026-04-23	2026-05-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
267	Junio	2026-05-23	2026-06-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
268	Octubre	2026-09-23	2026-10-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
269	Agosto	2026-07-23	2026-08-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
270	Noviembre	2026-10-23	2026-11-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
271	Septiembre	2026-08-23	2026-09-22	22	4178	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
272	Enero	2025-12-23	2026-01-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
273	Febrero	2026-01-23	2026-02-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
274	Abril	2026-03-23	2026-04-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
275	Mayo	2026-04-23	2026-05-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
276	Julio	2026-06-23	2026-07-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
277	Marzo	2026-02-23	2026-03-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
278	Junio	2026-05-23	2026-06-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
279	Agosto	2026-07-23	2026-08-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
280	Septiembre	2026-08-23	2026-09-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
281	Noviembre	2026-10-23	2026-11-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
282	Diciembre	2026-11-23	2026-12-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
283	Octubre	2026-09-23	2026-10-22	23	3000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
202	Diciembre	2025-11-21	2025-12-20	24	500	\N	2025-11-20 13:23:27.979453-05	2025-11-20 13:23:27.979453-05
214	Diciembre	2025-11-21	2025-12-20	37	90	\N	2025-11-20 22:43:01.616564-05	2025-11-20 22:43:01.616564-05
201	Diciembre	2025-11-21	2025-12-20	11	2380	Dr Arrieta (USD 700) -Pagar con BBVA (Pagado)	2025-11-20 13:22:01.164631-05	2025-11-28 19:35:30.035471-05
284	Enero	2025-12-23	2026-01-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
285	Abril	2026-03-23	2026-04-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
286	Marzo	2026-02-23	2026-03-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
287	Mayo	2026-04-23	2026-05-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
288	Febrero	2026-01-23	2026-02-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
289	Julio	2026-06-23	2026-07-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
290	Junio	2026-05-23	2026-06-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
291	Agosto	2026-07-23	2026-08-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
292	Enero	2025-12-23	2026-01-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
293	Enero	2025-12-23	2026-01-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
294	Febrero	2026-01-23	2026-02-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
295	Enero	2025-12-23	2026-01-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
296	Enero	2025-12-23	2026-01-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
297	Enero	2025-12-23	2026-01-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
298	Febrero	2026-01-23	2026-02-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
299	Febrero	2026-01-23	2026-02-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
300	Febrero	2026-01-23	2026-02-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
301	Febrero	2026-01-23	2026-02-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
302	Febrero	2026-01-23	2026-02-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
303	Marzo	2026-02-23	2026-03-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
304	Septiembre	2026-08-23	2026-09-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
305	Octubre	2026-09-23	2026-10-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
306	Enero	2025-12-23	2026-01-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
308	Noviembre	2026-10-23	2026-11-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
309	Diciembre	2026-11-23	2026-12-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
310	Marzo	2026-02-23	2026-03-22	34	10000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
311	Marzo	2026-02-23	2026-03-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
312	Marzo	2026-02-23	2026-03-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
313	Marzo	2026-02-23	2026-03-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
314	Marzo	2026-02-23	2026-03-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
315	Abril	2026-03-23	2026-04-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
316	Abril	2026-03-23	2026-04-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
317	Abril	2026-03-23	2026-04-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
318	Abril	2026-03-23	2026-04-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
319	Abril	2026-03-23	2026-04-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
320	Mayo	2026-04-23	2026-05-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
321	Mayo	2026-04-23	2026-05-22	34	7900	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
322	Mayo	2026-04-23	2026-05-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
323	Mayo	2026-04-23	2026-05-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
324	Mayo	2026-04-23	2026-05-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
325	Mayo	2026-04-23	2026-05-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
326	Junio	2026-05-23	2026-06-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
327	Junio	2026-05-23	2026-06-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
328	Junio	2026-05-23	2026-06-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
329	Junio	2026-05-23	2026-06-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
330	Junio	2026-05-23	2026-06-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
331	Julio	2026-06-23	2026-07-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
332	Julio	2026-06-23	2026-07-22	34	13000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
333	Julio	2026-06-23	2026-07-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
334	Julio	2026-06-23	2026-07-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
335	Julio	2026-06-23	2026-07-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
336	Julio	2026-06-23	2026-07-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
337	Agosto	2026-07-23	2026-08-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
338	Agosto	2026-07-23	2026-08-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
339	Agosto	2026-07-23	2026-08-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
340	Agosto	2026-07-23	2026-08-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
341	Agosto	2026-07-23	2026-08-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
342	Septiembre	2026-08-23	2026-09-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
343	Septiembre	2026-08-23	2026-09-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
344	Septiembre	2026-08-23	2026-09-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
345	Septiembre	2026-08-23	2026-09-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
346	Septiembre	2026-08-23	2026-09-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
347	Octubre	2026-09-23	2026-10-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
348	Octubre	2026-09-23	2026-10-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
349	Octubre	2026-09-23	2026-10-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
350	Octubre	2026-09-23	2026-10-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
351	Octubre	2026-09-23	2026-10-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
352	Noviembre	2026-10-23	2026-11-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
353	Noviembre	2026-10-23	2026-11-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
354	Noviembre	2026-10-23	2026-11-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
355	Noviembre	2026-10-23	2026-11-22	14	650	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
356	Noviembre	2026-10-23	2026-11-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
357	Noviembre	2026-10-23	2026-11-22	26	600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
358	Diciembre	2026-11-23	2026-12-22	2	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
359	Diciembre	2026-11-23	2026-12-22	34	13000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
360	Diciembre	2026-11-23	2026-12-22	30	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
361	Diciembre	2026-11-23	2026-12-22	14	650	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
362	Diciembre	2026-11-23	2026-12-22	12	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
363	Febrero	2026-01-23	2026-02-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
364	Agosto	2026-07-23	2026-08-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
365	Mayo	2026-04-23	2026-05-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
366	Julio	2026-06-23	2026-07-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
367	Febrero	2026-01-23	2026-02-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
368	Julio	2026-06-23	2026-07-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
369	Marzo	2026-02-23	2026-03-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
370	Septiembre	2026-08-23	2026-09-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
371	Febrero	2026-01-23	2026-02-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
372	Abril	2026-03-23	2026-04-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
373	Junio	2026-05-23	2026-06-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
374	Octubre	2026-09-23	2026-10-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
375	Enero	2025-12-23	2026-01-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
376	Marzo	2026-02-23	2026-03-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
377	Julio	2026-06-23	2026-07-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
378	Octubre	2026-09-23	2026-10-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
379	Septiembre	2026-08-23	2026-09-22	9	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
380	Noviembre	2026-10-23	2026-11-22	36	350	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
381	Noviembre	2026-10-23	2026-11-22	19	1600	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
382	Noviembre	2026-10-23	2026-11-22	31	300	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
383	Noviembre	2026-10-23	2026-11-22	27	100	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
384	Enero	2025-12-23	2026-01-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
385	Febrero	2026-01-23	2026-02-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
386	Agosto	2026-07-23	2026-08-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
387	Octubre	2026-09-23	2026-10-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
388	Mayo	2026-04-23	2026-05-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
389	Junio	2026-05-23	2026-06-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
390	Diciembre	2026-11-23	2026-12-22	21	164	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
391	Enero	2025-12-23	2026-01-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
392	Marzo	2026-02-23	2026-03-22	20	260	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
393	Agosto	2026-07-23	2026-08-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
394	Octubre	2026-09-23	2026-10-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
395	Septiembre	2026-08-23	2026-09-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
396	Noviembre	2026-10-23	2026-11-22	34	7972	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
397	Diciembre	2026-11-23	2026-12-22	26	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
399	Diciembre	2026-11-23	2026-12-22	33	10700	AFP una Cayo el 20 espero la otra igual 	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
400	Diciembre	2026-11-23	2026-12-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
401	Diciembre	2026-11-23	2026-12-22	35	4460	Sra Aydee 2160 y Jr 2300	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
402	Noviembre	2026-10-23	2026-11-22	8	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
403	Diciembre	2026-11-23	2026-12-22	28	5200	USD 2000 - 3 Cuotas 500/500/1000	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
404	Diciembre	2026-11-23	2026-12-22	24	500	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
405	Enero	2025-12-23	2026-01-22	28	500	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
406	Julio	2026-06-23	2026-07-22	22	5228.18	Doble Cuota	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
407	Junio	2026-05-23	2026-06-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
408	Marzo	2026-02-23	2026-03-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
409	Julio	2026-06-23	2026-07-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
410	Mayo	2026-04-23	2026-05-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
411	Abril	2026-03-23	2026-04-22	4	10081	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
412	Enero	2025-12-23	2026-01-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
413	Febrero	2026-01-23	2026-02-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
414	Marzo	2026-02-23	2026-03-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
415	Mayo	2026-04-23	2026-05-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
416	Abril	2026-03-23	2026-04-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
417	Junio	2026-05-23	2026-06-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
418	Agosto	2026-07-23	2026-08-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
419	Septiembre	2026-08-23	2026-09-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
420	Julio	2026-06-23	2026-07-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
421	Octubre	2026-09-23	2026-10-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
422	Diciembre	2026-11-23	2026-12-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
423	Noviembre	2026-10-23	2026-11-22	37	90	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
424	Diciembre	2026-11-23	2026-12-22	11	2380	Dr Arrieta (USD 700) -Pagar con BBVA	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
425	Noviembre	2026-10-23	2026-11-22	35	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
426	Noviembre	2026-10-23	2026-11-22	28	1988.93	\N	2025-11-21 17:53:40.999899-05	2025-11-21 17:53:40.999899-05
136	Diciembre	2025-11-21	2025-12-20	9	100	\N	2025-11-20 10:13:04.54785-05	2025-11-20 10:13:04.54785-05
98	Diciembre	2025-11-21	2025-12-20	19	1600	\N	2025-11-20 10:11:36.190818-05	2025-11-20 10:11:36.190818-05
109	Diciembre	2025-11-21	2025-12-20	31	300	\N	2025-11-20 10:12:09.977858-05	2025-11-20 10:12:09.977858-05
138	Diciembre	2025-11-21	2025-12-20	4	10081	\N	2025-11-20 13:15:11.297188-05	2025-11-20 22:37:41.600477-05
162	Diciembre	2025-11-21	2025-12-20	20	260	\N	2025-11-20 13:19:38.119177-05	2025-11-20 13:19:38.119177-05
172	Diciembre	2025-11-21	2025-12-20	22	5228.18	Doble Cuota	2025-11-20 13:20:04.201825-05	2025-11-20 22:35:44.351756-05
185	Diciembre	2025-11-21	2025-12-20	23	3000	\N	2025-11-20 13:20:18.489763-05	2025-11-20 13:20:18.489763-05
27	Diciembre	2025-11-21	2025-12-20	33	10700	AFP una Cayo el 20 espero la otra igual 	2025-11-19 22:42:53.495443-05	2025-11-21 17:54:24.51305-05
42	Diciembre	2025-11-21	2025-12-20	10	1000	\N	2025-11-19 22:43:52.953769-05	2025-11-21 19:44:40.91051-05
54	Diciembre	2025-11-21	2025-12-20	30	100	\N	2025-11-19 22:44:19.346924-05	2025-11-19 22:44:19.346924-05
56	Diciembre	2025-11-21	2025-12-20	14	650	\N	2025-11-19 22:44:32.580903-05	2025-11-19 22:44:32.580903-05
67	Diciembre	2025-11-21	2025-12-20	12	100	\N	2025-11-19 22:44:41.34514-05	2025-11-19 22:44:41.34514-05
79	Diciembre	2025-11-21	2025-12-20	26	1000	\N	2025-11-19 22:44:54.937246-05	2025-11-20 22:43:57.419498-05
150	Diciembre	2025-11-21	2025-12-20	21	164	\N	2025-11-20 13:18:39.762473-05	2025-11-20 13:18:39.762473-05
427	Julio	2025-06-23	2026-07-22	29	1000	\N	2025-11-28 19:31:37.780419-05	2025-11-28 19:31:37.780419-05
398	Diciembre	2026-11-23	2026-12-22	10	1000	\N	2025-11-21 17:53:40.999899-05	2025-11-28 19:33:16.022091-05
307	Diciembre	2026-11-23	2026-12-22	22	5228.18	BBVA1 :418.17, BBVA 2: 554.78; IBK2: 1281.54; IBK1: 1050.18\t; DERRAMA: 520; SCOTIA: 350	2025-11-21 17:53:40.999899-05	2025-11-28 19:35:30.035471-05
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, type, parent_id, icon, color, description, expense_type, is_active, created_at) FROM stdin;
1	Ingresos Extras	income	\N	coins	#4caf50	\N	\N	t	2025-11-19 01:11:02-05
3	Ahorros	saving	\N	piggy-bank	#2196F3	\N	\N	t	2025-11-19 01:11:02-05
4	Salario	income	1	wallet	#66BB6A	\N	\N	t	2025-11-19 01:11:02-05
5	Freelance	income	1	briefcase	#81C784	\N	\N	f	2025-11-19 01:11:02-05
6	Inversiones	income	1	trending-up	#4CAF50	\N	\N	t	2025-11-19 01:11:02-05
16	Fondo de Emergencia	saving	3	shield	#29B6F6	\N	\N	t	2025-11-19 01:11:02-05
17	Inversión	saving	3	gem	#0288D1	\N	\N	t	2025-11-19 01:11:02-05
18	Metas Específicas	saving	3	target	#0277BD	\N	\N	t	2025-11-19 01:11:02-05
33	Devolución de Préstamos	income	\N	arrow-left-right	#059669	\N	\N	t	2025-11-19 01:11:02-05
34	Beneficios Laborales	income	\N	award	#000000	\N	\N	t	2025-11-19 01:11:02-05
7	Otros Ingresos	income	1	Plus	#A5D6A7	\N	\N	t	2025-11-19 01:04:00-05
13	Subscripciones	expense	2	smartphone	#42A5F5	\N	\N	f	2025-11-19 01:11:02-05
36	Terapia	expense	\N	heart	\N		variable	t	2025-11-19 01:11:02-05
2	 Cuidado Personal	expense	\N	pill	\N		variable	t	2025-11-19 01:11:02-05
25	 Deporte	expense	\N	dumbbell	\N		variable	t	2025-11-19 01:11:02-05
10	Alimentación	expense	\N	utensils	\N		fixed	t	2025-11-19 01:11:02-05
19	Alquiler	expense	\N	home	\N		fixed	t	2025-11-19 01:11:02-05
8	Arreglos Casa	expense	\N	wrench	\N		fixed	t	2025-11-19 01:11:02-05
30	Contador & Gestiones	expense	\N	calculator	\N		fixed	t	2025-11-19 01:11:02-05
15	Otros Gastos	expense	\N	package	\N		variable	t	2025-11-19 01:11:02-05
14	Educación	expense	\N	graduation-cap	\N		fixed	t	2025-11-19 01:11:02-05
21	Servicios & Streaming	expense	\N	tv	\N		fixed	t	2025-11-19 01:11:02-05
27	Propinas	expense	\N	hand-coins	\N		variable	t	2025-11-19 01:11:02-05
12	Entretenimiento	expense	\N	film	\N		variable	t	2025-11-19 01:11:02-05
26	Mascotas	expense	\N	paw-print	\N		fixed	t	2025-11-19 01:11:02-05
31	Pensión ISIL	expense	\N	graduation-cap	\N		fixed	t	2025-11-19 01:11:02-05
22	Préstamos Bancarios	expense	\N	landmark	\N		fixed	t	2025-11-19 01:11:02-05
20	Telefonía e Internet	expense	\N	smartphone	\N		fixed	t	2025-11-19 01:11:02-05
29	Ocio & Vacaciones	expense	\N	plane	\N		variable	t	2025-11-19 01:11:02-05
9	Transporte	expense	\N	car	\N		variable	t	2025-11-19 01:11:02-05
28	Tecnología	expense	\N	laptop	\N		variable	t	2025-11-19 01:11:02-05
23	Tarjeta de Crédito	expense	\N	credit-card	\N		variable	t	2025-11-19 01:11:02-05
35	Prestamos Personales	expense	\N	dollar-sign	\N		variable	t	2025-11-19 01:11:02-05
24	Ropa	expense	\N	shirt	\N		variable	t	2025-11-19 01:11:02-05
11	Salud	expense	\N	heart-pulse	\N		variable	t	2025-11-19 01:11:02-05
37	Lavanderia	expense	\N	flower	\N	Pago por 04 Bolsas	fixed	t	2025-11-20 22:42:48.069158-05
\.


--
-- Data for Name: credit_card_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_installments (id, credit_card_id, concept, original_amount, purchase_date, current_installment, total_installments, monthly_payment, monthly_principal, monthly_interest, interest_rate, remaining_capital, is_active, completed_at, created_at, updated_at) FROM stdin;
1	6	IZI*HOTEL EL MIRADOR F	886.00	2025-02-15	9	10	191.40	88.60	102.80	54.99	177.20	t	\N	2025-11-23 00:17:44.030158	2025-11-23 00:17:44.030158
2	6	MFA195 LOS ROSALES SURCOF	336.30	2025-03-10	8	10	71.60	33.63	37.97	54.99	100.89	t	\N	2025-11-23 00:17:44.034088	2025-11-23 00:17:44.034088
3	6	INSTITUTO SUPERIOR SAN IG	890.00	2025-03-14	8	10	188.99	89.00	99.99	54.99	267.00	t	\N	2025-11-23 00:17:44.035097	2025-11-23 00:17:44.035097
4	6	MPSOLUCIONESINFOR	214.00	2025-05-26	6	6	71.37	35.67	35.70	0.00	35.67	t	\N	2025-11-23 00:17:44.036096	2025-11-23 00:17:44.036096
5	6	MPRISINGDRAGON	109.00	2025-06-10	5	12	18.16	9.08	9.08	0.00	72.67	t	\N	2025-11-23 00:17:44.037097	2025-11-23 00:17:44.037097
6	6	MPMANUFACTURASSAN	177.42	2025-06-27	5	6	61.30	29.57	31.73	59.99	59.14	t	\N	2025-11-23 00:17:44.038099	2025-11-23 00:17:44.038099
7	6	MP *8PRODUCTOS	98.00	2025-08-04	4	6	32.66	16.33	16.33	0.00	49.00	t	\N	2025-11-23 00:17:44.039094	2025-11-23 00:17:44.039094
8	6	MDOPAGO*MERCADO PAGO	259.12	2025-08-04	4	12	43.18	21.59	21.59	0.00	194.34	t	\N	2025-11-23 00:17:44.039094	2025-11-23 00:17:44.039094
9	6	WONG LAS GARDENIAS DV F	358.62	2025-08-24	3	6	119.30	59.77	59.53	59.99	239.08	t	\N	2025-11-23 00:17:44.040609	2025-11-23 00:17:44.040609
10	6	MFA628 HIGUERETA F	172.60	2025-09-01	3	3	117.72	57.53	60.19	59.99	57.53	t	\N	2025-11-23 00:17:44.041627	2025-11-23 00:17:44.041627
11	6	MDOPAGO*MDOPAGO MERCADO P	56.16	2025-09-09	3	12	9.36	4.68	4.68	0.00	46.80	t	\N	2025-11-23 00:17:44.044143	2025-11-23 00:17:44.044143
12	6	OPENPAY*TELETICKET	258.00	2025-09-12	2	6	84.80	43.00	41.80	59.99	215.00	t	\N	2025-11-23 00:17:44.045646	2025-11-23 00:17:44.045646
13	6	INSTITUTO SUPERIOR SAN IG	540.00	2025-09-15	2	6	177.14	90.00	87.14	59.99	450.00	t	\N	2025-11-23 00:17:44.046655	2025-11-23 00:17:44.046655
14	6	OPENPAY*ISIL	540.00	2025-09-15	2	6	177.14	90.00	87.14	59.99	450.00	t	\N	2025-11-23 00:17:44.047655	2025-11-23 00:17:44.047655
15	6	DP *Falabellacom	1295.60	2025-09-28	2	18	125.51	71.98	53.53	59.99	1223.62	t	\N	2025-11-23 00:17:44.048655	2025-11-23 00:17:44.048655
16	6	DLC*HOTMART F	1837.00	2025-09-30	2	18	177.75	102.06	75.69	59.99	1734.94	t	\N	2025-11-23 00:17:44.05016	2025-11-23 00:17:44.05016
17	6	MDOPAGO*MERCADO PAGO	285.84	2025-10-23	1	6	86.66	47.64	39.02	59.99	285.84	t	\N	2025-11-23 00:17:44.051169	2025-11-23 00:17:44.051169
18	6	LIFE CAFE	579.60	2025-10-23	1	18	45.48	32.20	13.28	59.99	579.60	t	\N	2025-11-23 00:17:44.052171	2025-11-23 00:17:44.052171
19	6	WONG LAS GARDENIAS DV F	334.60	2025-10-23	1	6	101.44	55.77	45.67	59.99	334.60	t	\N	2025-11-23 00:17:44.054179	2025-11-23 00:17:44.054179
20	6	SKECHERS PERU F	317.30	2025-10-26	1	6	97.26	52.88	44.38	59.99	317.30	t	\N	2025-11-23 00:17:44.056177	2025-11-23 00:17:44.056177
21	6	MPEUROAMERICANMUS	70.00	2025-10-27	1	6	23.33	11.67	11.66	0.00	70.00	t	\N	2025-11-23 00:17:44.059178	2025-11-23 00:17:44.059178
22	6	108 PVEA AYACUCHO F	185.34	2025-10-28	1	3	119.92	61.78	58.14	59.99	185.34	t	\N	2025-11-23 00:17:44.061378	2025-11-23 00:17:44.061378
\.


--
-- Data for Name: credit_card_statements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_statements (id, credit_card_id, statement_date, due_date, previous_balance, new_charges, payments_received, interest_charges, fees, new_balance, minimum_payment, total_payment, revolving_balance, installments_balance, pdf_file_path, raw_text, ai_parsed, ai_confidence, parsing_errors, manual_review_required, created_at) FROM stdin;
\.


--
-- Data for Name: credit_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_cards (id, user_id, name, bank, card_type, last_four_digits, credit_limit, current_balance, available_credit, revolving_debt, payment_due_day, statement_close_day, revolving_interest_rate, is_active, created_at, updated_at) FROM stdin;
6	\N	BBVA Visa Signature	BBVA	\N	\N	10000.00	9338.82	661.18	3130.00	5	10	\N	t	2025-11-23 03:32:19.770781	2025-11-23 01:17:49.710169
\.


--
-- Data for Name: loan_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_payments (id, loan_id, payment_date, amount, principal, interest, remaining_balance, installment_number, transaction_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loans (id, name, entity, original_amount, current_debt, annual_rate, monthly_payment, total_installments, base_installments_paid, payment_frequency, payment_day, start_date, end_date, status, currency, notes, created_at, updated_at) FROM stdin;
1	Prestamo BBVA1	BBVA	15000	1998.99	14.27	418.17	47	43	MONTHLY	23	2022-11-20	\N	ACTIVE	PEN	\N	2025-11-20 22:22:43.229313	2025-11-22 23:07:53.869619
2	Prestamo BBVA 2	BBVA	19900	2651.89	14.27	554.78	47	44	MONTHLY	5	2022-02-05	\N	ACTIVE	PEN	\N	2025-11-21 15:13:49.45545	2025-11-22 23:07:53.870625
3	Prestamo IBK 1	IBK	35582	34754.71	29.99	1281.54	48	2	MONTHLY	5	2025-11-21	\N	ACTIVE	PEN	\N	2025-11-21 15:15:45.859104	2025-11-22 23:07:53.871625
4	Prestamo IBK 2	IBK	49600	32969.64	24.47	1050.18	77	40	MONTHLY	5	2019-11-21	\N	ACTIVE	PEN	\N	2025-11-21 15:16:40.090517	2025-11-22 23:07:53.872627
5	Prestamo Derrama	Derrama	20000	18200	20.16	520	60	24	MONTHLY	5	2020-12-05	\N	ACTIVE	PEN	\N	2025-11-21 15:17:29.64455	2025-11-22 23:07:53.873624
6	Prestamo Santander	Santander	7000	2898.8	41.5	350	36	24	MONTHLY	5	2022-12-05	\N	ACTIVE	PEN	\N	2025-11-21 15:18:14.276357	2025-11-24 20:41:09.909622
\.


--
-- Data for Name: quick_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quick_templates (id, name, description, amount, type, category_id) FROM stdin;
1	Delivery	Comida Rapida	35	expense	10
3	Super Mercados	Compras Wong/Plaza Vea	299.98	expense	10
4	Taxi	Taxi 	25	expense	9
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, date, category_id, account_id, amount, currency, exchange_rate, amount_pen, type, description, notes, status, transaction_type, transfer_id, related_transaction_id, loan_id, created_at, updated_at) FROM stdin;
1	2025-11-13	9	2	15	PEN	\N	15	expense	Taxi a Jockey Plaza	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
5	2025-11-12	34	2	7972	PEN	\N	7972	income	CTS	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
6	2025-10-23	20	2	79.9	PEN	\N	79.9	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
7	2025-10-23	20	2	29.9	PEN	\N	29.9	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
8	2025-10-23	20	2	34.95	PEN	\N	34.95	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
9	2025-10-23	20	2	85	PEN	\N	85	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
10	2025-10-23	22	2	350	PEN	\N	350	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
11	2025-10-23	22	2	531	PEN	\N	531	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
12	2025-10-23	20	2	29.86	PEN	\N	29.86	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
13	2025-10-23	15	2	80	PEN	\N	80	expense	No hay resultados x ahora	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
14	2025-10-24	9	2	13.3	PEN	\N	13.3	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
15	2025-10-24	9	2	14.4	PEN	\N	14.4	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
16	2025-10-24	21	2	74.49	PEN	\N	74.49	expense	Udemy	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
17	2025-10-24	19	2	1600	PEN	\N	1600	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
18	2025-10-24	11	2	300	PEN	\N	300	expense	Dentista	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
19	2025-10-25	26	2	90	PEN	\N	90	expense	Semana	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
20	2025-10-25	26	2	235	PEN	\N	235	expense	Albergue	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
21	2025-10-26	9	2	10.9	PEN	\N	10.9	expense	Real Plaza - Ida	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
22	2025-10-26	24	2	317.3	PEN	\N	317.3	expense	Zapatillas Sketchers + Medias : 6CU	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
23	2025-10-26	9	2	10.9	PEN	\N	10.9	expense	Real Plaza - Vuelta	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
24	2025-10-26	27	2	50	PEN	\N	50	expense	Giuls	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
25	2025-10-27	26	2	60	PEN	\N	60	expense	Cooper Baño	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
26	2025-10-29	8	2	90	PEN	\N	90	expense	Limpieza Sra Celia	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
27	2025-10-28	26	2	214	PEN	\N	214	expense	Cambo para Cooper :(	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
28	2025-10-30	21	2	50	PEN	\N	50	expense	Amazon Prime (Debo cortarlo)	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
29	2025-10-30	14	2	650	PEN	\N	650	expense	Clases Personalizadas	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
30	2025-11-01	26	2	95	PEN	\N	95	expense	Paseo + extra 5 Soles	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
31	2025-11-01	9	2	10	PEN	\N	10	expense	Cambio Zapatillas	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
32	2025-11-03	9	2	10	PEN	\N	10	expense	Cambio Zapatillas	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
33	2025-11-05	15	2	317.47	PEN	\N	317.47	expense	Prestamo Yape	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
34	2025-11-05	27	2	80	PEN	\N	80	expense	Giuls	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
35	2025-11-05	15	2	50	PEN	\N	50	expense	Dra Rosario Diaz	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
36	2025-11-07	9	2	34.8	PEN	\N	34.8	expense	Albergue Cooper	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
37	2025-11-07	9	2	10.9	PEN	\N	10.9	expense	Yendo a Rebaggliatti	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
38	2025-11-07	26	2	90	PEN	\N	90	expense	Semana Paseos	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
39	2025-11-07	9	2	19.9	PEN	\N	19.9	expense	\N	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
40	2025-11-07	9	2	20	PEN	\N	20	expense	Regreso Jockey - Cambio Zapatillas	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
41	2025-11-13	22	2	3308	PEN	\N	3308	expense	IBK y BBVA Prestamos	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
42	2025-11-13	26	2	67	PEN	\N	65	expense	Albergue Cooper	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
43	2025-11-13	27	2	50	PEN	\N	50	expense	Prestamo Ely	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-19 01:11:02-05
53	2025-10-27	23	2	2609	PEN	\N	2609	expense	Ajuste - Tarjeta Credito		completed	normal	\N	\N	\N	2025-11-20 23:08:13.41106-05	2025-11-20 23:08:13.41106-05
55	2025-11-23	22	2	520	PEN	\N	520	expense	Pago Derrama		completed	normal	\N	\N	5	2025-11-21 12:43:23.912535-05	2025-11-21 13:33:03.736019-05
52	2025-11-22	36	2	50	PEN	\N	50	expense	Terapia - Dra Natalia		completed	normal	\N	\N	\N	2025-11-20 23:00:21.853851-05	2025-11-21 16:18:48.294636-05
51	2025-11-22	26	2	384.5	PEN	\N	384.5	expense	SuperPet - Limpieza Cooper	Es para ahorrar en Baños	completed	normal	\N	\N	\N	2025-11-20 22:59:23.521021-05	2025-11-21 16:18:58.055378-05
44	2025-11-22	2	2	40	PEN	\N	40	expense	Corte de Pelo		completed	normal	\N	\N	\N	2025-11-20 22:39:24.787738-05	2025-11-21 16:19:40.584354-05
46	2025-11-22	37	2	90	PEN	\N	90	expense	Mr Jeff		completed	normal	\N	\N	\N	2025-11-20 22:53:30.947831-05	2025-11-21 16:19:44.01323-05
50	2025-11-22	14	2	74.19	PEN	\N	74.19	expense	Udemy		completed	normal	\N	\N	\N	2025-11-20 22:58:25.947882-05	2025-11-21 16:20:10.676056-05
49	2025-11-22	10	2	70.14	PEN	\N	70.14	expense	P. Vea- Verduras		completed	normal	\N	\N	\N	2025-11-20 22:57:53.569086-05	2025-11-21 16:20:24.227817-05
47	2025-11-22	28	2	213.7	PEN	\N	213.7	expense	Coolbox - MiTV Stick		completed	normal	\N	\N	\N	2025-11-20 22:56:50.431364-05	2025-11-21 16:20:34.762496-05
45	2025-11-22	10	2	507.12	PEN	\N	507.12	expense	Compras Wong		completed	normal	\N	\N	\N	2025-11-20 22:39:55.435881-05	2025-11-21 16:20:39.681273-05
57	2025-11-21	33	2	5203	PEN	\N	5203	income	AFP 01		completed	normal	\N	\N	\N	2025-11-21 17:23:51.666101-05	2025-11-21 17:23:51.666101-05
58	2025-11-21	35	2	2300	PEN	\N	2300	expense	Pago Junior		completed	normal	\N	\N	\N	2025-11-21 17:27:54.624242-05	2025-11-21 17:27:54.624242-05
59	2025-11-21	27	2	80	PEN	\N	80	expense	Propina Mama		completed	normal	\N	\N	\N	2025-11-21 17:28:34.024814-05	2025-11-21 17:28:34.024814-05
56	2025-11-21	4	2	10081	PEN	\N	10081	income	Sueldo		completed	normal	\N	\N	\N	2025-11-21 16:30:40.793053-05	2025-11-21 19:45:13.774429-05
4	2025-11-04	1	2	400	PEN	\N	400	income	Saque de Wardaditos	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-22 18:39:05.673907-05
2	2025-10-23	4	2	10080.58	PEN	\N	10080.58	income	Sueldo	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-22 18:39:18.391857-05
3	2025-11-01	1	2	212.5	PEN	\N	212.5	income	Adelanto Ely Pago Pension Giordano	\N	completed	regular	\N	\N	\N	2025-11-19 01:11:02-05	2025-11-22 18:39:24.007212-05
60	2025-11-21	37	2	40	PEN	\N	40	expense	Lavado Zapatillas		completed	normal	\N	\N	\N	2025-11-21 17:29:12.921623-05	2025-11-21 17:29:12.921623-05
61	2025-11-21	23	2	1000	PEN	\N	1000	expense	Adelanto Pago Tarjeta		completed	normal	\N	\N	\N	2025-11-21 17:30:01.017485-05	2025-11-21 17:30:01.017485-05
62	2025-11-21	36	2	100	PEN	\N	100	expense	Dra Natalia		completed	normal	\N	\N	\N	2025-11-21 17:30:36.790835-05	2025-11-21 17:30:36.790835-05
63	2025-11-21	28	2	500	USD	3.377	1688.5	expense	Primera Cuota Mac		completed	normal	\N	\N	\N	2025-11-21 17:31:38.412844-05	2025-11-21 17:31:38.412844-05
64	2025-11-21	26	2	147	PEN	\N	147	expense	ATREVIA 360 - 3 Meses		completed	normal	\N	\N	\N	2025-11-21 17:33:46.057074-05	2025-11-21 17:33:46.057074-05
65	2025-11-21	10	2	21.9	PEN	\N	21.9	expense	PedidosYA - Makis		completed	normal	\N	\N	\N	2025-11-21 17:34:28.25451-05	2025-11-21 17:34:28.25451-05
66	2025-11-21	26	2	90	PEN	\N	90	expense	Cooper - Semana Paseos		completed	normal	\N	\N	\N	2025-11-21 17:34:55.512344-05	2025-11-21 17:34:55.512344-05
67	2025-11-21	29	2	224	PEN	\N	224	expense	Compra Maleta/Mochila	Maleta  Viajera Bange	completed	normal	\N	\N	\N	2025-11-21 17:37:19.227824-05	2025-11-21 17:37:19.227824-05
105	2025-11-28	10	2	3.2	PEN	\N	3.2	expense	Pan y Otros		completed	normal	\N	\N	\N	2025-11-28 19:04:08.181424-05	2025-11-28 19:04:08.181424-05
69	2025-11-21	28	2	149.65	PEN	\N	149.65	expense	ML - Compras Varias	USB, Accesorio para controles, Muñequera	completed	normal	\N	\N	\N	2025-11-21 17:44:10.334914-05	2025-11-21 17:44:10.334914-05
70	2025-11-21	14	2	59	USD	3.377	199.24	expense	Teacher Pol - Acceso Vitalicio		completed	normal	\N	\N	\N	2025-11-21 17:48:29.203644-05	2025-11-21 17:48:29.203644-05
48	2025-11-21	11	2	18.3	PEN	\N	18.3	expense	Inkafarma - Jarabe		completed	normal	\N	\N	\N	2025-11-20 22:57:21.121106-05	2025-11-21 17:48:43.030589-05
68	2025-11-21	28	2	44.85	PEN	\N	44.85	expense	ML - Adorno Tardis		completed	normal	\N	\N	\N	2025-11-21 17:42:20.777005-05	2025-11-21 19:47:29.315247-05
71	2025-11-21	9	2	24.7	PEN	\N	24.7	expense	Cooper - Taxi		completed	normal	\N	\N	\N	2025-11-21 19:53:05.37909-05	2025-11-21 19:53:05.37909-05
72	2025-11-21	19	2	1600	PEN	\N	1600	expense	Alquiler Diciembre		completed	normal	\N	\N	\N	2025-11-21 20:04:30.663955-05	2025-11-21 20:04:30.663955-05
73	2025-11-22	36	2	50	PEN	\N	50	expense	Frotacciones y Vendas		completed	normal	\N	\N	\N	2025-11-22 16:33:09.361038-05	2025-11-22 16:33:09.361038-05
74	2025-11-22	27	2	100	PEN	\N	100	expense	Prestamo Ely		completed	normal	\N	\N	\N	2025-11-22 17:26:11.485129-05	2025-11-22 17:26:11.485129-05
75	2025-11-23	36	2	110	PEN	\N	110	expense	Magneto terapia 		completed	normal	\N	\N	\N	2025-11-23 14:23:36.564684-05	2025-11-23 14:23:36.564684-05
76	2025-11-23	26	2	75	PEN	\N	75	expense	Albergue Cooper		completed	normal	\N	\N	\N	2025-11-23 23:26:05.989459-05	2025-11-23 23:26:05.989459-05
77	2025-11-24	10	2	25.4	PEN	\N	25.4	expense	Chifa		completed	normal	\N	\N	\N	2025-11-24 15:36:15.218367-05	2025-11-24 15:36:15.218367-05
78	2025-11-24	21	2	175.85	PEN	\N	175.85	expense	Pago Obsidian - Anual		completed	normal	\N	\N	\N	2025-11-24 15:36:55.146867-05	2025-11-24 15:36:55.146867-05
79	2025-11-24	22	2	350	PEN	\N	350	expense	Pago  - Santander		completed	normal	\N	\N	6	2025-11-24 15:41:09.870818-05	2025-11-24 15:41:09.870818-05
81	2025-11-25	15	2	200	PEN	\N	200	expense	Prestamo a Yito		completed	normal	\N	\N	\N	2025-11-25 11:31:25.260268-05	2025-11-25 11:31:25.260268-05
82	2025-11-25	10	2	89	PEN	\N	89	expense	Costumbres Argentinas		completed	normal	\N	\N	\N	2025-11-25 13:34:50.897254-05	2025-11-25 13:34:50.897254-05
83	2025-11-25	11	2	100	PEN	\N	100	expense	Arrieta 	\N	completed	normal	\N	\N	\N	2025-11-25 15:08:36.084757-05	2025-11-25 15:08:36.084757-05
84	2025-11-25	11	2	55	PEN	\N	55	expense	Cita - Endocrinologia		completed	normal	\N	\N	\N	2025-11-25 15:18:13.134579-05	2025-11-25 15:18:13.134579-05
80	2025-11-24	23	2	2500	PEN	\N	2500	expense	Tarjeta 		completed	normal	\N	\N	\N	2025-11-24 17:24:05.424356-05	2025-11-25 15:18:48.328997-05
85	2025-11-25	9	2	9	PEN	\N	9	expense	Taxi - Ovalo		completed	normal	\N	\N	\N	2025-11-25 20:19:22.010583-05	2025-11-25 20:19:22.010583-05
87	2025-11-25	23	2	80	USD	3.38	270.4	expense	Tarjeta BBVA Dolares		completed	normal	\N	\N	\N	2025-11-25 23:56:27.59463-05	2025-11-25 23:56:27.59463-05
90	2025-11-25	9	2	30	PEN	\N	30	expense	Taxi 		completed	normal	\N	\N	\N	2025-11-25 23:58:07.985229-05	2025-11-25 23:58:07.985229-05
106	2025-11-28	9	2	20	PEN	\N	20	expense	Taxi - Regreso Clinica		completed	normal	\N	\N	\N	2025-11-28 19:04:27.052798-05	2025-11-28 19:04:27.052798-05
91	2025-11-26	2	2	60	PEN	\N	60	expense	Cojin 		completed	normal	\N	\N	\N	2025-11-26 08:25:33.046057-05	2025-11-26 08:25:33.046057-05
92	2025-11-26	8	2	90	PEN	\N	90	expense	Limpieza Casa		completed	normal	\N	\N	\N	2025-11-26 14:32:39.996263-05	2025-11-26 14:32:39.996263-05
93	2025-11-26	35	2	15	PEN	\N	15	expense	Pago Arturo 		completed	normal	\N	\N	\N	2025-11-26 14:33:02.076458-05	2025-11-26 14:33:02.076458-05
94	2025-11-26	11	2	350	PEN	\N	350	expense	Dentista		completed	normal	\N	\N	\N	2025-11-26 19:52:28.526002-05	2025-11-26 19:52:28.526002-05
107	2025-11-28	12	2	50	PEN	\N	50	expense	Peli		completed	normal	\N	\N	\N	2025-11-28 19:05:23.148773-05	2025-11-28 19:05:23.148773-05
88	2025-11-25	12	2	150	PEN	\N	150	expense	Sauna		completed	normal	\N	\N	\N	2025-11-25 23:57:20.02612-05	2025-11-27 08:24:54.076038-05
89	2025-11-25	12	2	60	PEN	\N	60	expense	Cine		completed	normal	\N	\N	\N	2025-11-25 23:57:45.563649-05	2025-11-27 08:25:13.836447-05
96	2025-11-27	9	2	9	PEN	\N	9	expense	Taxi - Barranco	\N	completed	normal	\N	\N	\N	2025-11-27 08:25:29.492514-05	2025-11-27 08:25:52.467546-05
97	2025-11-27	12	2	100	PEN	\N	100	expense	Prestamo		completed	normal	\N	\N	\N	2025-11-27 08:28:11.503802-05	2025-11-27 08:28:11.503802-05
98	2025-11-27	10	2	76.34	PEN	\N	76.34	expense	Compra - Plaza Vea		completed	normal	\N	\N	\N	2025-11-27 08:28:37.67136-05	2025-11-27 08:28:37.67136-05
99	2025-11-27	9	2	12.3	PEN	\N	12.3	expense	Taxi - Barranco		completed	normal	\N	\N	\N	2025-11-27 08:29:10.976879-05	2025-11-27 08:29:10.976879-05
103	2025-11-28	9	2	25	PEN	\N	25	expense	Taxi 	\N	completed	normal	\N	\N	\N	2025-11-28 12:15:31.72719-05	2025-11-28 12:15:31.72719-05
104	2025-11-28	28	2	162	USD	3.36	544.32	expense	Amazon -  KVM y Dock	Es para uso de la mac	completed	normal	\N	\N	\N	2025-11-28 19:03:31.79044-05	2025-11-28 19:03:31.79044-05
108	2025-11-28	10	2	32	PEN	\N	32	expense	Didi Food - Pollo		completed	normal	\N	\N	\N	2025-11-28 19:05:59.605836-05	2025-11-28 19:05:59.605836-05
109	2025-11-28	11	2	134.33	PEN	\N	134.33	expense	Analisis Clinicos - Endocrino		completed	normal	\N	\N	\N	2025-11-28 19:06:35.880557-05	2025-11-28 19:06:35.880557-05
110	2025-11-29	9	2	23.7	PEN	\N	23.7	expense	Taxi - Ida Clinica	\N	completed	normal	\N	\N	\N	2025-11-28 19:06:45.653974-05	2025-11-28 19:07:03.389375-05
111	2025-11-30	26	2	90	PEN	\N	90	expense	Cooper - Paseos		completed	normal	\N	\N	\N	2025-11-30 22:51:13.139773-05	2025-11-30 22:51:13.139773-05
112	2025-11-30	10	2	104	PEN	\N	104	expense	Pollo - Villa Chicken 		completed	normal	\N	\N	\N	2025-11-30 22:51:46.039696-05	2025-11-30 22:51:46.039696-05
113	2025-11-30	12	2	200	PEN	\N	200	expense	Juego Skincare 1		completed	normal	\N	\N	\N	2025-11-30 22:52:47.16476-05	2025-11-30 22:52:47.16476-05
114	2025-11-30	9	2	30.1	PEN	\N	30.1	expense	Taxi - Ely Regreso La Marina		completed	normal	\N	\N	\N	2025-11-30 22:53:16.767191-05	2025-11-30 22:53:16.767191-05
115	2025-12-01	12	2	200	PEN	\N	200	expense	Skincare2		completed	normal	\N	\N	\N	2025-12-01 12:18:38.015342-05	2025-12-01 12:18:38.015342-05
116	2025-12-02	10	2	28	PEN	\N	28	expense	Chifa		completed	normal	\N	\N	\N	2025-12-02 14:07:13.984591-05	2025-12-02 14:07:13.984591-05
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounts_id_seq', 3, false);


--
-- Name: billing_cycle_overrides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.billing_cycle_overrides_id_seq', 3, false);


--
-- Name: billing_cycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.billing_cycles_id_seq', 3, false);


--
-- Name: budget_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_plans_id_seq', 428, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 38, false);


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_installments_id_seq', 23, false);


--
-- Name: credit_card_statements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_statements_id_seq', 1, false);


--
-- Name: credit_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_cards_id_seq', 7, false);


--
-- Name: loan_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_payments_id_seq', 1, false);


--
-- Name: loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loans_id_seq', 7, false);


--
-- Name: quick_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quick_templates_id_seq', 5, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 116, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: billing_cycle_overrides billing_cycle_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycle_overrides
    ADD CONSTRAINT billing_cycle_overrides_pkey PRIMARY KEY (id);


--
-- Name: billing_cycles billing_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycles
    ADD CONSTRAINT billing_cycles_pkey PRIMARY KEY (id);


--
-- Name: budget_plans budget_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_plans
    ADD CONSTRAINT budget_plans_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: credit_card_installments credit_card_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments
    ADD CONSTRAINT credit_card_installments_pkey PRIMARY KEY (id);


--
-- Name: credit_card_statements credit_card_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_statements
    ADD CONSTRAINT credit_card_statements_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: loan_payments loan_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: quick_templates quick_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quick_templates
    ADD CONSTRAINT quick_templates_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: budget_plans uix_cycle_category_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_plans
    ADD CONSTRAINT uix_cycle_category_date UNIQUE (cycle_name, category_id, start_date);


--
-- Name: billing_cycle_overrides uq_cycle_year_month; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycle_overrides
    ADD CONSTRAINT uq_cycle_year_month UNIQUE (billing_cycle_id, year, month);


--
-- Name: ix_accounts_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_accounts_id ON public.accounts USING btree (id);


--
-- Name: ix_billing_cycle_overrides_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_billing_cycle_overrides_id ON public.billing_cycle_overrides USING btree (id);


--
-- Name: ix_billing_cycles_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_billing_cycles_id ON public.billing_cycles USING btree (id);


--
-- Name: ix_budget_plans_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_budget_plans_id ON public.budget_plans USING btree (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_credit_card_installments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_credit_card_installments_id ON public.credit_card_installments USING btree (id);


--
-- Name: ix_credit_card_statements_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_credit_card_statements_id ON public.credit_card_statements USING btree (id);


--
-- Name: ix_credit_cards_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_credit_cards_id ON public.credit_cards USING btree (id);


--
-- Name: ix_loan_payments_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loan_payments_id ON public.loan_payments USING btree (id);


--
-- Name: ix_loan_payments_loan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loan_payments_loan_id ON public.loan_payments USING btree (loan_id);


--
-- Name: ix_loan_payments_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loan_payments_payment_date ON public.loan_payments USING btree (payment_date);


--
-- Name: ix_loan_payments_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loan_payments_transaction_id ON public.loan_payments USING btree (transaction_id);


--
-- Name: ix_loans_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loans_id ON public.loans USING btree (id);


--
-- Name: ix_loans_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loans_name ON public.loans USING btree (name);


--
-- Name: ix_loans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_loans_status ON public.loans USING btree (status);


--
-- Name: ix_quick_templates_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_quick_templates_id ON public.quick_templates USING btree (id);


--
-- Name: ix_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_transactions_date ON public.transactions USING btree (date);


--
-- Name: ix_transactions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_transactions_id ON public.transactions USING btree (id);


--
-- Name: ix_transactions_transfer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_transactions_transfer_id ON public.transactions USING btree (transfer_id);


--
-- Name: billing_cycle_overrides billing_cycle_overrides_billing_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_cycle_overrides
    ADD CONSTRAINT billing_cycle_overrides_billing_cycle_id_fkey FOREIGN KEY (billing_cycle_id) REFERENCES public.billing_cycles(id);


--
-- Name: budget_plans budget_plans_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_plans
    ADD CONSTRAINT budget_plans_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: credit_card_installments credit_card_installments_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments
    ADD CONSTRAINT credit_card_installments_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id);


--
-- Name: credit_card_statements credit_card_statements_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_statements
    ADD CONSTRAINT credit_card_statements_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id);


--
-- Name: loan_payments loan_payments_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_payments loan_payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;


--
-- Name: quick_templates quick_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quick_templates
    ADD CONSTRAINT quick_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: transactions transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: transactions transactions_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id);


--
-- Name: transactions transactions_related_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_related_transaction_id_fkey FOREIGN KEY (related_transaction_id) REFERENCES public.transactions(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ddifKaIA6RFEoq5OEBVnIhpytMeeFv3if3q8h5MNIZrJLBqRpe4aqpEbSPatyKV


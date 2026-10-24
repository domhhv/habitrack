-- noqa: disable=convention.quoted_literals

INSERT INTO
"auth"."users" (
    "instance_id",
    "id",
    "aud",
    "role",
    "email",
    "encrypted_password",
    "email_confirmed_at",
    "recovery_sent_at",
    "last_sign_in_at",
    "raw_app_meta_data",
    "raw_user_meta_data",
    "created_at",
    "updated_at",
    "confirmation_token",
    "email_change",
    "email_change_token_new",
    "recovery_token"
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'enriched-user@gmail.com',
    CRYPT('123456', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alex Johnson","first_day_of_week":"mon"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'empty-user@gmail.com',
    CRYPT('123456', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_day_of_week":"sun"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

INSERT INTO
"auth"."identities" (
    "id",
    "user_id",
    "provider_id",
    "identity_data",
    "provider",
    "last_sign_in_at",
    "created_at",
    "updated_at"
) (
    SELECT
        GEN_RANDOM_UUID() AS "id",
        "id" AS "user_id",
        "id" AS "provider_id",
        FORMAT('{"sub":"%s","email":"%s"}', "id"::TEXT, "email")::JSONB AS "identity_data",
        'email' AS "provider",
        NOW() AS "last_sign_in_at",
        NOW() AS "created_at",
        NOW() AS "updated_at"
    FROM
        "auth"."users"
);

/*
 * Enriched user notes, dated relative to the current month so the seed stays fresh.
 * Notes that would land after today are skipped.
 */
INSERT INTO "public"."notes" ("user_id", "period_kind", "period_date", "content") (
    WITH "months" AS (
        SELECT
            "offset",
            (DATE_TRUNC('month', CURRENT_DATE) - ("offset" * INTERVAL '1 month'))::DATE AS "month_start"
        FROM GENERATE_SERIES(0, 2) AS "offset"
    ),

    "candidates" AS (
        SELECT
            'month'::"public"."note_period_kind" AS "period_kind",
            "month_start" AS "period_date",
            CASE "offset"
                WHEN 0 THEN 'Goal for this month: run at least 60 km and keep pouches under 5 a day.'
                ELSE 'Started tracking everything properly. Want to cut down on nicotine and build a running routine.'
            END AS "content"
        FROM "months"
        WHERE "offset" IN (0, 2)

        UNION ALL

        SELECT
            'week'::"public"."note_period_kind" AS "period_kind",
            DATE_TRUNC('week', "months"."month_start" + "week"."day_offset")::DATE AS "period_date",
            "week"."content"
        FROM "months"
        CROSS JOIN (
            VALUES
            (6, 'Busy week at work, slept badly. Coffee intake went up.'),
            (20, 'Good week overall. Three runs and fewer pouches than usual.')
        ) AS "week" ("day_offset", "content")

        UNION ALL

        SELECT
            'day'::"public"."note_period_kind" AS "period_kind",
            "months"."month_start" + "day"."day_offset" AS "period_date",
            "day"."content"
        FROM "months"
        CROSS JOIN (
            VALUES
            (1, 'Felt energetic in the morning, skipped the second coffee.'),
            (8, 'Legs were sore after yesterday''s long run.'),
            (14, 'Stressful day, more pouches than planned.'),
            (22, 'Tried a new route along the river. Loved it.')
        ) AS "day" ("day_offset", "content")
    )

    SELECT
        '11111111-1111-1111-1111-111111111111'::UUID AS "user_id",
        "period_kind",
        "period_date",
        "content"
    FROM "candidates"
    WHERE "period_date" <= CURRENT_DATE
);

INSERT INTO "public"."habits" ("id", "user_id", "name", "description", "motivation", "icon_path", "trait_id") VALUES
(
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Empty',
    NULL,
    NULL,
    NULL,
    NULL
),
(
    'aaaaaaaa-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Running',
    'Outdoor runs, mostly around the park',
    'Running clears my head and keeps me fit. I want to finish a half marathon this year.',
    'running.png',
    (
        SELECT "id" FROM "public"."traits"
        WHERE "name" = 'Good' AND "user_id" IS NULL
    )
),
(
    'aaaaaaaa-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Coffee',
    'Freshly ground coffee brewed at home',
    NULL,
    'coffee.png',
    NULL
),
(
    'aaaaaaaa-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Nicotine pouches',
    'Tracking pouches to slowly cut down',
    NULL,
    'nicotine-pouches.png',
    (
        SELECT "id" FROM "public"."traits"
        WHERE "name" = 'Bad' AND "user_id" IS NULL
    )
);

INSERT INTO "public"."habit_metrics" ("id", "user_id", "habit_id", "name", "type", "config", "sort_order") VALUES
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Distance',
    'number',
    '{"preset":"distance","unit":"km"}',
    0
),
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Duration',
    'duration',
    '{"format":"hh:mm:ss"}',
    1
),
(
    'bbbbbbbb-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Pace',
    'number',
    '{"preset":"pace","unit":"min/km"}',
    2
),
(
    'bbbbbbbb-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Calories',
    'number',
    '{"preset":"calories","unit":"cal"}',
    3
),
(
    'bbbbbbbb-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Strength',
    'scale',
    '{"min":1,"max":10,"step":1}',
    0
),
(
    'bbbbbbbb-0000-0000-0000-000000000006',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Nicotine content',
    'number',
    '{"preset":"weight","unit":"mg"}',
    1
),
(
    'bbbbbbbb-0000-0000-0000-000000000007',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Duration',
    'duration',
    '{"format":"minutes"}',
    2
),
(
    'bbbbbbbb-0000-0000-0000-000000000008',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Pouches count',
    'number',
    '{"preset":"count","unit":"pouches","decimalPlaces":0,"min":1}',
    3
);

INSERT INTO "public"."habit_stocks" (
    "id", "user_id", "habit_id", "name", "cost", "currency", "total_items", "remaining_items", "purchased_at"
) VALUES
(
    'cccccccc-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Arabica coffee beans 1 kg',
    18.90,
    'EUR',
    NULL,
    NULL,
    NOW() - INTERVAL '20 days'
),
(
    'cccccccc-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Cool Mint 6 mg',
    5.50,
    'EUR',
    20,
    20,
    NOW() - INTERVAL '14 days'
),
(
    'cccccccc-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Citrus 3 mg',
    4.90,
    'EUR',
    20,
    20,
    NOW() - INTERVAL '10 days'
),
(
    'cccccccc-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Ice Cool Strong 11 mg',
    6.80,
    'EUR',
    24,
    24,
    NOW() - INTERVAL '5 days'
);

INSERT INTO "public"."habit_stock_metric_defaults" (
    "user_id", "habit_stock_id", "habit_metric_id", "value", "should_compound"
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000006',
    '{"numericValue":6}',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000005',
    '{"numericValue":5}',
    FALSE
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000006',
    '{"numericValue":3}',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000005',
    '{"numericValue":3}',
    FALSE
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000006',
    '{"numericValue":11}',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000005',
    '{"numericValue":8}',
    FALSE
);

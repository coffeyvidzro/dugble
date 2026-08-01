INSERT INTO product_rates (
    product,
    market_code,
    tier,
    currency,
    cost_units
)
VALUES
    ('sms_local', 'GH', 'growth',     'GHS', 6500),
    ('sms_local', 'GH', 'scale',      'GHS', 5500),
    ('sms_local', 'GH', 'enterprise', 'GHS', 4500),

    ('sms_intl', 'GH', 'growth',      'GHS', 17544),
    ('sms_intl', 'GH', 'scale',       'GHS', 14035),
    ('sms_intl', 'GH', 'enterprise',  'GHS', 11111),

    ('email', 'GH', 'growth',         'GHS', 936),
    ('email', 'GH', 'scale',          'GHS', 702),
    ('email', 'GH', 'enterprise',     'GHS', 468),

    ('sms_local', 'KE', 'growth',     'KES', 95000),
    ('sms_local', 'KE', 'scale',      'KES', 80000),
    ('sms_local', 'KE', 'enterprise', 'KES', 65000),

    ('sms_intl', 'KE', 'growth',      'KES', 234000),
    ('sms_intl', 'KE', 'scale',       'KES', 195000),
    ('sms_intl', 'KE', 'enterprise',  'KES', 162500),

    ('email', 'KE', 'growth',         'KES', 10400),
    ('email', 'KE', 'scale',          'KES', 7800),
    ('email', 'KE', 'enterprise',     'KES', 5200)
ON CONFLICT (
    product,
    market_code,
    tier
)
DO UPDATE SET
    currency = EXCLUDED.currency,
    cost_units = EXCLUDED.cost_units,
    is_active = true,
    updated_at = now();

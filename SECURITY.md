# Security and private configuration

Use environment variables or a local ignored `.env` for credentials. Commit only
empty or clearly marked placeholder values in `.env.example`. Never commit wallet
seeds, keys, deployment identity files, exchange exports, server access notes, or
real customer data. Use synthetic fixtures for development and tests.

The optional administration scripts require deployment contract addresses and
independently generated wallet keys. Never derive signing keys from public names,
timestamps, or example phrases. Use a separate key for each role.

## Previously published wallet material

Earlier versions included deterministic demo-agent and judge-wallet derivation
material. Treat every wallet derived from those examples as compromised, including
all time-slot judge wallets. Stop using them, replace keys and any associated
permissions, and migrate any assets through your normal wallet tools. Removing
source files does not revoke keys or erase blockchain records.

Historical revisions also contained deployment/server notes and personal local
paths. Current-file cleanup does not remove earlier Git revisions, forks, clones,
pull-request refs, or cached copies. History removal requires a coordinated rewrite
and may require GitHub Support to remove cached sensitive views.

Do not post credentials in public issues. Use GitHub private vulnerability reporting
if enabled; otherwise contact a maintainer privately without including secrets in
the initial message.

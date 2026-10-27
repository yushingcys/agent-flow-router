# Execution boundary

This is a local BYOK router, not a sandbox or a managed authorization service. A process allowed to run it can execute installed connectors using the keys supplied to that process. Use harness permissions and a trusted host to control access.

The public router does not store passwords, browser sessions, or API keys persistently. It does not implement user approval rules, customer accounts, payment collection, or a wallet. Its generic authentication schema and injection code are public so connectors can work independently.

Connector code and compiled hook functions are executable dependencies. Treat additions and updates as code changes requiring review. Hash verification detects content changes; it does not establish that caller-provided code is trusted. A hosted application must use its own reviewed connector bundle and must not accept arbitrary URLs or auth hooks to execute with its credentials.

Never include credentials, private browser state, or personal data in issues or fixture contributions. Use minimal synthetic or scrubbed fixtures. The CI boundary check is a source-scope guard, not a substitute for reviewing publication contents.

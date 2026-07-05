# Graph Report - mikrotik-manager  (2026-07-04)

## Corpus Check
- 161 files · ~1,052,979 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1563 nodes · 2904 edges · 89 communities (82 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6f0fbdb7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_DeviceCollector|DeviceCollector]]
- [[_COMMUNITY_PollerService|PollerService]]
- [[_COMMUNITY_NetflowCollector.ts|NetflowCollector.ts]]
- [[_COMMUNITY_FirewallTab.tsx|FirewallTab.tsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_query|query]]
- [[_COMMUNITY_devices.ts|devices.ts]]
- [[_COMMUNITY_DevicesPage.tsx|DevicesPage.tsx]]
- [[_COMMUNITY_AlertService|AlertService]]
- [[_COMMUNITY_api.ts|api.ts]]
- [[_COMMUNITY_RfHealth.tsx|RfHealth.tsx]]
- [[_COMMUNITY_WirelessSettingsPage.tsx|WirelessSettingsPage.tsx]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_ClientDetailPage.tsx|ClientDetailPage.tsx]]
- [[_COMMUNITY_DeviceCollector.ts|DeviceCollector.ts]]
- [[_COMMUNITY_operations.ts|operations.ts]]
- [[_COMMUNITY_RadiosTab.tsx|RadiosTab.tsx]]
- [[_COMMUNITY_SettingsPage.tsx|SettingsPage.tsx]]
- [[_COMMUNITY_DashboardPage.tsx|DashboardPage.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_HardwareTab.tsx|HardwareTab.tsx]]
- [[_COMMUNITY_.collectAll|.collectAll]]
- [[_COMMUNITY_.detectWifiPackage|.detectWifiPackage]]
- [[_COMMUNITY_Features|Features]]
- [[_COMMUNITY_SwitchPortDiagram.tsx|SwitchPortDiagram.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_wireless.ts|wireless.ts]]
- [[_COMMUNITY_devicesApi|devicesApi]]
- [[_COMMUNITY_NetworkServicesSyslogPage.tsx|NetworkServicesSyslogPage.tsx]]
- [[_COMMUNITY_NetworkServicesDHCPPage.tsx|NetworkServicesDHCPPage.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_TopologyPage.tsx|TopologyPage.tsx]]
- [[_COMMUNITY_DeviceBulkAddWorker.ts|DeviceBulkAddWorker.ts]]
- [[_COMMUNITY_credentialPresets.ts|credentialPresets.ts]]
- [[_COMMUNITY_CircuitBackground.tsx|CircuitBackground.tsx]]
- [[_COMMUNITY_firewallSafety.ts|firewallSafety.ts]]
- [[_COMMUNITY_RouterOSClient|RouterOSClient]]
- [[_COMMUNITY_useCanWrite|useCanWrite]]
- [[_COMMUNITY_useAuthStore|useAuthStore]]
- [[_COMMUNITY_NetworkServicesNetflowPage.tsx|NetworkServicesNetflowPage.tsx]]
- [[_COMMUNITY_MikroTik Manager|MikroTik Manager]]
- [[_COMMUNITY_CopyVlanModal.tsx|CopyVlanModal.tsx]]
- [[_COMMUNITY_useCanWrite.ts|useCanWrite.ts]]
- [[_COMMUNITY_NetworkServicesDiscoveryPage.tsx|NetworkServicesDiscoveryPage.tsx]]
- [[_COMMUNITY_ReportService.ts|ReportService.ts]]
- [[_COMMUNITY_Sidebar.tsx|Sidebar.tsx]]
- [[_COMMUNITY_clients.ts|clients.ts]]
- [[_COMMUNITY_rogueAp.ts|rogueAp.ts]]
- [[_COMMUNITY_BackupService|BackupService]]
- [[_COMMUNITY_corsOrigins.ts|corsOrigins.ts]]
- [[_COMMUNITY_QueuesTab.tsx|QueuesTab.tsx]]
- [[_COMMUNITY_SecurityPage.tsx|SecurityPage.tsx]]
- [[_COMMUNITY_NetworkServicesWireGuardPage.tsx|NetworkServicesWireGuardPage.tsx]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_auditMiddleware.ts|auditMiddleware.ts]]
- [[_COMMUNITY_TrafficAnalyticsPage.tsx|TrafficAnalyticsPage.tsx]]
- [[_COMMUNITY_App.tsx|App.tsx]]
- [[_COMMUNITY_ConfigHistoryTab.tsx|ConfigHistoryTab.tsx]]
- [[_COMMUNITY_GlobalSearch.tsx|GlobalSearch.tsx]]
- [[_COMMUNITY_FirmwarePage.tsx|FirmwarePage.tsx]]
- [[_COMMUNITY_GuestWifiPage.tsx|GuestWifiPage.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_Security Policy|Security Policy]]
- [[_COMMUNITY_cert.ts|cert.ts]]
- [[_COMMUNITY_AutomationSettings.tsx|AutomationSettings.tsx]]
- [[_COMMUNITY_NetworkServicesDNSPage.tsx|NetworkServicesDNSPage.tsx]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_Screenshots|Screenshots]]
- [[_COMMUNITY_TerminalModal.tsx|TerminalModal.tsx]]
- [[_COMMUNITY_Quick Start (Build from Source)|Quick Start (Build from Source)]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_Quick Deploy (Pre-built Images)|Quick Deploy (Pre-built Images)]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_entrypoint.sh|entrypoint.sh]]

## God Nodes (most connected - your core abstractions)
1. `DeviceCollector` - 218 edges
2. `query()` - 82 edges
3. `useCanWrite()` - 62 edges
4. `PollerService` - 35 edges
5. `devicesApi` - 32 edges
6. `requireAuth()` - 30 edges
7. `Features` - 23 edges
8. `queryOne()` - 21 edges
9. `RouterOSClient` - 21 edges
10. `requireWrite()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `useSocket()` --calls--> `io`  [INFERRED]
  frontend/src/hooks/useSocket.ts → backend/src/index.ts
- `TerminalModal()` --calls--> `io`  [INFERRED]
  frontend/src/components/TerminalModal.tsx → backend/src/index.ts
- `buildActivity()` --calls--> `query()`  [EXTRACTED]
  backend/src/routes/operations.ts → backend/src/config/database.ts
- `ProtectedRoute()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/store/authStore.ts
- `SystemConfigTab()` --calls--> `useCanWrite()`  [EXTRACTED]
  frontend/src/components/device-detail/SystemConfigTab.tsx → frontend/src/hooks/useCanWrite.ts

## Import Cycles
- None detected.

## Communities (89 total, 7 thin omitted)

### Community 1 - "PollerService"
Cohesion: 0.06
Nodes (11): withCollector(), withDevice(), withDevice(), FirmwareOrchestrator, sleep(), PollerService, BandwidthTestTool(), PingTool() (+3 more)

### Community 2 - "NetflowCollector.ts"
Cohesion: 0.07
Nodes (35): classifyApp(), PORT_MAP, decodePacket(), DecodeResult, FIELD, FlowRecord, formatIPv4(), formatIPv6() (+27 more)

### Community 3 - "FirewallTab.tsx"
Cohesion: 0.07
Nodes (39): ConnectionsTab(), PROTO_COLOR, splitAddr(), ACTION_COLOR, AddressListsCard(), COMMON_CHAINS, CONN_STATES, Counters() (+31 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (44): dependencies, axios, clsx, date-fns, leaflet, lucide-react, react, react-dom (+36 more)

### Community 5 - "query"
Cohesion: 0.14
Nodes (19): pool, query(), transaction(), authenticateApiToken(), AuthPayload, Express, Request, requireAdmin() (+11 more)

### Community 6 - "devices.ts"
Cohesion: 0.09
Nodes (21): redis, Check, FW_FIELD_MAP, loadCredentialPreset(), makeToolClient(), NAT_FIELD_MAP, QUEUE_FIELD_MAP, router (+13 more)

### Community 7 - "DevicesPage.tsx"
Cohesion: 0.08
Nodes (24): AddDeviceModal(), Props, Props, Props, ResultItem, TryAllDiscoveredModal(), CredentialPresetsSettings(), EMPTY_FORM (+16 more)

### Community 8 - "AlertService"
Cohesion: 0.08
Nodes (17): AlertChannel, AlertContext, AlertEventType, AlertRule, AlertService, cooldownUntil, EVENT_EMOJI, EVENT_LABELS (+9 more)

### Community 9 - "api.ts"
Cohesion: 0.07
Nodes (31): SecurityStatus, BackupsPage(), formatBytes(), AlertHistoryEntry, api, ApiToken, authApi, backupsApi (+23 more)

### Community 10 - "RfHealth.tsx"
Cohesion: 0.09
Nodes (30): ALL_BANDS, CellInfo, ChannelBandRow(), ChannelMap(), ConnectivitySuccess(), RSSI_TICKS, RssiDensity(), STAGE_META (+22 more)

### Community 11 - "WirelessSettingsPage.tsx"
Cohesion: 0.08
Nodes (25): RogueApsCard(), signalCls(), timeAgo(), WirelessPage(), AP_SCAN_INTERVALS, AUTH_TYPES, BANDS_LEGACY, BANDS_WIFI (+17 more)

### Community 12 - "index.ts"
Cohesion: 0.08
Nodes (27): DEFAULT_SETTINGS, runMigrations(), app, httpServer, PORT, start(), terminalNs, errorHandler() (+19 more)

### Community 13 - "index.ts"
Cohesion: 0.08
Nodes (30): formatBps(), formatTime(), GraphsTab(), Props, RESOURCE_RANGES, TRAFFIC_RANGES, metricsApi, BridgeVlanEntry (+22 more)

### Community 14 - "ClientDetailPage.tsx"
Cohesion: 0.09
Nodes (25): APP_COLORS, AppTrafficCard(), ClientDetailPage(), ClientDetailsCard(), ConnectionDiagram(), deviceIcon(), formatBytes(), qualityColor() (+17 more)

### Community 15 - "DeviceCollector.ts"
Cohesion: 0.10
Nodes (15): queryOne(), backupService, router, SECTIONS, SnapshotRow, getToolDevice(), router, getDevice() (+7 more)

### Community 16 - "operations.ts"
Cohesion: 0.10
Nodes (15): getInfluxClient(), getQueryApi(), router, AttentionItem, backupService, buildActivity(), detectAnomalies(), influxGroupValues() (+7 more)

### Community 17 - "RadiosTab.tsx"
Cohesion: 0.09
Nodes (20): APBandEntry, APNetworkEntry, APScanner(), APScanRecord, bandLabel(), BANDS_EDIT, ClientsTable(), parseRateMbps() (+12 more)

### Community 18 - "SettingsPage.tsx"
Cohesion: 0.11
Nodes (24): EditUserState, ROLE_META, SettingsPage(), AlertChannel, AlertRule, alertsApi, auditLogApi, certApi (+16 more)

### Community 19 - "DashboardPage.tsx"
Cohesion: 0.11
Nodes (17): useSocket(), ALL_SEVERITIES, DashboardPage(), downsample(), loadSeverities(), SummaryView(), ALL_SEVERITIES, EventsPage() (+9 more)

### Community 20 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, eslint, @eslint/js, eslint-plugin-security, jest, nodemon, supertest, ts-jest (+16 more)

### Community 21 - "HardwareTab.tsx"
Cohesion: 0.15
Nodes (20): DiskCard(), diskUsageColor(), fanColor(), formatBytes(), formatName(), HardwareTab(), HealthMetric, inferUnit() (+12 more)

### Community 23 - ".detectWifiPackage"
Cohesion: 0.10
Nodes (3): bandPrefix(), parseWifiMonitorChannel(), rfBand()

### Community 24 - "Features"
Cohesion: 0.09
Nodes (23): Alerts, Audit Log, Backups, Configuration History, Configuration Templates, Dashboard, Device Management, Device Network Tools (+15 more)

### Community 25 - "SwitchPortDiagram.tsx"
Cohesion: 0.12
Nodes (17): BondEditForm, CreateTrunkForm, formatBps(), formatPps(), groupQsfpCages(), PortEditForm, portLabel(), PortPacketGraph() (+9 more)

### Community 26 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+13 more)

### Community 27 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, bcryptjs, bullmq, compression, cors, dotenv, express, express-async-errors (+13 more)

### Community 28 - "wireless.ts"
Cohesion: 0.15
Nodes (11): aggregateAPScanRows(), APBandEntry, APNetworkEntry, normBand(), router, _csvSplit(), _fetch(), initOuiDatabase() (+3 more)

### Community 29 - "devicesApi"
Cohesion: 0.15
Nodes (13): DeviceLocationSection(), geocodeAddress(), LocationForm, Props, Props, SystemConfigTab(), addrWithoutMask(), EditDeviceModal() (+5 more)

### Community 30 - "NetworkServicesSyslogPage.tsx"
Cohesion: 0.12
Nodes (15): ACTION_TYPES, ActionForm(), ActionFormProps, aggregateActions(), AggregatedRow, aggregateRules(), BUILTIN_ACTION_NAMES, DeviceCoverage (+7 more)

### Community 31 - "NetworkServicesDHCPPage.tsx"
Cohesion: 0.11
Nodes (11): leaseLabel(), LeaseTableProps, NetworkServicesDHCPPage(), NS, PoolFormProps, PoolTableProps, SectionProps, ServerFormProps (+3 more)

### Community 32 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir (+9 more)

### Community 33 - "TopologyPage.tsx"
Cohesion: 0.14
Nodes (15): buildGraph(), capsLabel(), deviceIcon, edgeTypes, ExternalNode(), handleStyle, handleStyleVisible, nodeTypes (+7 more)

### Community 34 - "DeviceBulkAddWorker.ts"
Cohesion: 0.25
Nodes (14): createRedisConnection(), appendResults(), BulkAddResultRow, BulkJobPayload, enqueueBulkAddJob(), getBulkAddJobState(), metaKey(), processJob() (+6 more)

### Community 35 - "credentialPresets.ts"
Cohesion: 0.17
Nodes (10): getLoginLimits(), loginRateLimit(), rateLimitRedis(), router, CredentialPresetPublic, CredentialPresetRow, presetMutationLimiter, router (+2 more)

### Community 36 - "CircuitBackground.tsx"
Cohesion: 0.16
Nodes (15): buildPulses(), buildTraces(), CircuitBackground(), DARK_PALETTE, DX, DY, lerp(), LIGHT_PALETTE (+7 more)

### Community 37 - "firewallSafety.ts"
Cohesion: 0.19
Nodes (11): topologyNeighborOversized(), DEFAULT_MGMT_PORTS, detectLockoutRisk(), field(), FirewallRuleLike, LockoutResult, portSpecIncludes(), buildServerArpMap() (+3 more)

### Community 39 - "useCanWrite"
Cohesion: 0.23
Nodes (10): BgpSubTab(), dApi, errMsg(), OspfSubTab(), RouteFiltersSubTab(), RoutesSubTab(), SUB_TABS, SubTab (+2 more)

### Community 40 - "useAuthStore"
Cohesion: 0.25
Nodes (9): TopBar(), TopBarProps, LoginPage(), AuthState, useAuthStore, Theme, ThemeState, useThemeStore (+1 more)

### Community 41 - "NetworkServicesNetflowPage.tsx"
Cohesion: 0.14
Nodes (7): NetworkServicesNetflowPage(), NetworkServicesNTPPage(), DeviceServiceRow, NetworkServicesOverviewPage(), networkServicesApi, settingsApi, trafficApi

### Community 42 - "MikroTik Manager"
Cohesion: 0.14
Nodes (13): AI Assistance, Configuration Reference, Contributing, Credential encryption (`ENCRYPTION_KEY`), Disclaimer, Enabling the RouterOS API, License, MikroTik Manager (+5 more)

### Community 43 - "CopyVlanModal.tsx"
Cohesion: 0.19
Nodes (9): AnalyzedOp, arraysEqualAsSet(), ConflictChoice, CopyVlanModal(), naturalSort(), OpStatus, PortAssignment, Step (+1 more)

### Community 44 - "useCanWrite.ts"
Cohesion: 0.21
Nodes (9): Row, scoreColor(), SecurityTab(), SEV_STYLE, PortForm, VlansTab(), DeviceDetailPage(), formatUptime() (+1 more)

### Community 45 - "NetworkServicesDiscoveryPage.tsx"
Cohesion: 0.17
Nodes (10): DEFAULT_SNMP, LldpRow, NetworkServicesDiscoveryPage(), Scope, scopeNoun(), SCOPES, SnmpForm, SnmpRow (+2 more)

### Community 46 - "ReportService.ts"
Cohesion: 0.26
Nodes (5): computeNextRun(), fmtBytes(), PERIOD_DAYS, ReportService, ScheduleRow

### Community 47 - "Sidebar.tsx"
Cohesion: 0.17
Nodes (5): monitorItems, networkServicesSubItems, operationsItems, SidebarProps, wirelessSubItems

### Community 48 - "clients.ts"
Cohesion: 0.27
Nodes (8): router, withCategory(), DEVICE_CATEGORIES, DeviceCategory, fingerprintClient(), HOSTNAME_RULES, Rule, VENDOR_RULES

### Community 50 - "rogueAp.ts"
Cohesion: 0.22
Nodes (9): classifyScans(), NeighborAp, RogueAp, ScannedEntry, ScannedNetwork, ScanRecord, ownBssids, ownSsids (+1 more)

### Community 52 - "corsOrigins.ts"
Cohesion: 0.36
Nodes (8): corsMiddlewareOptions(), DEFAULT_DEV_ORIGINS, getResolved(), parseList(), resetCorsResolvedCacheForTests(), resolveCors(), Resolved, socketIoCorsOptions()

### Community 53 - "QueuesTab.tsx"
Cohesion: 0.27
Nodes (8): EMPTY, errMsg(), joinLimit(), QForm, QueuesTab(), RATE_PRESETS, Row, splitLimit()

### Community 54 - "SecurityPage.tsx"
Cohesion: 0.24
Nodes (8): OperationsView(), DevicePosture, scoreColor(), SecurityPage(), SEV_BADGE, SEV_DOT, SEV_ORDER, SecurityCheck

### Community 55 - "NetworkServicesWireGuardPage.tsx"
Cohesion: 0.24
Nodes (6): formatBytes(), IfaceFormProps, NetworkServicesWireGuardPage(), NS, PeerFormProps, truncateKey()

### Community 56 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, install:graphify, lint, migrate, start, test (+1 more)

### Community 57 - "auditMiddleware.ts"
Cohesion: 0.31
Nodes (5): auditMiddleware(), extractEntity(), extractUser(), verifyToken(), router

### Community 58 - "TrafficAnalyticsPage.tsx"
Cohesion: 0.33
Nodes (8): APP_COLORS, clientLabel(), formatBytes(), formatCount(), Range, RANGES, timeFormatter(), TrafficAnalyticsPage()

### Community 59 - "App.tsx"
Cohesion: 0.29
Nodes (4): ProtectedRoute(), AppLayout(), queryClient, storedTheme

### Community 60 - "ConfigHistoryTab.tsx"
Cohesion: 0.32
Nodes (6): ConfigHistoryTab(), Props, configHistoryApi, DiffRow, DiffRowType, lineDiff()

### Community 61 - "GlobalSearch.tsx"
Cohesion: 0.25
Nodes (6): SearchClient, SearchDevice, SearchEvent, SearchResults, SEVERITY_ICON_CLS, searchApi

### Community 62 - "FirmwarePage.tsx"
Cohesion: 0.25
Nodes (5): FirmwarePage(), ITEM_STATUS, ROLLOUT_STATUS, firmwareApi, FirmwareRolloutDevice

### Community 63 - "GuestWifiPage.tsx"
Cohesion: 0.36
Nodes (6): formatBytes(), GuestWifiPage(), HS, printVouchers(), VoucherGenerator(), guestWifiApi

### Community 64 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 65 - "Security Policy"
Cohesion: 0.25
Nodes (7): AI-Assisted Security Infrastructure, Reporting a Vulnerability, Security Considerations for Self-Hosted Deployments, Security Policy, Supported Versions, What to expect, What to include in your report

### Community 66 - "cert.ts"
Cohesion: 0.29
Nodes (5): CERT_PATH, execFileAsync, KEY_PATH, RELOAD_SIGNAL, router

### Community 68 - "NetworkServicesDNSPage.tsx"
Cohesion: 0.29
Nodes (5): NetworkServicesDNSPage(), NS, RECORD_TYPES, RecordFormProps, RecordType

### Community 69 - "package.json"
Cohesion: 0.29
Nodes (6): name, private, scripts, install:graphify, version, workspaces

### Community 70 - "Screenshots"
Cohesion: 0.29
Nodes (7): Client Tracking, Dashboard, Device Management, Events &amp; Backups, Network Topology, Screenshots, Wireless

### Community 71 - "TerminalModal.tsx"
Cohesion: 0.33
Nodes (5): io, ConnState, Props, RESIZE_HANDLES, TerminalModal()

### Community 72 - "Quick Start (Build from Source)"
Cohesion: 0.33
Nodes (6): 1. Clone the repository, 2. Configure environment variables, 3. Start the application, 4. Open the app, 5. Log in, Quick Start (Build from Source)

### Community 73 - "package.json"
Cohesion: 0.40
Nodes (4): description, main, name, version

### Community 75 - "Quick Deploy (Pre-built Images)"
Cohesion: 0.40
Nodes (5): 1. Download the compose file, 2. Create your environment file, 3. Start the application, 4. Open the app, Quick Deploy (Pre-built Images)

## Knowledge Gaps
- **481 isolated node(s):** `name`, `version`, `description`, `main`, `build` (+476 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DeviceCollector` connect `DeviceCollector` to `PollerService`, `query`, `devices.ts`, `firewallSafety.ts`, `RouterOSClient`, `.snapshotConfig`, `.createBond`, `.updateBridgeVlan`, `.addWireGuardInterface`, `DeviceCollector.ts`, `operations.ts`, `.setupGuestNetwork`, `.getLldpEnabled`, `.collectAll`, `.detectWifiPackage`, `wireless.ts`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `io` connect `TerminalModal.tsx` to `DashboardPage.tsx`, `index.ts`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `useSocket()` connect `DashboardPage.tsx` to `useAuthStore`, `ClientDetailPage.tsx`, `TerminalModal.tsx`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _481 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DeviceCollector` be split into smaller, more focused modules?**
  _Cohesion score 0.015873015873015872 - nodes in this community are weakly interconnected._
- **Should `PollerService` be split into smaller, more focused modules?**
  _Cohesion score 0.06487434248977206 - nodes in this community are weakly interconnected._
- **Should `NetflowCollector.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06638714185883997 - nodes in this community are weakly interconnected._
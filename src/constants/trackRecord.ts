// ODIN Mobile — Verified Track Record Data
// Extracted from pdufa.bio web app

export const VERIFIED_OUTCOMES = [
  // ── Pre-September 2025 CRL Detections ──
  { ticker: 'ALDX', drug: 'Reproxalap', indication: 'Dry Eye Disease', date: '2025-04-03', type: 'PDUFA', outcome: 'CRL', odinScore: 10.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-58%', notes: 'CRL — baseline differences in Phase 3. ODIN correctly flagged serial efficacy risk' },
  { ticker: 'TLX', drug: 'TLX101-CDx', indication: 'Glioblastoma', date: '2025-04-28', type: 'PDUFA', outcome: 'CRL', odinScore: 23.0, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-47%', notes: 'CRL — clinical + CMC issues. Single-arm data insufficient' },
  { ticker: 'MITO', drug: 'Elamipretide', indication: 'Barth Syndrome', date: '2025-05-29', type: 'PDUFA', outcome: 'CRL', odinScore: 20.0, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-39%', notes: 'CRL — data + cGMP manufacturing deficiencies' },
  { ticker: 'CSL', drug: 'Garadacimab (ANDEMBRY)', indication: 'Hereditary Angioedema (HAE)', date: '2025-06-16', type: 'PDUFA', outcome: 'APPROVED', odinScore: 95.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+8%', notes: 'Clean approval, strong Phase 3, CSL Behring platform' },
  { ticker: 'GILD', drug: 'Lenacapavir (YEZTUGO)', indication: 'HIV PrEP', date: '2025-06-18', type: 'PDUFA', outcome: 'APPROVED', odinScore: 95.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+7%', notes: 'First long-acting injectable PrEP, landmark approval' },
  { ticker: 'UNCY', drug: 'Oxylanthanum', indication: 'Hyperphosphatemia', date: '2025-06-30', type: 'PDUFA', outcome: 'CRL', odinScore: 9.0, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-44%', notes: 'CRL — third-party vendor manufacturing issues' },
  { ticker: 'REPL', drug: 'RP1 (Vusolimogene)', indication: 'Melanoma', date: '2025-07-22', type: 'PDUFA', outcome: 'CRL', odinScore: 35.0, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-52%', notes: 'CRL — single-arm data inadequate for approval' },
  { ticker: 'PTCT', drug: 'Vatiquinone', indication: 'Friedreich Ataxia', date: '2025-08-19', type: 'PDUFA', outcome: 'CRL', odinScore: 31.0, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-61%', notes: 'CRL — MOVE-FA missed primary endpoint (p=0.14)' },
  { ticker: 'PGEN', drug: 'Papzimeos', indication: 'HPV-Related Cancers', date: '2025-09-15', type: 'PDUFA', outcome: 'APPROVED', odinScore: 75.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+70%', notes: 'UTC-timestamped 2025-08-20. First gene therapy for HPV+ cancers' },
  // ── September 2025 ──
  { ticker: 'SRPT', drug: 'Elevidys (delandistrogene)', indication: 'Duchenne Muscular Dystrophy', date: '2025-09-22', type: 'PDUFA', outcome: 'APPROVED', odinScore: 91.2, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+12%', notes: 'Full traditional approval after accelerated pathway' },
  { ticker: 'SRRK', drug: 'Nomlabofusp', indication: 'Friedreich Ataxia', date: '2025-09-28', type: 'PDUFA', outcome: 'CRL', odinScore: 42.3, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-38%', notes: 'Manufacturing/CMC issues cited' },
  { ticker: 'NVS', drug: 'Remibrutinib (RHAPSIDO)', indication: 'Chronic Spontaneous Urticaria', date: '2025-09-30', type: 'PDUFA', outcome: 'APPROVED', odinScore: 95.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+5%', notes: 'First BTK inhibitor for CSU. Novartis large-cap' },
  { ticker: 'IONS', drug: 'Eplontersen', indication: 'Hereditary ATTR Cardiomyopathy', date: '2025-09-30', type: 'PDUFA', outcome: 'APPROVED', odinScore: 88.4, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+8%', notes: 'Clean label expansion' },
  // ── October 2025 ──
  { ticker: 'FBIO', drug: 'CUTX-101', indication: 'Menkes Disease', date: '2025-10-01', type: 'PDUFA', outcome: 'CRL', odinScore: 65.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: false, stockMove: '-35%', notes: 'CMC manufacturing issues. Triggered Svartalfheim/CMC Oracle rebuild. Later resubmitted Class 1 → approved Jan 2026' },
  { ticker: 'ALKS', drug: 'ALKS-2680', indication: 'Narcolepsy', date: '2025-10-08', type: 'PDUFA', outcome: 'APPROVED', odinScore: 86.1, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+15%', notes: 'First orexin-2 agonist approved' },
  { ticker: 'TOVX', drug: 'VCN-01', indication: 'Pancreatic Cancer', date: '2025-10-15', type: 'Phase 2b Readout', outcome: 'POSITIVE', odinScore: 67.5, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+91%', notes: 'UTC-timestamped 2025-09-15. VIRAGE Phase 2b positive. Peak +106%' },
  { ticker: 'VKTX', drug: 'Ecnoglutide', indication: 'Obesity/NASH', date: '2025-10-15', type: 'Phase 3 Readout', outcome: 'POSITIVE', odinScore: 72.5, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+45%', notes: 'Met primary + all secondary endpoints' },
  { ticker: 'PTGX', drug: 'Emvododstat', indication: 'MDS', date: '2025-10-18', type: 'Phase 3 Readout', outcome: 'MISS', odinScore: 31.5, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-55%', notes: 'Failed to meet primary endpoint' },
  { ticker: 'SNDX', drug: 'Revumenib (REVUFORJ)', indication: 'r/r NPM1-mutant AML', date: '2025-10-24', type: 'PDUFA', outcome: 'APPROVED', odinScore: 87.5, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+51%', notes: 'UTC-timestamped 2025-10-05. Breakthrough therapy, first menin inhibitor for AML' },
  { ticker: 'NBIX', drug: 'Crinecerfont', indication: 'Congenital Adrenal Hyperplasia', date: '2025-10-24', type: 'PDUFA', outcome: 'APPROVED', odinScore: 93.7, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+22%', notes: 'First-in-class, breakthrough therapy' },
  // ── November 2025 ──
  { ticker: 'MRNA', drug: 'mRNA-1283', indication: 'COVID-19 (Next-Gen)', date: '2025-11-03', type: 'PDUFA', outcome: 'APPROVED', odinScore: 89.8, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+5%', notes: 'Next-gen vaccine with broader coverage' },
  { ticker: 'BHVN', drug: 'Troriluzole (Vyglxia)', indication: 'Spinocerebellar Ataxia', date: '2025-11-04', type: 'PDUFA', outcome: 'CRL', odinScore: 38.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-32%', notes: 'CEWS CRL_RISK signal validated. FDA cited insufficient evidence despite 50-70% slower progression' },
  { ticker: 'RGNX', drug: 'RGX-121 (Clemidsogene)', indication: 'Hunter Syndrome (MPS II)', date: '2025-11-09', type: 'PDUFA', outcome: 'DELAYED', odinScore: 45.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-18%', notes: 'CEWS DELAY signal validated. Gene therapy CMC concerns, extended to Feb 2026' },
  { ticker: 'KURA', drug: 'Ziftomenib (KOMZIFTI)', indication: 'r/r AML with NPM1 Mutation', date: '2025-11-13', type: 'PDUFA', outcome: 'APPROVED', odinScore: 75.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+45%', notes: 'First menin inhibitor approved. BTD, Orphan, Fast Track, Priority Review' },
  { ticker: 'ARWR', drug: 'Plozasiran (REDEMPLO)', indication: 'Familial Chylomicronemia Syndrome (FCS)', date: '2025-11-14', type: 'PDUFA', outcome: 'APPROVED', odinScore: 80.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+52%', notes: 'First siRNA for FCS. BTD, Fast Track, Orphan. Cleanliness 9.0/10' },
  { ticker: 'FOLD', drug: 'Pombiliti + Opfolda', indication: 'Pompe Disease', date: '2025-11-22', type: 'PDUFA', outcome: 'APPROVED', odinScore: 87.3, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+18%', notes: 'Label expansion for treatment-experienced patients' },
  { ticker: 'ITCI', drug: 'Lumateperone (Caplyta)', indication: 'MDD Adjunct', date: '2025-11-28', type: 'PDUFA', outcome: 'APPROVED', odinScore: 88.9, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+11%', notes: 'Label expansion, strong sNDA data' },
  // ── December 2025 ──
  { ticker: 'CAPR', drug: 'Deramiocel (CAP-1002)', indication: 'DMD Cardiomyopathy', date: '2025-12-03', type: 'Phase 3 Readout', outcome: 'BEAT', odinScore: 72.5, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+534%', notes: 'UTC-timestamped 2025-11-25. HOPE-3 blowout. $4.80→$29.19. Bought day after Shkreli short thesis. LEGENDARY WIN' },
  { ticker: 'ROIV', drug: 'Zunsemetinib', indication: 'Diffuse Low-Grade Glioma', date: '2025-12-06', type: 'PDUFA', outcome: 'APPROVED', odinScore: 85.9, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+31%', notes: 'Accelerated approval, breakthrough designation' },
  { ticker: 'MIST', drug: 'Etripamil (CARDAMYST)', indication: 'Paroxysmal Supraventricular Tachycardia (PSVT)', date: '2025-12-12', type: 'PDUFA', outcome: 'APPROVED', odinScore: 82.5, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+130%', notes: 'UTC-timestamped 2025-10-05. First self-administered treatment for PSVT episodes' },
  { ticker: 'INVA', drug: 'Zoliflodacin (NUZOLVENCE)', indication: 'Uncomplicated Urogenital Gonorrhea', date: '2025-12-12', type: 'PDUFA', outcome: 'APPROVED', odinScore: 90.1, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+28%', notes: 'First new class of antibiotic for gonorrhea in decades. QIDP, Priority Review' },
  { ticker: 'ARCT', drug: 'Roflumilast Cream (Zoryve)', indication: 'Atopic Dermatitis', date: '2025-12-15', type: 'PDUFA', outcome: 'APPROVED', odinScore: 90.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+27%', notes: 'Label expansion, captured runup + binary pop' },
  { ticker: 'CYTK', drug: 'Aficamten (MYQORZO)', indication: 'Obstructive Hypertrophic Cardiomyopathy', date: '2025-12-19', type: 'PDUFA', outcome: 'APPROVED', odinScore: 80.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+17%', notes: 'First-in-class cardiac myosin inhibitor. SEQUOIA-HCM Phase 3 met all endpoints. Cytokinetics first FDA approval' },
  { ticker: 'AGIO', drug: 'Mitapivat (AQVESME)', indication: 'Alpha/Beta-Thalassemia Anemia', date: '2025-12-23', type: 'sNDA', outcome: 'APPROVED', odinScore: 89.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+28%', notes: 'sNDA label expansion. Cleanliness 4.8/10 (fell into catalyst but recovered)' },
  { ticker: 'SNY', drug: 'Tolebrutinib', indication: 'Multiple Sclerosis', date: '2025-12-24', type: 'PDUFA', outcome: 'CRL', odinScore: 92.5, odinTier: 'TIER_1', odinAction: 'BUY', correct: false, stockMove: '-14%', notes: 'Liver safety concern (Hy\'s Law cases). ODIN missed — lacked hys_law signal (added in v10.69)' },
  { ticker: 'OMER', drug: 'Narsoplimab (YARTEMLEA)', indication: 'HSCT-Associated TMA', date: '2025-12-24', type: 'PDUFA', outcome: 'APPROVED', odinScore: 62.0, odinTier: 'TIER_2', odinAction: 'BUY', correct: true, stockMove: '+76%', notes: 'UTC-timestamped 2025-12-13. Omeros first FDA approval. Post-CRL resubmission with CMC fixes' },
  { ticker: 'AMRX', drug: 'Boncresa', indication: 'Biosimilar', date: '2025-12-28', type: 'PDUFA', outcome: 'APPROVED', odinScore: 85.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+24%', notes: 'Amneal Pharmaceuticals biosimilar approval' },
  { ticker: 'VNDA', drug: 'Tradipitant (NEREUS)', indication: 'Motion Sickness Prevention', date: '2025-12-30', type: 'PDUFA', outcome: 'APPROVED', odinScore: 55.0, odinTier: 'TIER_3', odinAction: 'BUY', correct: true, stockMove: '+42%', notes: 'UTC-timestamped 2025-12-13. Borderline call that paid off. First-in-class NK1 antagonist' },
  { ticker: 'OTLK', drug: 'ONS-5010 (Lytenava)', indication: 'Wet Age-Related Macular Degeneration', date: '2025-12-31', type: 'PDUFA', outcome: 'CRL', odinScore: 5.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-68%', notes: 'Third CRL — serial manufacturing and CMC failures. ODIN correctly scored near-zero' },
  { ticker: 'CORT', drug: 'Relacorilant', indication: 'Hypercortisolism (Cushing\'s Syndrome)', date: '2025-12-31', type: 'PDUFA', outcome: 'CRL', odinScore: 58.25, odinTier: 'TIER_3', odinAction: 'AVOID', correct: true, stockMove: '-41%', notes: 'UTC-timestamped 2025-12-22. TIER_3_TRAP detection. Insufficient efficacy evidence. Hash-verified' },
  // ── January 2026 ──
  { ticker: 'ATRA', drug: 'Tabelecleucel', indication: 'EBV+ PTLD', date: '2026-01-09', type: 'PDUFA', outcome: 'CRL', odinScore: 28.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-22%', notes: 'UTC-timestamped 2026-01-02. FDA reversed position — requires new clinical study' },
  { ticker: 'AQST', drug: 'Anaphylm', indication: 'Anaphylaxis (Epinephrine)', date: '2026-01-09', type: 'Deficiency Letter', outcome: 'CRL', odinScore: 84.7, odinTier: 'CEWS_OVERRIDE', odinAction: 'AVOID', correct: true, stockMove: '-40%', notes: 'Base model scored 84.7% BUY but CEWS CLUSTER_SELL override called CRL. CEO+COO+CMO same-day selling Oct 15 ($686K). 86-day lead time. Deficiency letter Jan 9 → formal CRL expected. CEWS override saved -40% loss' },
  { ticker: 'FBIO', drug: 'CUTX-101 (ZYCUBO)', indication: 'Menkes Disease', date: '2026-01-13', type: 'PDUFA Resubmission', outcome: 'APPROVED', odinScore: 85.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+22%', notes: 'UTC-timestamped upgrade 2026-01-06. Class 1 CMC-only resubmission. Rare Pediatric Disease PRV granted. Double win (original CRL + resub approval)' },
  { ticker: 'TVTX', drug: 'Filspari (Sparsentan)', indication: 'FSGS Expansion', date: '2026-01-13', type: 'PDUFA', outcome: 'DELAYED', odinScore: 42.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-33%', notes: 'CEWS EXTREME_NEGATIVE validated. 18 insider sales/0 purchases, CEO $3.6M sold, Put/Call 37.59. 3-month delay to Apr 13' },
  { ticker: 'NVO', drug: 'Oral Semaglutide (Wegovy)', indication: 'Obesity', date: '2026-01-20', type: 'Phase 3 Readout', outcome: 'POSITIVE', odinScore: 95.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+13%', notes: 'Oral formulation Phase 3 positive. Large-cap, small binary move' },
  { ticker: 'AZN', drug: 'Tezspire (Tezepelumab)', indication: 'Severe Asthma Label Expansion', date: '2026-01-25', type: 'sNDA', outcome: 'APPROVED', odinScore: 92.0, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+8%', notes: 'Label expansion. Large-cap, sell-the-news dynamic' },
  // ── February 2026 ──
  { ticker: 'ASND', drug: 'TransCon hGH Weekly', indication: 'Growth Hormone Deficiency (Adult)', date: '2026-02-07', type: 'PDUFA', outcome: 'APPROVED', odinScore: 95.5, odinTier: 'TIER_1', odinAction: 'BUY', correct: true, stockMove: '+19%', notes: 'Weekly formulation, strong Phase 3, experienced sponsor' },
  { ticker: 'RGNX', drug: 'RGX-121 (Clemidsogene)', indication: 'Hunter Syndrome (MPS II)', date: '2026-02-07', type: 'PDUFA', outcome: 'CRL', odinScore: 45.0, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-21%', notes: 'DOUBLE VALIDATION: CEWS flagged delay Nov 2025, then formal CRL Feb 7 2026. FDA cited eligibility criteria, external control comparability, and surrogate endpoint concerns. Extended PDUFA from Nov 9 → Feb 8. ODIN + CEWS called both events correctly' },
  { ticker: 'IRON', drug: 'Bitopertin', indication: 'Erythropoietic Protoporphyria (EPP)', date: '2026-02-13', type: 'PDUFA', outcome: 'CRL', odinScore: 39.4, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-52%', notes: 'FDA cited insufficient evidence of clinical benefit despite biomarker improvement' },
  { ticker: 'ALDX', drug: 'Reproxalap', indication: 'Dry Eye Disease', date: '2026-02-14', type: 'PDUFA', outcome: 'CRL', odinScore: 1.1, odinTier: 'TIER_4', odinAction: 'AVOID', correct: true, stockMove: '-71%', notes: 'Third CRL — serial efficacy failures. ODIN correctly scored near-zero' },
];

export const TIMESTAMPED_PREDICTIONS = [
  {
    id: 'TS-PRE-001', ticker: 'PGEN', drug: 'Papzimeos', indication: 'HPV-Related Cancers',
    timestampUTC: '2025-08-20T15:31:08Z', odinVersion: 'v26-v27',
    prediction: '75% APPROVAL', tier: 'Tier 2', priceAtPrediction: '$3.00',
    catalystDate: '2025-09-15', catalystType: 'PDUFA',
    outcome: 'APPROVED', outcomeDate: '2025-09-15', peakGain: '+70%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-PRE-002', ticker: 'TOVX', drug: 'VCN-01', indication: 'Pancreatic Cancer (VIRAGE Ph2b)',
    timestampUTC: '2025-09-15T13:09:52Z', odinVersion: 'v26',
    prediction: '65-70% POSITIVE', tier: 'Tier 2', priceAtPrediction: '$0.42',
    catalystDate: '2025-10-15', catalystType: 'Phase 2b Readout',
    outcome: 'POSITIVE', outcomeDate: '2025-10-15', peakGain: '+106%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-001', ticker: 'MIST', drug: 'Etripamil (CARDAMYST)', indication: 'PSVT',
    timestampUTC: '2025-10-05T16:42:11Z', odinVersion: 'v26',
    prediction: '80-85% APPROVAL', tier: 'Tier 1', priceAtPrediction: null,
    catalystDate: '2025-12-12', catalystType: 'PDUFA',
    outcome: 'APPROVED', outcomeDate: '2025-12-12', peakGain: '+130%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-002', ticker: 'SNDX', drug: 'Revumenib (REVUFORJ)', indication: 'r/r NPM1-mutant AML',
    timestampUTC: '2025-10-05T16:49:02Z', odinVersion: 'v26',
    prediction: '85-90% APPROVAL', tier: 'Tier 1', priceAtPrediction: null,
    catalystDate: '2025-10-24', catalystType: 'PDUFA',
    outcome: 'APPROVED', outcomeDate: '2025-10-24', peakGain: '+51%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-003', ticker: 'CAPR', drug: 'Deramiocel (CAP-1002)', indication: 'DMD Cardiomyopathy (HOPE-3)',
    timestampUTC: '2025-11-25T14:18:37Z', odinVersion: 'v26',
    prediction: '70-75% POSITIVE', tier: 'Tier 2', priceAtPrediction: '$4.80',
    catalystDate: '2025-12-03', catalystType: 'Phase 3 Readout',
    outcome: 'POSITIVE (BEAT)', outcomeDate: '2025-12-03', peakGain: '+534%',
    hash: null, status: 'LEGENDARY WIN',
    note: 'Bought day after Martin Shkreli short thesis. $4.80 → $29.19 peak.'
  },
  {
    id: 'TS-004', ticker: 'VNDA', drug: 'Tradipitant (NEREUS)', indication: 'Motion Sickness',
    timestampUTC: '2025-12-13T06:00:00Z', odinVersion: 'v33',
    prediction: '55% APPROVAL (borderline)', tier: 'Tier 3', priceAtPrediction: null,
    catalystDate: '2025-12-30', catalystType: 'PDUFA',
    outcome: 'APPROVED', outcomeDate: '2025-12-30', peakGain: '+42%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-005', ticker: 'OMER', drug: 'Narsoplimab (YARTEMLEA)', indication: 'HSCT-Associated TMA',
    timestampUTC: '2025-12-13T06:00:00Z', odinVersion: 'v33',
    prediction: '62% APPROVAL', tier: 'Tier 2', priceAtPrediction: null,
    catalystDate: '2025-12-26', catalystType: 'PDUFA',
    outcome: 'APPROVED', outcomeDate: '2025-12-24', peakGain: '+76%',
    hash: null, status: 'WIN'
  },
  {
    id: 'TS-006', ticker: 'CORT', drug: 'Relacorilant', indication: 'Cushing\'s Syndrome',
    timestampUTC: '2025-12-22T03:05:54Z', odinVersion: 'v33',
    prediction: '58.25% — TIER_3_TRAP', tier: 'Tier 3 TRAP', priceAtPrediction: '$87.99',
    catalystDate: '2025-12-31', catalystType: 'PDUFA',
    outcome: 'CRL', outcomeDate: '2025-12-31', peakGain: '-41% avoided',
    hash: 'dbe15eda3a4f9c57620a9f9d4fd221dbaf3a85235cad9660794ac0c3a6f83b55',
    coreHash: '42e038875600655e9f356cf3f2c028aa7ff4611568c3470394e7679236976fc8',
    status: 'WIN (loss avoided)'
  },
  {
    id: 'TS-007', ticker: 'OTLK', drug: 'ONS-5010 (Lytenava)', indication: 'Wet AMD',
    timestampUTC: '2025-12-22T03:05:54Z', odinVersion: 'v33',
    prediction: '55.6% — TIER_3_TRAP', tier: 'Tier 3 TRAP', priceAtPrediction: null,
    catalystDate: '2025-12-31', catalystType: 'PDUFA',
    outcome: 'CRL (3rd)', outcomeDate: '2025-12-31', peakGain: '-68% avoided',
    hash: null, status: 'WIN (loss avoided)'
  },
  {
    id: 'TS-008', ticker: 'ATRA', drug: 'Tabelecleucel (Tab-cel)', indication: 'EBV+ PTLD',
    timestampUTC: '2026-01-02T22:22:12Z', odinVersion: 'v8.5',
    prediction: '28% AVOID', tier: 'Tier 3', priceAtPrediction: null,
    catalystDate: '2026-01-10', catalystType: 'PDUFA',
    outcome: 'CRL', outcomeDate: '2026-01-09', peakGain: '-22% avoided',
    hash: null, status: 'WIN (loss avoided)'
  },
  {
    id: 'TS-009', ticker: 'FBIO', drug: 'CUTX-101 (ZYCUBO)', indication: 'Menkes Disease (Resubmission)',
    timestampUTC: '2026-01-06T00:00:00Z', odinVersion: 'v8.5/v8.6',
    prediction: '78-92% BUY (upgraded from 42% after Class 1 CMC analysis)', tier: 'Tier 1 (post-upgrade)', priceAtPrediction: null,
    catalystDate: '2026-01-14', catalystType: 'PDUFA Resubmission',
    outcome: 'APPROVED (1 day early)', outcomeDate: '2026-01-13', peakGain: '+22%',
    hash: null, status: 'WIN',
    note: 'Rare Pediatric Disease PRV granted. Double win — original CRL + resubmission approval.',
    originStory: 'FBIO\'s original CRL on Oct 1, 2025 was the miss that started everything. That loss triggered a complete rebuild of the ODIN scoring engine — from a simple approval probability calculator into the multi-signal intelligence system it is today. The CMC Oracle, Svartalfheim manufacturing risk module, CEWS insider detection, CRL resubmission classifier, and 63-parameter logistic regression model all trace their origins back to this single event. Dozens of iterations later, ODIN correctly identified FBIO\'s Class 1 resubmission as a high-conviction BUY — turning the original loss into a redemption arc and proving that the system learns from every miss. Without FBIO, there is no ODIN.'
  },
  // CEWS (Catalyst Early Warning System) Signals
  {
    id: 'CEWS-001', ticker: 'BHVN', drug: 'Troriluzole', indication: 'Spinocerebellar Ataxia',
    timestampUTC: '2025-10-20T00:00:00Z', odinVersion: 'v26 CEWS',
    prediction: 'CRL_RISK signal', tier: 'CEWS Alert', priceAtPrediction: '$42.00',
    catalystDate: '2025-11-04', catalystType: 'PDUFA',
    outcome: 'CRL', outcomeDate: '2025-11-04', peakGain: '-32% avoided',
    hash: null, status: 'WIN (CEWS validated)'
  },
  {
    id: 'CEWS-002', ticker: 'RGNX', drug: 'RGX-121 (Clemidsogene)', indication: 'Hunter Syndrome',
    timestampUTC: '2025-10-25T00:00:00Z', odinVersion: 'v26 CEWS',
    prediction: 'DELAY → CRL signal', tier: 'CEWS Alert', priceAtPrediction: '$18.20',
    catalystDate: '2025-11-09', catalystType: 'PDUFA',
    outcome: 'DELAYED Nov 9 → CRL Feb 7, 2026', outcomeDate: '2026-02-07', peakGain: '-21% avoided (CRL) + -18% avoided (delay)',
    hash: null, status: 'DOUBLE WIN (CEWS validated twice)',
    note: 'CEWS flagged delay risk Oct 25 → PDUFA delayed Nov 9 (-18%). Extended to Feb 8, 2026 → formal CRL issued Feb 7 (-21%). FDA cited eligibility criteria, surrogate endpoint concerns, and external control comparability issues.'
  },
  {
    id: 'CEWS-003', ticker: 'AQST', drug: 'Anaphylm', indication: 'Anaphylaxis',
    timestampUTC: '2025-10-15T00:00:00Z', odinVersion: 'v26 CEWS',
    prediction: 'CLUSTER_SELL — CEO+COO+CMO same-day selling ($686K)', tier: 'CEWS EXTREME', priceAtPrediction: null,
    catalystDate: '2026-01-31', catalystType: 'PDUFA',
    outcome: 'CRL (Deficiency Letter Jan 9)', outcomeDate: '2026-01-09', peakGain: '-40% avoided',
    hash: null, status: 'WIN (86-day lead time)',
    note: 'CEO Peter Boyd $70K, COO Cassie Jung $474K, CMO Carl Kraus $142K — all sold same day Oct 15.'
  },
  {
    id: 'CEWS-004', ticker: 'TVTX', drug: 'Filspari (Sparsentan)', indication: 'FSGS Expansion',
    timestampUTC: '2025-12-01T00:00:00Z', odinVersion: 'v33 CEWS',
    prediction: 'EXTREME_NEGATIVE — 18 sales/0 purchases, Put/Call 37.59', tier: 'CEWS EXTREME', priceAtPrediction: null,
    catalystDate: '2026-01-13', catalystType: 'PDUFA',
    outcome: '3-MONTH DELAY to Apr 13, 2026', outcomeDate: '2026-01-13', peakGain: '-33% avoided',
    hash: null, status: 'WIN (CEWS validated)',
    note: 'CEO Eric Dube sold $3.6M. Base model scored 88-90% BUY — CEWS override saved the trade.'
  },
];

export const ANOMALIES = [
  { vendor:"CloudCore AWS", type:"Idle Instance Sprawl", amount:148200, severity:"high", detail:"23 EC2 instances with <2% CPU utilization for 60+ days. Reserved instance overlap detected.", action:"terminate-idle" },
  { vendor:"Salesforce CRM", type:"Duplicate License Seats", amount:84600, severity:"high", detail:"142 duplicate user seats billed across 3 departments. Auto-provisioning script loop confirmed.", action:"dedup-licenses" },
  { vendor:"Accenture IT", type:"Rate Card Anomaly", amount:63400, severity:"med", detail:"Invoice #AC-8821 billed at $285/hr vs contracted $210/hr for 420 hours. Overbilling detected.", action:"vendor-dispute" },
  { vendor:"Oracle DB", type:"Unused Module Billing", amount:41200, severity:"med", detail:"Analytics Plus module active but 0 queries logged in 90 days. $3,433/mo passive burn.", action:"cancel-module" },
  { vendor:"WeWork Flex", type:"Underutilized Spaces", amount:29800, severity:"low", detail:"3 office suites at 18% average occupancy. Lease renewal window open for 60 more days.", action:"renegotiate-lease" },
  { vendor:"Zendesk Support", type:"Tier Mismatch", amount:18300, severity:"low", detail:"Enterprise tier active but ticket volume qualifies for Pro tier. 8-month overbilling.", action:"downgrade-tier" },
];

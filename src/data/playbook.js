export const PLAYBOOK = [
  {
    priority:"high",
    title:"Terminate 23 Idle Cloud Instances",
    desc:"Auto-scale down underutilized EC2 fleet. Rightsize 8 instances, terminate 15. Requires DevOps approval.",
    roi:"$148,200/yr",
    effort:"2 hrs",
    action:"CloudOps webhook → instance termination + SNS alert to DevOps Lead",
    type:"terminate-idle"
  },
  {
    priority:"high",
    title:"Revoke 142 Duplicate SaaS Seats",
    desc:"De-provision duplicate Salesforce seats via API. Auto-generate offboarding tickets in Jira.",
    roi:"$84,600/yr",
    effort:"1 day",
    action:"Salesforce API → bulk seat revocation + IT helpdesk workflow triggered",
    type:"dedup-licenses"
  },
  {
    priority:"med",
    title:"Dispute Accenture Overbilling",
    desc:"Generate formal dispute letter with rate card evidence. Trigger vendor escalation workflow.",
    roi:"$63,400 recovery",
    effort:"1 week",
    action:"Email to Vendor Manager → dispute ticket → payment hold flag",
    type:"vendor-dispute"
  },
  {
    priority:"med",
    title:"Cancel Oracle Unused Module",
    desc:"Submit Oracle contract amendment to remove Analytics Plus. Effective next billing cycle.",
    roi:"$41,200/yr",
    effort:"3 days",
    action:"Procurement workflow → PO amendment → Oracle account manager notified",
    type:"cancel-module"
  },
  {
    priority:"low",
    title:"Renegotiate WeWork Flex Leases",
    desc:"Consolidate 3 underused suites into 1. Lease window closes in 60 days — act now.",
    roi:"$29,800/yr",
    effort:"2 weeks",
    action:"Facilities manager briefing → vendor negotiation playbook triggered",
    type:"renegotiate-lease"
  },
];

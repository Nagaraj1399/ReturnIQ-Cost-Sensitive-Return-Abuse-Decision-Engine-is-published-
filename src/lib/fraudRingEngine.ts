/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Fraud-Ring Network Graph & Community Detection Engine
 * 
 * Notice: The Kaggle dataset has no native account-linkage field.
 * This engine constructs synthetic account linkages (shared drop addresses,
 * device fingerprint collisions, payment tokens) across flagged return cases
 * for demonstration of enterprise graph community-detection capabilities.
 */

import { AbuseType, FraudRing, FraudRingNode, FraudRingLink } from '../types';

export const FRAUD_RINGS_DATA: FraudRing[] = [
  {
    id: 'ring-luxury-wardrobe',
    name: 'Metropolitan Luxury Wardrobing Syndicate',
    caseCount: 16,
    totalExposure: 16400,
    primaryAbuseType: 'Wardrobing',
    coreLinkage: 'Shared Freight Drop: Suite 402, Secaucus NJ & Coordinated Weekend Returns',
    recommendedAction: 'Bulk Blacklist Shipping Drop Address & Mandate Pre-Return Video Tag Verification',
    nodes: [
      { id: 'node-w1', caseId: 'RET-8819', customerName: 'Victoria S.', abuseType: 'Wardrobing', orderValue: 520, itemCategory: 'Evening Wear', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 200, y: 150, riskScore: 94, linkReason: 'Shared Drop Address' },
      { id: 'node-w2', caseId: 'RET-8824', customerName: 'Camilla D.', abuseType: 'Wardrobing', orderValue: 680, itemCategory: 'Evening Wear', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 230, y: 120, riskScore: 96, linkReason: 'Shared Drop Address' },
      { id: 'node-w3', caseId: 'RET-8831', customerName: 'Julianne B.', abuseType: 'Wardrobing', orderValue: 490, itemCategory: 'Designer Handbags', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 260, y: 160, riskScore: 89, linkReason: 'Shared Drop Address' },
      { id: 'node-w4', caseId: 'RET-8842', customerName: 'Serena M.', abuseType: 'Wardrobing', orderValue: 750, itemCategory: 'Evening Wear', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 220, y: 190, riskScore: 92, linkReason: 'Shared Drop Address' },
      { id: 'node-w5', caseId: 'RET-8855', customerName: 'Giselle F.', abuseType: 'Wardrobing', orderValue: 580, itemCategory: 'Luxury Footwear', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 170, y: 180, riskScore: 88, linkReason: 'Shared Device Token' },
      { id: 'node-w6', caseId: 'RET-8860', customerName: 'Elena K.', abuseType: 'Wardrobing', orderValue: 640, itemCategory: 'Evening Wear', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 180, y: 110, riskScore: 91, linkReason: 'Shared Drop Address' },
      { id: 'node-w7', caseId: 'RET-8871', customerName: 'Vivian T.', abuseType: 'Policy Abuser', orderValue: 390, itemCategory: 'Cocktail Dresses', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 270, y: 100, riskScore: 84, linkReason: 'Device Collision' },
      { id: 'node-w8', caseId: 'RET-8883', customerName: 'Nadia P.', abuseType: 'Wardrobing', orderValue: 820, itemCategory: 'Fine Jewelry', ringId: 'ring-luxury-wardrobe', ringName: 'Luxury Wardrobing Syndicate', x: 140, y: 140, riskScore: 97, linkReason: 'Shared Virtual Card' },
    ],
    links: [
      { source: 'node-w1', target: 'node-w2', linkType: 'shared_shipping_address', sharedValue: 'Secaucus Drop Suite 402' },
      { source: 'node-w1', target: 'node-w3', linkType: 'shared_shipping_address', sharedValue: 'Secaucus Drop Suite 402' },
      { source: 'node-w2', target: 'node-w4', linkType: 'shared_shipping_address', sharedValue: 'Secaucus Drop Suite 402' },
      { source: 'node-w3', target: 'node-w4', linkType: 'depot_drop_pattern', sharedValue: 'Depot Scan Within 24m' },
      { source: 'node-w1', target: 'node-w5', linkType: 'device_ip_collision', sharedValue: 'Device Fingerprint #F991' },
      { source: 'node-w2', target: 'node-w6', linkType: 'shared_shipping_address', sharedValue: 'Secaucus Drop Suite 402' },
      { source: 'node-w6', target: 'node-w7', linkType: 'device_ip_collision', sharedValue: 'Subnet 198.51.100.14' },
      { source: 'node-w5', target: 'node-w8', linkType: 'payment_token_cluster', sharedValue: 'BIN 4147-Token 992' },
    ],
  },
  {
    id: 'ring-empty-box-fraud',
    name: 'Northwest Electronics "Empty-Box" Scheme',
    caseCount: 12,
    totalExposure: 21600,
    primaryAbuseType: 'Fraudulent Return',
    coreLinkage: 'Device Fingerprint Cluster & Carrier Depot Weight Tampering',
    recommendedAction: 'Immediate Law Enforcement Referral & Carrier Custody Scale Audit',
    nodes: [
      { id: 'node-f1', caseId: 'RET-1934', customerName: 'Alex Mercer', abuseType: 'Fraudulent Return', orderValue: 780, itemCategory: 'Consumer Electronics', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 500, y: 140, riskScore: 98, linkReason: 'Device Fingerprint' },
      { id: 'node-f2', caseId: 'RET-1945', customerName: 'Damon Vance', abuseType: 'Fraudulent Return', orderValue: 920, itemCategory: 'Laptops & Tablets', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 540, y: 110, riskScore: 99, linkReason: 'Device Fingerprint' },
      { id: 'node-f3', caseId: 'RET-1952', customerName: 'Tyler Ross', abuseType: 'Fraudulent Return', orderValue: 650, itemCategory: 'Graphics Cards', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 570, y: 160, riskScore: 95, linkReason: 'Carrier Depot Anomaly' },
      { id: 'node-f4', caseId: 'RET-1968', customerName: 'Cole Evans', abuseType: 'Fraudulent Return', orderValue: 840, itemCategory: 'Consumer Electronics', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 520, y: 200, riskScore: 96, linkReason: 'Device Fingerprint' },
      { id: 'node-f5', caseId: 'RET-1979', customerName: 'Brent Hayes', abuseType: 'Fraudulent Return', orderValue: 1100, itemCategory: 'Smartphones', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 460, y: 180, riskScore: 99, linkReason: 'Virtual Card Hash' },
      { id: 'node-f6', caseId: 'RET-1990', customerName: 'Jason Reed', abuseType: 'Policy Abuser', orderValue: 420, itemCategory: 'Electronics Acc.', ringId: 'ring-empty-box-fraud', ringName: 'Electronics Empty-Box Scheme', x: 470, y: 100, riskScore: 82, linkReason: 'Proxy Subnet' },
    ],
    links: [
      { source: 'node-f1', target: 'node-f2', linkType: 'device_ip_collision', sharedValue: 'Browser Canvas Hash #4012' },
      { source: 'node-f1', target: 'node-f3', linkType: 'depot_drop_pattern', sharedValue: 'FedEx Depot Portland #12' },
      { source: 'node-f2', target: 'node-f4', linkType: 'device_ip_collision', sharedValue: 'Browser Canvas Hash #4012' },
      { source: 'node-f4', target: 'node-f5', linkType: 'payment_token_cluster', sharedValue: 'Stripe Token Hash #E89' },
      { source: 'node-f1', target: 'node-f6', linkType: 'device_ip_collision', sharedValue: 'Proxy IP 203.0.113.88' },
    ],
  },
  {
    id: 'ring-bracket-policy',
    name: 'Tri-State Policy Bracket Cycler Cell',
    caseCount: 10,
    totalExposure: 8200,
    primaryAbuseType: 'Policy Abuser',
    coreLinkage: 'Cross-Account Family Return Cycle (Day 29 Policy Window)',
    recommendedAction: 'Restrict Accounts to Store Credit Only & Enforce 14-Day Limit',
    nodes: [
      { id: 'node-p1', caseId: 'RET-7241', customerName: 'Danielle Brooks', abuseType: 'Policy Abuser', orderValue: 310, itemCategory: 'Footwear & Apparel', ringId: 'ring-bracket-policy', ringName: 'Policy Bracket Cycler Cell', x: 340, y: 280, riskScore: 86, linkReason: 'Shared Address' },
      { id: 'node-p2', caseId: 'RET-7249', customerName: 'Rachel Brooks', abuseType: 'Policy Abuser', orderValue: 280, itemCategory: 'Footwear & Apparel', ringId: 'ring-bracket-policy', ringName: 'Policy Bracket Cycler Cell', x: 380, y: 260, riskScore: 84, linkReason: 'Shared Address' },
      { id: 'node-p3', caseId: 'RET-7255', customerName: 'Karen Brooks', abuseType: 'Policy Abuser', orderValue: 350, itemCategory: 'Outerwear', ringId: 'ring-bracket-policy', ringName: 'Policy Bracket Cycler Cell', x: 370, y: 310, riskScore: 89, linkReason: 'Shared Address' },
      { id: 'node-p4', caseId: 'RET-7262', customerName: 'Hannah Meyer', abuseType: 'Policy Abuser', orderValue: 260, itemCategory: 'Footwear', ringId: 'ring-bracket-policy', ringName: 'Policy Bracket Cycler Cell', x: 310, y: 300, riskScore: 81, linkReason: 'Shared Credit Card' },
      { id: 'node-p5', caseId: 'RET-7278', customerName: 'Leah Meyer', abuseType: 'Legitimate', orderValue: 140, itemCategory: 'Apparel', ringId: 'ring-bracket-policy', ringName: 'Policy Bracket Cycler Cell', x: 320, y: 250, riskScore: 42, linkReason: 'Shared Address' },
    ],
    links: [
      { source: 'node-p1', target: 'node-p2', linkType: 'shared_shipping_address', sharedValue: '142 Elmwood Ave, Chicago IL' },
      { source: 'node-p1', target: 'node-p3', linkType: 'shared_shipping_address', sharedValue: '142 Elmwood Ave, Chicago IL' },
      { source: 'node-p2', target: 'node-p4', linkType: 'payment_token_cluster', sharedValue: 'Shared AMEX #0029' },
      { source: 'node-p4', target: 'node-p5', linkType: 'shared_shipping_address', sharedValue: '148 Elmwood Ave, Chicago IL' },
    ],
  },
];

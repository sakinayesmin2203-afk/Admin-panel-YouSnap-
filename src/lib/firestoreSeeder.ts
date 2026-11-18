import { db } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const DEMO_DOC_IDS: Record<string, string[]> = {
  users: ['USR-9021', 'USR-8842', 'USR-6520', 'USR-7619', 'USR-9981'],
  videos: ['VID-001', 'VID-002', 'VID-003', 'VID-S1', 'VID-S2', 'sample_m1', 'sample_m2', 'vid-1', 'vid-2', 'vid-3'],
  live_uploads: ['UPL-001', 'UPL-002', 'UPL-003', 'vid-1', 'vid-2', 'vid-3'],
  monetization_requests: ['REQ-101', 'REQ-102', 'REQ-103'],
  support_tickets: ['TCK-2041', 'TCK-1892'],
  admin_notifications: ['NTF-001', 'NTF-002', 'NTF-003', 'NTF-004']
};

const DEMO_USERNAMES = new Set([
  'sakin_y',
  'john_creator',
  'rahul_official',
  'jane_smith',
  'rahul_vlogs',
  'ananya_comedy',
  'vikram_tech',
  'priya_vlogs',
  'zubin_beats'
]);

const DEMO_EMAILS = new Set([
  'sakin@yousnap.com',
  'john.doe@example.com',
  'john@example.com',
  'rahul.sharma@example.com',
  'rahul.sharma@gmail.com',
  'jane@example.com'
]);

const DEMO_USER_IDS = new Set([
  'USR-9021',
  'USR-8842',
  'USR-6520',
  'USR-7619',
  'USR-9981'
]);

export async function initFirestoreSeedIfNeeded() {
  try {
    // Clear any leftover local demo storage keys without modifying live user data in Firestore
    localStorage.removeItem('yousnap_firestore_seeded_v3');
    localStorage.removeItem('yousnap_firestore_seeded_v2');
    localStorage.removeItem('yousnap_firestore_seeded_v1');
    localStorage.removeItem('yousnap_user_app_notifications');
    localStorage.removeItem('yousnap_support_tickets_v2');
  } catch (e) {
    console.warn('Demo cleanup notice:', e);
  }
}


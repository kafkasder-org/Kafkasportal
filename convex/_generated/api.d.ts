/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from '../agents.js';
import type * as ai_chat from '../ai_chat.js';
import type * as aid_applications from '../aid_applications.js';
import type * as analytics from '../analytics.js';
import type * as audit_logs from '../audit_logs.js';
import type * as auth from '../auth.js';
import type * as bank_accounts from '../bank_accounts.js';
import type * as beneficiaries from '../beneficiaries.js';
import type * as branding from '../branding.js';
import type * as communication from '../communication.js';
import type * as communication_logs from '../communication_logs.js';
import type * as consents from '../consents.js';
import type * as data_import_export from '../data_import_export.js';
import type * as dependents from '../dependents.js';
import type * as documents from '../documents.js';
import type * as donations from '../donations.js';
import type * as errors from '../errors.js';
import type * as finance_records from '../finance_records.js';
import type * as http from '../http.js';
import type * as meeting_action_items from '../meeting_action_items.js';
import type * as meeting_decisions from '../meeting_decisions.js';
import type * as meetings from '../meetings.js';
import type * as messages from '../messages.js';
import type * as monitoring from '../monitoring.js';
import type * as partners from '../partners.js';
import type * as reports from '../reports.js';
import type * as scholarships from '../scholarships.js';
import type * as security from '../security.js';
import type * as security_audit from '../security_audit.js';
import type * as seed from '../seed.js';
import type * as seedThemes from '../seedThemes.js';
import type * as settings from '../settings.js';
import type * as storage from '../storage.js';
import type * as system_settings from '../system_settings.js';
import type * as tasks from '../tasks.js';
import type * as two_factor_auth from '../two_factor_auth.js';
import type * as users from '../users.js';
import type * as workflow_notifications from '../workflow_notifications.js';

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  ai_chat: typeof ai_chat;
  aid_applications: typeof aid_applications;
  analytics: typeof analytics;
  audit_logs: typeof audit_logs;
  auth: typeof auth;
  bank_accounts: typeof bank_accounts;
  beneficiaries: typeof beneficiaries;
  branding: typeof branding;
  communication: typeof communication;
  communication_logs: typeof communication_logs;
  consents: typeof consents;
  data_import_export: typeof data_import_export;
  dependents: typeof dependents;
  documents: typeof documents;
  donations: typeof donations;
  errors: typeof errors;
  finance_records: typeof finance_records;
  http: typeof http;
  meeting_action_items: typeof meeting_action_items;
  meeting_decisions: typeof meeting_decisions;
  meetings: typeof meetings;
  messages: typeof messages;
  monitoring: typeof monitoring;
  partners: typeof partners;
  reports: typeof reports;
  scholarships: typeof scholarships;
  security: typeof security;
  security_audit: typeof security_audit;
  seed: typeof seed;
  seedThemes: typeof seedThemes;
  settings: typeof settings;
  storage: typeof storage;
  system_settings: typeof system_settings;
  tasks: typeof tasks;
  two_factor_auth: typeof two_factor_auth;
  users: typeof users;
  workflow_notifications: typeof workflow_notifications;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;

export declare const components: {
  persistentTextStreaming: {
    lib: {
      addChunk: FunctionReference<
        'mutation',
        'internal',
        { final: boolean; streamId: string; text: string },
        any
      >;
      createStream: FunctionReference<'mutation', 'internal', {}, any>;
      getStreamStatus: FunctionReference<
        'query',
        'internal',
        { streamId: string },
        'pending' | 'streaming' | 'done' | 'error' | 'timeout'
      >;
      getStreamText: FunctionReference<
        'query',
        'internal',
        { streamId: string },
        {
          status: 'pending' | 'streaming' | 'done' | 'error' | 'timeout';
          text: string;
        }
      >;
      setStreamStatus: FunctionReference<
        'mutation',
        'internal',
        {
          status: 'pending' | 'streaming' | 'done' | 'error' | 'timeout';
          streamId: string;
        },
        any
      >;
    };
  };
};

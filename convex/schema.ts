import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  /**
   * @collection users
   * @description Stores user account information for the application.
   */
  users: defineTable({
    /** @type {string} - The full name of the user. */
    name: v.string(),
    /** @type {string} - The user's unique email address. Used for login and communication. */
    email: v.string(),
    /** @type {string} - The role assigned to the user (e.g., 'admin', 'staff', 'volunteer'). */
    role: v.string(),
    /** @type {string[]} - Optional array of specific permissions granted to the user. */
    permissions: v.optional(v.array(v.string())),
    /** @type {string} - The user's phone number. */
    phone: v.optional(v.string()),
    /** @type {string} - URL of the user's avatar image. */
    avatar: v.optional(v.string()),
    /** @type {boolean} - Flag indicating if the user account is active or disabled. */
    isActive: v.boolean(),
    /** @type {string[]} - Optional labels for categorizing or tagging users. */
    labels: v.optional(v.array(v.string())),
    /** @type {string} - ISO 8601 timestamp of when the user account was created. */
    createdAt: v.optional(v.string()),
    /** @type {string} - ISO 8601 timestamp of the user's last login. */
    lastLogin: v.optional(v.string()),
    /** @type {string} - Hashed password for the user account. */
    passwordHash: v.optional(v.string()),
    /** @type {boolean | undefined} - Indicates whether two-factor authentication is enabled. */
    two_factor_enabled: v.optional(v.boolean()),
  })
    .index('by_email', ['email'])
    .index('by_role', ['role'])
    .index('by_is_active', ['isActive'])
    .searchIndex('by_search', {
      searchField: 'name',
      filterFields: ['email', 'phone'],
    }),

  /**
   * @collection beneficiaries
   * @description Stores detailed information about aid recipients (beneficiaries).
   */
  beneficiaries: defineTable({
    /** @type {string} - Full name of the beneficiary. */
    name: v.string(),
    /** @type {string} - Turkish National Identity Number (TC Kimlik No). */
    tc_no: v.string(),
    /** @type {string} - Contact phone number for the beneficiary. */
    phone: v.string(),
    /** @type {string} - Email address of the beneficiary. */
    email: v.optional(v.string()),
    /** @type {string} - Beneficiary's date of birth. */
    birth_date: v.optional(v.string()),
    /** @type {string} - Gender of the beneficiary. */
    gender: v.optional(v.string()),
    /** @type {string} - Nationality of the beneficiary. */
    nationality: v.optional(v.string()),
    /** @type {string} - Religious affiliation, if provided. */
    religion: v.optional(v.string()),
    /** @type {string} - Marital status of the beneficiary. */
    marital_status: v.optional(v.string()),
    /** @type {string} - Full address of the beneficiary. */
    address: v.string(),
    /** @type {string} - City where the beneficiary resides. */
    city: v.string(),
    /** @type {string} - District where the beneficiary resides. */
    district: v.string(),
    /** @type {string} - Neighborhood where the beneficiary resides. */
    neighborhood: v.string(),
    /** @type {number} - Total number of people in the beneficiary's family. */
    family_size: v.number(),
    /** @type {number} - Number of children in the family. */
    children_count: v.optional(v.number()),
    /** @type {number} - Number of orphan children in the family. */
    orphan_children_count: v.optional(v.number()),
    /** @type {number} - Number of elderly individuals in the family. */
    elderly_count: v.optional(v.number()),
    /** @type {number} - Number of disabled individuals in the family. */
    disabled_count: v.optional(v.number()),
    /** @type {string} - General income level of the household (e.g., 'low', 'medium'). */
    income_level: v.optional(v.string()),
    /** @type {string} - Source of the family's income. */
    income_source: v.optional(v.string()),
    /** @type {boolean} - Indicates if the family has significant debt. */
    has_debt: v.optional(v.boolean()),
    /** @type {string} - Type of housing (e.g., 'rent', 'owned'). */
    housing_type: v.optional(v.string()),
    /** @type {boolean} - Indicates if the family owns a vehicle. */
    has_vehicle: v.optional(v.boolean()),
    /** @type {string} - General health status of the beneficiary. */
    health_status: v.optional(v.string()),
    /** @type {boolean} - Indicates if the beneficiary has a chronic illness. */
    has_chronic_illness: v.optional(v.boolean()),
    /** @type {string} - Details about the chronic illness. */
    chronic_illness_detail: v.optional(v.string()),
    /** @type {boolean} - Indicates if the beneficiary has a disability. */
    has_disability: v.optional(v.boolean()),
    /** @type {string} - Details about the disability. */
    disability_detail: v.optional(v.string()),
    /** @type {boolean} - Indicates if the beneficiary has health insurance. */
    has_health_insurance: v.optional(v.boolean()),
    /** @type {string} - Details about any regular medication used. */
    regular_medication: v.optional(v.string()),
    /** @type {string} - Highest level of education completed. */
    education_level: v.optional(v.string()),
    /** @type {string} - Current or last occupation of the beneficiary. */
    occupation: v.optional(v.string()),
    /** @type {string} - Current employment status. */
    employment_status: v.optional(v.string()),
    /** @type {string} - Type of aid requested or received. */
    aid_type: v.optional(v.string()),
    /** @type {number} - Total monetary value of aid received. */
    totalAidAmount: v.optional(v.number()),
    /** @type {string} - Duration for which aid is provided. */
    aid_duration: v.optional(v.string()),
    /** @type {string} - Priority level for aid consideration (e.g., 'high', 'medium', 'low'). */
    priority: v.optional(v.string()),
    /** @type {string} - Name of the person or institution that referred the beneficiary. */
    reference_name: v.optional(v.string()),
    /** @type {string} - Phone number of the reference. */
    reference_phone: v.optional(v.string()),
    /** @type {string} - Relationship of the reference to the beneficiary. */
    reference_relation: v.optional(v.string()),
    /** @type {string} - How the application was received (e.g., 'web', 'field_visit'). */
    application_source: v.optional(v.string()),
    /** @type {string} - General notes about the beneficiary. */
    notes: v.optional(v.string()),
    /** @type {boolean} - Indicates if the beneficiary has received aid from this organization before. */
    previous_aid: v.optional(v.boolean()),
    /** @type {boolean} - Indicates if the beneficiary is receiving aid from other organizations. */
    other_organization_aid: v.optional(v.boolean()),
    /** @type {boolean} - Flag for emergency situations requiring immediate attention. */
    emergency: v.optional(v.boolean()),
    /** @type {string} - Preferred method of contact (e.g., 'phone', 'email'). */
    contact_preference: v.optional(v.string()),
    /** @type {'TASLAK'|'AKTIF'|'PASIF'|'SILINDI'} - The current status of the beneficiary record. */
    status: v.union(
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
    /** @type {'pending'|'approved'|'rejected'} - Approval status for the beneficiary's application. */
    approval_status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))
    ),
    /** @type {string} - ID of the user who approved the application. */
    approved_by: v.optional(v.string()),
    /** @type {string} - ISO 8601 timestamp of when the application was approved. */
    approved_at: v.optional(v.string()),
  })
    .index('by_tc_no', ['tc_no'])
    .index('by_status', ['status'])
    .index('by_city', ['city'])
    .searchIndex('by_search', {
      searchField: 'name',
      filterFields: ['tc_no', 'phone', 'email'],
    }),

  /**
   * @collection donations
   * @description Records all incoming donations, including standard and Kumbara (money box) donations.
   */
  donations: defineTable({
    /** @type {string} - The name of the donor. */
    donor_name: v.string(),
    /** @type {string} - The donor's phone number. */
    donor_phone: v.string(),
    /** @type {string} - The donor's email address. */
    donor_email: v.optional(v.string()),
    /** @type {number} - The amount of money donated. */
    amount: v.number(),
    /** @type {'TRY'|'USD'|'EUR'} - The currency of the donation. */
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    /** @type {string} - The type of donation (e.g., 'zakat', 'fitra', 'general'). */
    donation_type: v.string(),
    /** @type {string} - The method of payment (e.g., 'credit_card', 'bank_transfer'). */
    payment_method: v.string(),
    /** @type {string} - The specific purpose or campaign for the donation. */
    donation_purpose: v.string(),
    /** @type {string} - Additional notes about the donation. */
    notes: v.optional(v.string()),
    /** @type {string} - The unique receipt number for the transaction. */
    receipt_number: v.string(),
    /** @type {string} - The ID of the stored receipt file. */
    receipt_file_id: v.optional(v.string()),
    /** @type {'pending'|'completed'|'cancelled'} - The status of the donation transaction. */
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('cancelled')),
    /** @type {boolean} - Flag indicating if this donation is from a Kumbara (money box). */
    is_kumbara: v.optional(v.boolean()), // Whether this donation came from a kumbara
    /** @type {string} - The location where the Kumbara was placed or collected from. */
    kumbara_location: v.optional(v.string()), // Location where kumbara was placed/collected
    /** @type {string} - The date the Kumbara was collected. */
    collection_date: v.optional(v.string()), // Date when kumbara was collected
    /** @type {string} - The institution or place where the Kumbara is located. */
    kumbara_institution: v.optional(v.string()), // Institution/place where kumbara is located
    /** @type {object} - GPS coordinates of the Kumbara location. */
    location_coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    /** @type {string} - The address of the Kumbara location. */
    location_address: v.optional(v.string()),
    /** @type {object[]} - An array of GPS points defining the collection route. */
    route_points: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
    /** @type {number} - The total distance of the collection route in meters. */
    route_distance: v.optional(v.number()),
    /** @type {number} - The estimated duration of the collection route in seconds. */
    route_duration: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_donor_email', ['donor_email'])
    .index('by_receipt_number', ['receipt_number'])
    .index('by_is_kumbara', ['is_kumbara'])
    .index('by_kumbara_location', ['kumbara_location']),

  /**
   * @collection tasks
   * @description Manages tasks assigned to users within the system.
   */
  tasks: defineTable({
    /** @type {string} - The title of the task. */
    title: v.string(),
    /** @type {string} - A detailed description of the task. */
    description: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user this task is assigned to. */
    assigned_to: v.optional(v.id('users')),
    /** @type {Id<'users'>} - The ID of the user who created the task. */
    created_by: v.id('users'),
    /** @type {'low'|'normal'|'high'|'urgent'} - The priority level of the task. */
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    /** @type {'pending'|'in_progress'|'completed'|'cancelled'} - The current status of the task. */
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    /** @type {string} - The date when the task is due. */
    due_date: v.optional(v.string()),
    /** @type {string} - The date when the task was completed. */
    completed_at: v.optional(v.string()),
    /** @type {string} - The category of the task (e.g., 'field_visit', 'documentation'). */
    category: v.optional(v.string()),
    /** @type {string[]} - Tags for organizing and filtering tasks. */
    tags: v.optional(v.array(v.string())),
    /** @type {boolean} - Flag indicating if the assigned user has read the task. */
    is_read: v.boolean(),
  })
    .index('by_assigned_to', ['assigned_to'])
    .index('by_status', ['status'])
    .index('by_created_by', ['created_by']),

  /**
   * @collection meetings
   * @description Stores information about scheduled meetings.
   */
  meetings: defineTable({
    /** @type {string} - The title or subject of the meeting. */
    title: v.string(),
    /** @type {string} - A detailed description or agenda for the meeting. */
    description: v.optional(v.string()),
    /** @type {string} - The date and time of the meeting. */
    meeting_date: v.string(),
    /** @type {string} - The location of the meeting (physical or virtual). */
    location: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user who organized the meeting. */
    organizer: v.id('users'),
    /** @type {Id<'users'>[]} - An array of user IDs for participants. */
    participants: v.array(v.id('users')),
    /** @type {'scheduled'|'ongoing'|'completed'|'cancelled'} - The current status of the meeting. */
    status: v.union(
      v.literal('scheduled'),
      v.literal('ongoing'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    /** @type {'general'|'committee'|'board'|'other'} - The type of meeting. */
    meeting_type: v.union(
      v.literal('general'),
      v.literal('committee'),
      v.literal('board'),
      v.literal('other')
    ),
    /** @type {string} - The formal agenda for the meeting. */
    agenda: v.optional(v.string()),
    /** @type {string} - General notes or minutes from the meeting. */
    notes: v.optional(v.string()),
  })
    .index('by_organizer', ['organizer'])
    .index('by_status', ['status'])
    .index('by_meeting_date', ['meeting_date']),

  /**
   * @collection meeting_decisions
   * @description Records decisions made during meetings.
   */
  meeting_decisions: defineTable({
    /** @type {Id<'meetings'>} - The ID of the meeting where the decision was made. */
    meeting_id: v.id('meetings'),
    /** @type {string} - The title of the decision. */
    title: v.string(),
    /** @type {string} - A summary of the decision. */
    summary: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user responsible for owning/implementing the decision. */
    owner: v.optional(v.id('users')),
    /** @type {Id<'users'>} - The ID of the user who recorded the decision. */
    created_by: v.id('users'),
    /** @type {string} - The timestamp when the decision was recorded. */
    created_at: v.string(),
    /** @type {'acik'|'devam'|'kapatildi'} - The status of the decision (Open, In Progress, Closed). */
    status: v.union(v.literal('acik'), v.literal('devam'), v.literal('kapatildi')),
    /** @type {string[]} - Tags for categorizing the decision. */
    tags: v.optional(v.array(v.string())),
    /** @type {string} - The due date for the decision's implementation. */
    due_date: v.optional(v.string()),
  })
    .index('by_meeting', ['meeting_id'])
    .index('by_owner', ['owner'])
    .index('by_status', ['status']),

  /**
   * @collection meeting_action_items
   * @description Tracks specific action items arising from meetings or decisions.
   */
  meeting_action_items: defineTable({
    /** @type {Id<'meetings'>} - The ID of the related meeting. */
    meeting_id: v.id('meetings'),
    /** @type {Id<'meeting_decisions'>} - The ID of the decision this action item belongs to. */
    decision_id: v.optional(v.id('meeting_decisions')),
    /** @type {string} - The title of the action item. */
    title: v.string(),
    /** @type {string} - A detailed description of the action item. */
    description: v.optional(v.string()),
    /** @type {Id<'users'>} - The user assigned to complete the action item. */
    assigned_to: v.id('users'),
    /** @type {Id<'users'>} - The user who created the action item. */
    created_by: v.id('users'),
    /** @type {string} - The timestamp when the action item was created. */
    created_at: v.string(),
    /** @type {'beklemede'|'devam'|'hazir'|'iptal'} - The status of the action item (Pending, In Progress, Ready, Cancelled). */
    status: v.union(
      v.literal('beklemede'),
      v.literal('devam'),
      v.literal('hazir'),
      v.literal('iptal')
    ),
    /** @type {string} - The due date for the action item. */
    due_date: v.optional(v.string()),
    /** @type {string} - The timestamp when the action item was completed. */
    completed_at: v.optional(v.string()),
    /** @type {object[]} - A history of status changes for the action item. */
    status_history: v.optional(
      v.array(
        v.object({
          status: v.union(
            v.literal('beklemede'),
            v.literal('devam'),
            v.literal('hazir'),
            v.literal('iptal')
          ),
          changed_at: v.string(),
          changed_by: v.id('users'),
          note: v.optional(v.string()),
        })
      )
    ),
    /** @type {string[]} - Additional notes related to the action item. */
    notes: v.optional(v.array(v.string())),
    /** @type {string} - The scheduled time for a reminder notification. */
    reminder_scheduled_at: v.optional(v.string()),
  })
    .index('by_meeting', ['meeting_id'])
    .index('by_assigned_to', ['assigned_to'])
    .index('by_status', ['status']),

  /**
   * @collection workflow_notifications
   * @description Stores notifications generated by system workflows to be sent to users.
   */
  workflow_notifications: defineTable({
    /** @type {Id<'users'>} - The ID of the user who will receive the notification. */
    recipient: v.id('users'),
    /** @type {Id<'users'>} - The ID of the user who triggered the notification, if applicable. */
    triggered_by: v.optional(v.id('users')),
    /** @type {'meeting'|'gorev'|'rapor'|'hatirlatma'} - The category of the notification (Meeting, Task, Report, Reminder). */
    category: v.union(
      v.literal('meeting'),
      v.literal('gorev'),
      v.literal('rapor'),
      v.literal('hatirlatma')
    ),
    /** @type {string} - The title of the notification. */
    title: v.string(),
    /** @type {string} - The main content/body of the notification. */
    body: v.optional(v.string()),
    /** @type {'beklemede'|'gonderildi'|'okundu'} - The status of the notification (Pending, Sent, Read). */
    status: v.union(v.literal('beklemede'), v.literal('gonderildi'), v.literal('okundu')),
    /** @type {string} - The timestamp when the notification was created. */
    created_at: v.string(),
    /** @type {string} - The timestamp when the notification was sent. */
    sent_at: v.optional(v.string()),
    /** @type {string} - The timestamp when the user read the notification. */
    read_at: v.optional(v.string()),
    /** @type {object} - A reference to the related entity (e.g., a specific meeting or task). */
    reference: v.optional(
      v.object({
        type: v.union(
          v.literal('meeting_action_item'),
          v.literal('meeting'),
          v.literal('meeting_decision')
        ),
        id: v.string(),
      })
    ),
    /** @type {any} - Any additional metadata associated with the notification. */
    metadata: v.optional(v.any()),
  })
    .index('by_recipient', ['recipient'])
    .index('by_status', ['status'])
    .index('by_category', ['category']),

  /**
   * @collection messages
   * @description Logs messages (SMS, Email, Internal) sent from the system.
   */
  messages: defineTable({
    /** @type {'sms'|'email'|'internal'} - The type of the message. */
    message_type: v.union(v.literal('sms'), v.literal('email'), v.literal('internal')),
    /** @type {Id<'users'>} - The ID of the user who sent the message. */
    sender: v.id('users'),
    /** @type {Id<'users'>[]} - An array of user IDs for the recipients. */
    recipients: v.array(v.id('users')),
    /** @type {string} - The subject line of the message (especially for emails). */
    subject: v.optional(v.string()),
    /** @type {string} - The content of the message. */
    content: v.string(),
    /** @type {string} - The timestamp when the message was sent. */
    sent_at: v.optional(v.string()),
    /** @type {'draft'|'sent'|'failed'} - The status of the message. */
    status: v.union(v.literal('draft'), v.literal('sent'), v.literal('failed')),
    /** @type {boolean} - Flag indicating if this was a bulk message sent to multiple recipients. */
    is_bulk: v.boolean(),
    /** @type {string} - The ID of the template used for this message, if any. */
    template_id: v.optional(v.string()),
  })
    .index('by_sender', ['sender'])
    .index('by_status', ['status'])
    .searchIndex('by_search', {
      searchField: 'subject',
      filterFields: ['content'],
    }),

  /**
   * @collection parameters
   * @description Stores system parameters and lookup values, often used for dropdowns and configurations.
   */
  parameters: defineTable({
    /** @type {string} - The category of the parameter (e.g., 'countries', 'cities', 'donation_types'). */
    category: v.string(),
    /** @type {string} - The Turkish name/label for the parameter. */
    name_tr: v.string(),
    /** @type {string} - The English name/label for the parameter. */
    name_en: v.optional(v.string()),
    /** @type {string} - The Arabic name/label for the parameter. */
    name_ar: v.optional(v.string()),
    /** @type {string} - The Russian name/label for the parameter. */
    name_ru: v.optional(v.string()),
    /** @type {string} - The French name/label for the parameter. */
    name_fr: v.optional(v.string()),
    /** @type {string} - The actual value stored for the parameter. */
    value: v.string(),
    /** @type {number} - The sort order for displaying the parameter. */
    order: v.number(),
    /** @type {boolean} - Flag indicating if the parameter is active and should be used. */
    is_active: v.boolean(),
  })
    .index('by_category', ['category'])
    .index('by_value', ['value']),

  /**
   * @collection aid_applications
   * @description Tracks applications for aid from beneficiaries or organizations.
   */
  aid_applications: defineTable({
    /** @type {string} - The date the application was submitted. */
    application_date: v.string(),
    /** @type {'person'|'organization'|'partner'} - The type of applicant. */
    applicant_type: v.union(v.literal('person'), v.literal('organization'), v.literal('partner')),
    /** @type {string} - The name of the applicant. */
    applicant_name: v.string(),
    /** @type {Id<'beneficiaries'>} - The ID of the beneficiary this application is for. */
    beneficiary_id: v.optional(v.id('beneficiaries')),
    /** @type {number} - The amount for a one-time aid request. */
    one_time_aid: v.optional(v.number()),
    /** @type {number} - The amount for a regular financial aid request. */
    regular_financial_aid: v.optional(v.number()),
    /** @type {number} - The value of regular food aid requested. */
    regular_food_aid: v.optional(v.number()),
    /** @type {number} - The value of in-kind (non-monetary) aid requested. */
    in_kind_aid: v.optional(v.number()),
    /** @type {number} - The value of service referrals requested. */
    service_referral: v.optional(v.number()),
    /** @type {'draft'|'under_review'|'approved'|'ongoing'|'completed'} - The current stage of the application process. */
    stage: v.union(
      v.literal('draft'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('ongoing'),
      v.literal('completed')
    ),
    /** @type {'open'|'closed'} - The overall status of the application. */
    status: v.union(v.literal('open'), v.literal('closed')),
    /** @type {string} - A description of the aid request. */
    description: v.optional(v.string()),
    /** @type {string} - Additional notes about the application. */
    notes: v.optional(v.string()),
    /** @type {'low'|'normal'|'high'|'urgent'} - The priority level of the application. */
    priority: v.optional(
      v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent'))
    ),
    /** @type {Id<'users'>} - The ID of the user who processed the application. */
    processed_by: v.optional(v.id('users')),
    /** @type {string} - The timestamp when the application was processed. */
    processed_at: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user who approved the application. */
    approved_by: v.optional(v.id('users')),
    /** @type {string} - The timestamp when the application was approved. */
    approved_at: v.optional(v.string()),
    /** @type {string} - The timestamp when the aid was completed. */
    completed_at: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_stage', ['stage'])
    .index('by_status', ['status']),

  /**
   * @collection finance_records
   * @description Logs all financial transactions, both income and expenses.
   */
  finance_records: defineTable({
    /** @type {'income'|'expense'} - The type of financial record. */
    record_type: v.union(v.literal('income'), v.literal('expense')),
    /** @type {string} - The category of the income or expense (e.g., 'donation', 'salary', 'rent'). */
    category: v.string(),
    /** @type {number} - The amount of the transaction. */
    amount: v.number(),
    /** @type {'TRY'|'USD'|'EUR'} - The currency of the transaction. */
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    /** @type {string} - A description of the transaction. */
    description: v.string(),
    /** @type {string} - The date of the transaction. */
    transaction_date: v.string(),
    /** @type {string} - The payment method used. */
    payment_method: v.optional(v.string()),
    /** @type {string} - The receipt number associated with the transaction. */
    receipt_number: v.optional(v.string()),
    /** @type {string} - The ID of the stored receipt file. */
    receipt_file_id: v.optional(v.string()),
    /** @type {string} - A reference to a related entity (e.g., a project or event). */
    related_to: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user who created the record. */
    created_by: v.id('users'),
    /** @type {Id<'users'>} - The ID of the user who approved the record. */
    approved_by: v.optional(v.id('users')),
    /** @type {'pending'|'approved'|'rejected'} - The status of the financial record. */
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
  })
    .index('by_record_type', ['record_type'])
    .index('by_status', ['status'])
    .index('by_created_by', ['created_by']),

  /**
   * @collection files
   * @description Stores metadata for files uploaded to Convex file storage.
   */
  files: defineTable({
    /** @type {string} - The name of the uploaded file. */
    fileName: v.string(),
    /** @type {number} - The size of the file in bytes. */
    fileSize: v.number(),
    /** @type {string} - The MIME type of the file. */
    fileType: v.string(),
    /** @type {string} - The storage bucket where the file is stored. */
    bucket: v.string(),
    /** @type {Id<'_storage'>} - The ID of the file in Convex's internal file storage. */
    storageId: v.id('_storage'), // Convex fileStorage ID
    /** @type {Id<'users'>} - The ID of the user who uploaded the file. */
    uploadedBy: v.optional(v.id('users')),
    /** @type {string} - The timestamp when the file was uploaded. */
    uploadedAt: v.string(),
    /** @type {number} - The current version number of the document. */
    version: v.optional(v.number()),
    /** @type {string | undefined} - Optional description for the document. */
    description: v.optional(v.string()),
    /** @type {string | undefined} - Optional category for categorizing documents. */
    category: v.optional(v.string()),
    /** @type {Array<string> | undefined} - Tag list for quick filtering. */
    tags: v.optional(v.array(v.string())),
    /** @type {"public" | "private" | "restricted" | undefined} - Document visibility level. */
    accessLevel: v.optional(
      v.union(v.literal('public'), v.literal('private'), v.literal('restricted'))
    ),
    /** @type {Array<Id<'users'>> | undefined} - Users with whom the document is shared. */
    sharedWith: v.optional(v.array(v.id('users'))),
    /** @type {Id<'beneficiaries'>} - A link to a beneficiary if the file is a document related to them. */
    beneficiary_id: v.optional(v.id('beneficiaries')), // Link to beneficiary for documents
    /** @type {string} - The type of document (e.g., 'identity', 'photo', 'other'). */
    document_type: v.optional(v.string()), // Type: 'identity', 'photo', 'other', etc.
  })
    .index('by_storage_id', ['storageId'])
    .index('by_bucket', ['bucket'])
    .index('by_uploaded_by', ['uploadedBy'])
    .index('by_beneficiary', ['beneficiary_id']),

  /**
   * @collection document_versions
   * @description Stores historical versions of documents for audit and rollback.
   */
  document_versions: defineTable({
    /** @type {Id<'files'>} - Reference to the original document. */
    document_id: v.id('files'),
    /** @type {number} - The version number associated with the document. */
    version_number: v.number(),
    /** @type {Id<'_storage'>} - Storage identifier for the specific version. */
    storage_id: v.id('_storage'),
    /** @type {string} - File name snapshot for this version. */
    file_name: v.string(),
    /** @type {number} - File size snapshot for this version. */
    file_size: v.number(),
    /** @type {string} - MIME type snapshot for this version. */
    file_type: v.string(),
    /** @type {string | undefined} - Optional notes describing the version. */
    version_notes: v.optional(v.string()),
    /** @type {Id<'users'> | undefined} - User who created this version. */
    created_by: v.optional(v.id('users')),
    /** @type {string} - Timestamp when this version was created. */
    created_at: v.string(),
  }).index('by_document', ['document_id']),

  /**
   * @collection report_configs
   * @description Stores saved report configurations and schedules.
   */
  report_configs: defineTable({
    /** @type {string} - Human readable name for the report configuration. */
    name: v.string(),
    /** @type {string} - The type of report this configuration generates. */
    report_type: v.string(),
    /** @type {any} - Serialized filters applied when generating the report. */
    filters: v.any(),
    /** @type {{frequency: 'daily' | 'weekly' | 'monthly', recipients: Id<'users'>[]}} - Optional scheduling settings. */
    schedule: v.optional(
      v.object({
        frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
        recipients: v.array(v.id('users')),
      })
    ),
    /** @type {Id<'users'>} - User who created the configuration. */
    created_by: v.id('users'),
    /** @type {string} - Creation timestamp. */
    created_at: v.string(),
    /** @type {boolean} - Whether the configuration is currently active. */
    is_active: v.boolean(),
  })
    .index('by_created_by', ['created_by'])
    .index('by_active', ['is_active']),

  /**
   * @collection security_events
   * @description Logs security-related activities for auditing purposes.
   */
  security_events: defineTable({
    /** @type {'login_attempt'|'login_success'|'login_failure'|'logout'|'permission_denied'|'suspicious_activity'|'password_change'|'2fa_enabled'|'2fa_disabled'|'data_access'|'data_modification'} */
    event_type: v.string(),
    /** @type {Id<'users'> | undefined} - User associated with the event, if any. */
    user_id: v.optional(v.id('users')),
    /** @type {string | undefined} - Source IP address. */
    ip_address: v.optional(v.string()),
    /** @type {string | undefined} - User agent string. */
    user_agent: v.optional(v.string()),
    /** @type {any} - Additional contextual details. */
    details: v.optional(v.any()),
    /** @type {'low'|'medium'|'high'|'critical'} - Severity level. */
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    /** @type {string} - ISO timestamp when the event occurred. */
    occurred_at: v.string(),
    /** @type {boolean} - Whether the event has been reviewed. */
    reviewed: v.boolean(),
  })
    .index('by_user', ['user_id'])
    .index('by_occurred_at', ['occurred_at'])
    .index('by_event_type', ['event_type']),

  /**
   * @collection user_sessions
   * @description Tracks active user sessions for security monitoring.
   */
  user_sessions: defineTable({
    /** @type {Id<'users'>} - User owning the session. */
    user_id: v.id('users'),
    /** @type {string | undefined} - Device information summary. */
    device_info: v.optional(v.string()),
    /** @type {string | undefined} - IP address associated with the session. */
    ip_address: v.optional(v.string()),
    /** @type {string | undefined} - User agent string. */
    user_agent: v.optional(v.string()),
    /** @type {boolean} - Whether the session is currently active. */
    is_active: v.boolean(),
    /** @type {string} - Timestamp of the last activity. */
    last_activity: v.string(),
    /** @type {string} - Timestamp when the session was created. */
    created_at: v.string(),
    /** @type {string | undefined} - Timestamp when the session was revoked. */
    revoked_at: v.optional(v.string()),
    /** @type {string | undefined} - Reason for revocation. */
    revocation_reason: v.optional(v.string()),
  })
    .index('by_user', ['user_id'])
    .index('by_active', ['is_active']),

  /**
   * @collection rate_limit_log
   * @description Stores rate limit attempts to detect abusive behavior.
   */
  rate_limit_log: defineTable({
    /** @type {string} - Identifier for the rate limit (IP or user). */
    identifier: v.string(),
    /** @type {string} - Action being rate limited. */
    action: v.string(),
    /** @type {string} - Timestamp for when the attempt occurred. */
    timestamp: v.string(),
  }).index('by_identifier_action', ['identifier', 'action', 'timestamp']),

  /**
   * @collection two_factor_settings
   * @description Stores 2FA configuration and backup codes for users.
   */
  two_factor_settings: defineTable({
    /** @type {Id<'users'>} - User that owns the 2FA settings. */
    user_id: v.id('users'),
    /** @type {string} - Encrypted shared secret for TOTP. */
    secret: v.string(),
    /** @type {Array<{code: string; used: boolean; used_at?: string}>} - Backup codes and usage state. */
    backup_codes: v.array(
      v.object({
        code: v.string(),
        used: v.boolean(),
        used_at: v.optional(v.string()),
      })
    ),
    /** @type {boolean} - Whether 2FA is currently enabled. */
    enabled: v.boolean(),
    /** @type {string} - Timestamp when 2FA was enabled. */
    enabled_at: v.string(),
    /** @type {string | undefined} - Timestamp when 2FA was disabled. */
    disabled_at: v.optional(v.string()),
    /** @type {string | undefined} - Timestamp of the last successful verification. */
    last_verified: v.optional(v.string()),
  }).index('by_user', ['user_id']),

  /**
   * @collection trusted_devices
   * @description Keeps track of trusted devices for bypassing 2FA prompts.
   */
  trusted_devices: defineTable({
    /** @type {Id<'users'>} - Owner of the trusted device. */
    user_id: v.id('users'),
    /** @type {string} - Unique fingerprint representing the device. */
    device_fingerprint: v.string(),
    /** @type {string | undefined} - Human-readable device name. */
    device_name: v.optional(v.string()),
    /** @type {string} - Timestamp when the device was added. */
    added_at: v.string(),
    /** @type {string | undefined} - Timestamp when the device was last used. */
    last_used: v.optional(v.string()),
    /** @type {boolean} - Whether the device is currently trusted. */
    is_active: v.boolean(),
    /** @type {string | undefined} - Timestamp when the device was removed from trust. */
    removed_at: v.optional(v.string()),
  })
    .index('by_user', ['user_id'])
    .index('by_fingerprint', ['device_fingerprint']),

  /**
   * @collection partners
   * @description Manages information about partner organizations, individuals, and sponsors.
   */
  partners: defineTable({
    /** @type {string} - The name of the partner. */
    name: v.string(),
    /** @type {'organization'|'individual'|'sponsor'} - The type of the partner. */
    type: v.union(v.literal('organization'), v.literal('individual'), v.literal('sponsor')),
    /** @type {string} - The primary contact person at the partner organization. */
    contact_person: v.optional(v.string()),
    /** @type {string} - The partner's email address. */
    email: v.optional(v.string()),
    /** @type {string} - The partner's phone number. */
    phone: v.optional(v.string()),
    /** @type {string} - The partner's physical address. */
    address: v.optional(v.string()),
    /** @type {string} - The partner's website URL. */
    website: v.optional(v.string()),
    /** @type {string} - The partner's tax identification number. */
    tax_number: v.optional(v.string()),
    /** @type {'donor'|'supplier'|'volunteer'|'sponsor'|'service_provider'} - The nature of the partnership. */
    partnership_type: v.union(
      v.literal('donor'),
      v.literal('supplier'),
      v.literal('volunteer'),
      v.literal('sponsor'),
      v.literal('service_provider')
    ),
    /** @type {string} - The date when the collaboration with the partner started. */
    collaboration_start_date: v.optional(v.string()),
    /** @type {string} - The date when the collaboration with the partner ended. */
    collaboration_end_date: v.optional(v.string()),
    /** @type {string} - Additional notes about the partner. */
    notes: v.optional(v.string()),
    /** @type {'active'|'inactive'|'pending'} - The current status of the partnership. */
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('pending')),
    /** @type {number} - The total monetary value of contributions from the partner. */
    total_contribution: v.optional(v.number()),
    /** @type {number} - The total number of contributions made by the partner. */
    contribution_count: v.optional(v.number()),
    /** @type {string} - URL for the partner's logo. */
    logo_url: v.optional(v.string()),
  })
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_partnership_type', ['partnership_type'])
    .index('by_name', ['name'])
    .searchIndex('by_search', {
      searchField: 'name',
      filterFields: ['contact_person', 'email'],
    }),

  /**
   * @collection consents
   * @description Stores consent declarations (Rıza Beyanları) from beneficiaries.
   */
  consents: defineTable({
    /** @type {Id<'beneficiaries'>} - The ID of the beneficiary who gave the consent. */
    beneficiary_id: v.id('beneficiaries'),
    /** @type {string} - The type of consent given (e.g., 'data_processing', 'photo_usage'). */
    consent_type: v.string(), // 'data_processing', 'photo_usage', 'communication', etc.
    /** @type {string} - The full text of the consent that was signed. */
    consent_text: v.string(),
    /** @type {'active'|'revoked'|'expired'} - The current status of the consent. */
    status: v.union(v.literal('active'), v.literal('revoked'), v.literal('expired')),
    /** @type {string} - The timestamp when the consent was signed. */
    signed_at: v.string(),
    /** @type {string} - The name of the person who signed the consent form. */
    signed_by: v.optional(v.string()), // Person who signed
    /** @type {string} - The timestamp when the consent expires. */
    expires_at: v.optional(v.string()),
    /** @type {Id<'users'>} - The ID of the user who recorded the consent. */
    created_by: v.optional(v.id('users')),
    /** @type {string} - Additional notes about the consent. */
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_status', ['status']),

  /**
   * @collection bank_accounts
   * @description Stores bank account information for beneficiaries.
   */
  bank_accounts: defineTable({
    /** @type {Id<'beneficiaries'>} - The ID of the beneficiary who owns the bank account. */
    beneficiary_id: v.id('beneficiaries'),
    /** @type {string} - The name of the bank. */
    bank_name: v.string(),
    /** @type {string} - The name of the account holder. */
    account_holder: v.string(),
    /** @type {string} - The bank account number. */
    account_number: v.string(),
    /** @type {string} - The International Bank Account Number (IBAN). */
    iban: v.optional(v.string()),
    /** @type {string} - The name of the bank branch. */
    branch_name: v.optional(v.string()),
    /** @type {string} - The code of the bank branch. */
    branch_code: v.optional(v.string()),
    /** @type {'checking'|'savings'|'other'} - The type of the bank account. */
    account_type: v.union(v.literal('checking'), v.literal('savings'), v.literal('other')),
    /** @type {'TRY'|'USD'|'EUR'} - The currency of the bank account. */
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    /** @type {boolean} - Flag indicating if this is the primary bank account for the beneficiary. */
    is_primary: v.optional(v.boolean()),
    /** @type {'active'|'inactive'|'closed'} - The status of the bank account record. */
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('closed')),
    /** @type {string} - Additional notes about the bank account. */
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_status', ['status']),

  /**
   * @collection dependents
   * @description Stores information about people who are dependent on a beneficiary.
   */
  dependents: defineTable({
    /** @type {Id<'beneficiaries'>} - The ID of the beneficiary responsible for this dependent. */
    beneficiary_id: v.id('beneficiaries'), // Who is responsible for this dependent
    /** @type {string} - The full name of the dependent. */
    name: v.string(),
    /** @type {string} - The dependent's relationship to the beneficiary (e.g., 'spouse', 'child'). */
    relationship: v.string(), // 'spouse', 'child', 'parent', 'sibling', 'other'
    /** @type {string} - The dependent's date of birth. */
    birth_date: v.optional(v.string()),
    /** @type {string} - The gender of the dependent. */
    gender: v.optional(v.string()),
    /** @type {string} - The Turkish National Identity Number (TC Kimlik No) of the dependent. */
    tc_no: v.optional(v.string()),
    /** @type {string} - The dependent's phone number. */
    phone: v.optional(v.string()),
    /** @type {string} - The highest education level completed by the dependent. */
    education_level: v.optional(v.string()),
    /** @type {string} - The occupation of the dependent. */
    occupation: v.optional(v.string()),
    /** @type {string} - The general health status of the dependent. */
    health_status: v.optional(v.string()),
    /** @type {boolean} - Flag indicating if the dependent has a disability. */
    has_disability: v.optional(v.boolean()),
    /** @type {string} - Details about the dependent's disability. */
    disability_detail: v.optional(v.string()),
    /** @type {number} - The monthly income of the dependent, if any. */
    monthly_income: v.optional(v.number()),
    /** @type {string} - Additional notes about the dependent. */
    notes: v.optional(v.string()),
  })
    .index('by_beneficiary', ['beneficiary_id'])
    .index('by_relationship', ['relationship']),

  /**
   * @collection system_settings
   * @description Stores system-wide settings and configurations.
   */
  system_settings: defineTable({
    /** @type {string} - The category of the setting (e.g., 'organization', 'security'). */
    category: v.string(), // 'organization', 'email', 'notifications', 'system', 'security', 'appearance', 'integrations', 'reports'
    /** @type {string} - The unique key for the setting (e.g., 'org_name', 'smtp_host'). */
    key: v.string(), // Unique key for the setting (e.g., 'org_name', 'smtp_host')
    /** @type {any} - The value of the setting, can be of any type. */
    value: v.any(), // Flexible value type (string, number, boolean, object)
    /** @type {string} - A human-readable description of the setting. */
    description: v.optional(v.string()), // Human-readable description
    /** @type {'string'|'number'|'boolean'|'object'|'array'} - The data type of the setting's value. */
    data_type: v.union(
      v.literal('string'),
      v.literal('number'),
      v.literal('boolean'),
      v.literal('object'),
      v.literal('array')
    ),
    /** @type {boolean} - Flag indicating if the setting contains sensitive data that should be masked or encrypted. */
    is_sensitive: v.optional(v.boolean()), // For sensitive data like passwords
    /** @type {Id<'users'>} - The ID of the user who last updated the setting. */
    updated_by: v.optional(v.id('users')),
    /** @type {string} - The timestamp when the setting was last updated. */
    updated_at: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_key', ['key'])
    .index('by_category_key', ['category', 'key']),

  /**
   * @collection scholarships
   * @description Defines available scholarship programs.
   */
  scholarships: defineTable({
    /** @type {string} - The title of the scholarship program. */
    title: v.string(), // Burs programı adı
    /** @type {string} - A detailed description of the scholarship program. */
    description: v.optional(v.string()), // Program açıklaması
    /** @type {number} - The monetary amount of the scholarship. */
    amount: v.number(), // Burs miktarı
    /** @type {'TRY'|'USD'|'EUR'} - The currency of the scholarship amount. */
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    /** @type {number} - The duration of the scholarship in months. */
    duration_months: v.optional(v.number()), // Burs süresi (ay)
    /** @type {string} - The category of the scholarship (e.g., 'academic', 'need_based'). */
    category: v.string(), // 'academic', 'sports', 'arts', 'need_based', 'orphan', 'other'
    /** @type {string} - The eligibility criteria for applicants. */
    eligibility_criteria: v.optional(v.string()), // Uygunluk kriterleri
    /** @type {string[]} - A list of required documents for the application. */
    requirements: v.optional(v.array(v.string())), // Gerekli belgeler
    /** @type {string} - The start date for accepting applications. */
    application_start_date: v.string(), // Başvuru başlangıç tarihi
    /** @type {string} - The end date for accepting applications. */
    application_end_date: v.string(), // Başvuru bitiş tarihi
    /** @type {string} - The academic year the scholarship applies to. */
    academic_year: v.optional(v.string()), // Akademik yıl
    /** @type {number} - The maximum number of recipients for this scholarship. */
    max_recipients: v.optional(v.number()), // Maksimum alıcı sayısı
    /** @type {boolean} - Flag indicating if the scholarship program is currently active. */
    is_active: v.boolean(), // Program aktif mi?
    /** @type {Id<'users'>} - The ID of the user who created the scholarship program. */
    created_by: v.id('users'),
    /** @type {string} - The timestamp when the scholarship program was created. */
    created_at: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_is_active', ['is_active'])
    .index('by_application_dates', ['application_start_date', 'application_end_date']),

  /**
   * @collection scholarship_applications
   * @description Stores applications submitted by students for scholarships.
   */
  scholarship_applications: defineTable({
    /** @type {Id<'scholarships'>} - The ID of the scholarship program being applied for. */
    scholarship_id: v.id('scholarships'), // Başvuru yapılan burs programı
    /** @type {Id<'beneficiaries'>} - The ID of the student beneficiary, if they are already registered. */
    student_id: v.optional(v.id('beneficiaries')), // Öğrenci (eğer kayıtlıysa)
    /** @type {Id<'users'>} - The ID of the staff member who created the application on behalf of the student. */
    created_by: v.optional(v.id('users')), // Application creator (staff/admin)
    /** @type {string} - The full name of the applicant. */
    applicant_name: v.string(), // Başvuran adı
    /** @type {string} - The applicant's Turkish National Identity Number (TC Kimlik No). */
    applicant_tc_no: v.string(), // TC Kimlik No
    /** @type {string} - The applicant's phone number. */
    applicant_phone: v.string(), // Telefon
    /** @type {string} - The applicant's email address. */
    applicant_email: v.optional(v.string()), // Email
    /** @type {string} - The university the applicant is attending. */
    university: v.optional(v.string()), // Üniversite
    /** @type {string} - The department or field of study. */
    department: v.optional(v.string()), // Bölüm
    /** @type {string} - The applicant's current grade level (e.g., '1', '2', '3', '4'). */
    grade_level: v.optional(v.string()), // Sınıf düzeyi (1., 2., 3., 4.)
    /** @type {number} - The applicant's Grade Point Average (GPA). */
    gpa: v.optional(v.number()), // GPA/Ortalama
    /** @type {string} - The academic year of the application. */
    academic_year: v.optional(v.string()), // Akademik yıl
    /** @type {number} - The applicant's personal monthly income. */
    monthly_income: v.optional(v.number()), // Aylık gelir
    /** @type {number} - The applicant's total family income. */
    family_income: v.optional(v.number()), // Aile geliri
    /** @type {string} - The occupation of the applicant's father. */
    father_occupation: v.optional(v.string()), // Baba mesleği
    /** @type {string} - The occupation of the applicant's mother. */
    mother_occupation: v.optional(v.string()), // Anne mesleği
    /** @type {number} - The number of siblings the applicant has. */
    sibling_count: v.optional(v.number()), // Kardeş sayısı
    /** @type {boolean} - Flag indicating if the applicant is an orphan. */
    is_orphan: v.optional(v.boolean()), // Yetim mi?
    /** @type {boolean} - Flag indicating if the applicant has a disability. */
    has_disability: v.optional(v.boolean()), // Engelli mi?
    /** @type {string} - A personal essay or motivation letter from the applicant. */
    essay: v.optional(v.string()), // Essay/motivasyon mektubu
    /** @type {'draft'|'submitted'|'under_review'|'approved'|'rejected'|'waitlisted'} - The current status of the application. */
    status: v.union(
      v.literal('draft'),
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('waitlisted')
    ),
    /** @type {number} - A calculated score to determine the priority of the application. */
    priority_score: v.optional(v.number()), // Öncelik puanı (otomatik hesaplanacak)
    /** @type {string} - Notes from the reviewer of the application. */
    reviewer_notes: v.optional(v.string()), // İnceleyen notları
    /** @type {string} - The timestamp when the application was submitted. */
    submitted_at: v.optional(v.string()), // Başvuru gönderim tarihi
    /** @type {Id<'users'>} - The ID of the user who reviewed the application. */
    reviewed_by: v.optional(v.id('users')), // İnceleyen
    /** @type {string} - The timestamp when the application was reviewed. */
    reviewed_at: v.optional(v.string()), // İnceleme tarihi
    /** @type {string[]} - A list of names for uploaded documents related to the application. */
    documents: v.optional(v.array(v.string())), // Yüklenen belge isimleri
    /** @type {string} - The timestamp when the application record was created. */
    created_at: v.string(),
  })
    .index('by_scholarship', ['scholarship_id'])
    .index('by_status', ['status'])
    .index('by_tc_no', ['applicant_tc_no'])
    .index('by_submitted_at', ['submitted_at']),

  /**
   * @collection scholarship_payments
   * @description Logs payment transactions for approved scholarships.
   */
  scholarship_payments: defineTable({
    /** @type {Id<'scholarship_applications'>} - The ID of the approved scholarship application this payment is for. */
    application_id: v.id('scholarship_applications'), // Başvuru ID
    /** @type {string} - The date the payment was made. */
    payment_date: v.string(), // Ödeme tarihi
    /** @type {number} - The amount of the payment. */
    amount: v.number(), // Ödeme miktarı
    /** @type {'TRY'|'USD'|'EUR'} - The currency of the payment. */
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    /** @type {string} - The method used for the payment (e.g., 'bank_transfer'). */
    payment_method: v.string(), // Ödeme yöntemi
    /** @type {string} - A reference number for the payment transaction. */
    payment_reference: v.optional(v.string()), // Ödeme referansı
    /** @type {string} - The bank account the payment was sent to. */
    bank_account: v.optional(v.string()), // Banka hesabı
    /** @type {string} - Additional notes about the payment. */
    notes: v.optional(v.string()), // Notlar
    /** @type {'pending'|'paid'|'failed'|'cancelled'} - The status of the payment. */
    status: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('failed'),
      v.literal('cancelled')
    ),
    /** @type {Id<'users'>} - The ID of the user who processed the payment. */
    processed_by: v.optional(v.id('users')), // İşleyen kişi
    /** @type {string} - The ID of the stored receipt file for the payment. */
    receipt_file_id: v.optional(v.string()), // Makbuz dosya ID
    /** @type {string} - The timestamp when the payment record was created. */
    created_at: v.string(),
  })
    .index('by_application', ['application_id'])
    .index('by_payment_date', ['payment_date'])
    .index('by_status', ['status']),

  /**
   * @collection communication_logs
   * @description Logs for email and SMS communications
   */
  communication_logs: defineTable({
    /** @type {'email'|'sms'} - Type of communication */
    type: v.union(v.literal('email'), v.literal('sms')),
    /** @type {string} - Recipient email or phone number */
    to: v.string(),
    /** @type {string} - Email subject (for emails only) */
    subject: v.optional(v.string()),
    /** @type {string} - Message content */
    message: v.string(),
    /** @type {'sent'|'failed'|'pending'} - Communication status */
    status: v.union(v.literal('sent'), v.literal('failed'), v.literal('pending')),
    /** @type {string} - Message ID from email/SMS provider */
    messageId: v.optional(v.string()),
    /** @type {string} - Error message if failed */
    error: v.optional(v.string()),
    /** @type {string} - Timestamp when sent */
    sentAt: v.string(),
    /** @type {Id<'users'>} - User who initiated the communication */
    userId: v.optional(v.id('users')),
    /** @type {any} - Additional metadata */
    metadata: v.optional(v.any()),
  })
    .index('by_type', ['type'])
    .index('by_status', ['status'])
    .index('by_sent_at', ['sentAt'])
    .index('by_user', ['userId']),

  /**
   * @collection analytics_events
   * @description Analytics event tracking
   */
  analytics_events: defineTable({
    /** @type {string} - Event name */
    event: v.string(),
    /** @type {Id<'users'>} - User who triggered the event */
    userId: v.optional(v.id('users')),
    /** @type {string} - Session ID */
    sessionId: v.optional(v.string()),
    /** @type {any} - Event properties */
    properties: v.any(),
    /** @type {string} - Timestamp */
    timestamp: v.string(),
    /** @type {string} - User agent */
    userAgent: v.optional(v.string()),
  })
    .index('by_event', ['event'])
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp']),

  /**
   * @collection audit_logs
   * @description Audit trail for all critical operations
   */
  audit_logs: defineTable({
    /** @type {Id<'users'>} - User who performed the action */
    userId: v.id('users'),
    /** @type {string} - User name at time of action */
    userName: v.string(),
    /** @type {'CREATE'|'UPDATE'|'DELETE'|'VIEW'} - Action type */
    action: v.union(
      v.literal('CREATE'),
      v.literal('UPDATE'),
      v.literal('DELETE'),
      v.literal('VIEW')
    ),
    /** @type {string} - Resource type (e.g., 'beneficiary', 'user') */
    resource: v.string(),
    /** @type {string} - Resource ID */
    resourceId: v.string(),
    /** @type {any} - Before and after values for updates */
    changes: v.optional(v.any()),
    /** @type {string} - IP address */
    ipAddress: v.optional(v.string()),
    /** @type {string} - User agent */
    userAgent: v.optional(v.string()),
    /** @type {string} - Timestamp */
    timestamp: v.string(),
    /** @type {any} - Additional metadata */
    metadata: v.optional(v.any()),
  })
    .index('by_user', ['userId'])
    .index('by_resource', ['resource', 'resourceId'])
    .index('by_action', ['action'])
    .index('by_timestamp', ['timestamp']),

  /**
   * @collection errors
   * @description Main error tracking table for capturing and managing application errors
   */
  errors: defineTable({
    /** @type {string} - Machine-readable error code (e.g., ERR_AUTH_001) */
    error_code: v.string(),
    /** @type {string} - Human-readable error title */
    title: v.string(),
    /** @type {string} - Detailed error description */
    description: v.string(),
    /** @type {'runtime'|'ui_ux'|'design_bug'|'system'|'data'|'security'|'performance'|'integration'} - Error category */
    category: v.union(
      v.literal('runtime'),
      v.literal('ui_ux'),
      v.literal('design_bug'),
      v.literal('system'),
      v.literal('data'),
      v.literal('security'),
      v.literal('performance'),
      v.literal('integration')
    ),
    /** @type {'critical'|'high'|'medium'|'low'} - Severity level */
    severity: v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low')
    ),
    /** @type {'new'|'assigned'|'in_progress'|'resolved'|'closed'|'reopened'} - Current status */
    status: v.union(
      v.literal('new'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('resolved'),
      v.literal('closed'),
      v.literal('reopened')
    ),
    /** @type {string} - Technical stack trace (for runtime errors) */
    stack_trace: v.optional(v.string()),
    /** @type {any} - Additional context data */
    error_context: v.optional(v.any()),
    /** @type {Id<'users'>} - User who encountered the error */
    user_id: v.optional(v.id('users')),
    /** @type {string} - User session identifier */
    session_id: v.optional(v.string()),
    /** @type {any} - Browser, OS, device information */
    device_info: v.optional(v.any()),
    /** @type {string} - Page URL where error occurred */
    url: v.optional(v.string()),
    /** @type {string} - React component or module name */
    component: v.optional(v.string()),
    /** @type {string} - Function or method that failed */
    function_name: v.optional(v.string()),
    /** @type {number} - Number of times error occurred */
    occurrence_count: v.number(),
    /** @type {string} - First occurrence timestamp */
    first_seen: v.string(),
    /** @type {string} - Most recent occurrence timestamp */
    last_seen: v.string(),
    /** @type {Id<'users'>} - User responsible for fixing */
    assigned_to: v.optional(v.id('users')),
    /** @type {Id<'users'>} - User who reported the error */
    reporter_id: v.optional(v.id('users')),
    /** @type {string[]} - Custom tags for categorization */
    tags: v.optional(v.array(v.string())),
    /** @type {any} - Additional flexible metadata */
    metadata: v.optional(v.any()),
    /** @type {string} - Notes on how error was resolved */
    resolution_notes: v.optional(v.string()),
    /** @type {string} - Resolution timestamp */
    resolved_at: v.optional(v.string()),
    /** @type {Id<'users'>} - User who resolved the error */
    resolved_by: v.optional(v.id('users')),
    /** @type {string} - Error fingerprint for deduplication */
    fingerprint: v.optional(v.string()),
    /** @type {string} - Sentry event ID reference */
    sentry_event_id: v.optional(v.string()),
    /** @type {Id<'tasks'>} - Linked task for fixing the error */
    task_id: v.optional(v.id('tasks')),
  })
    .index('by_status', ['status'])
    .index('by_severity', ['severity'])
    .index('by_category', ['category'])
    .index('by_assigned_to', ['assigned_to'])
    .index('by_fingerprint', ['fingerprint'])
    .index('by_first_seen', ['first_seen'])
    .index('by_last_seen', ['last_seen'])
    .index('by_status_severity', ['status', 'severity'])
    .searchIndex('by_search', {
      searchField: 'title',
      filterFields: ['error_code', 'component'],
    }),

  /**
   * @collection error_occurrences
   * @description Individual error occurrence records for pattern analysis
   */
  error_occurrences: defineTable({
    /** @type {Id<'errors'>} - Reference to parent error record */
    error_id: v.id('errors'),
    /** @type {string} - Exact occurrence time */
    timestamp: v.string(),
    /** @type {Id<'users'>} - User experiencing the error */
    user_id: v.optional(v.id('users')),
    /** @type {string} - Session identifier */
    session_id: v.optional(v.string()),
    /** @type {string} - Page URL */
    url: v.optional(v.string()),
    /** @type {string} - Action user was performing */
    user_action: v.optional(v.string()),
    /** @type {string} - API request identifier */
    request_id: v.optional(v.string()),
    /** @type {string} - Client IP address */
    ip_address: v.optional(v.string()),
    /** @type {string} - Browser user agent string */
    user_agent: v.optional(v.string()),
    /** @type {any} - Application state at error time */
    context_snapshot: v.optional(v.any()),
    /** @type {string} - Reference to Sentry event */
    sentry_event_id: v.optional(v.string()),
    /** @type {string} - Stack trace for this occurrence */
    stack_trace: v.optional(v.string()),
  })
    .index('by_error', ['error_id'])
    .index('by_timestamp', ['timestamp'])
    .index('by_user', ['user_id']),

  /**
   * @collection performance_metrics
   * @description Performance monitoring metrics for system optimization
   */
  performance_metrics: defineTable({
    /** @type {'page_load'|'api_call'|'database_query'|'render_time'} - Type of metric */
    metric_type: v.union(
      v.literal('page_load'),
      v.literal('api_call'),
      v.literal('database_query'),
      v.literal('render_time')
    ),
    /** @type {string} - Name of the metric */
    metric_name: v.string(),
    /** @type {number} - Metric value */
    value: v.number(),
    /** @type {string} - Unit of measurement */
    unit: v.string(),
    /** @type {any} - Additional metadata */
    metadata: v.optional(v.any()),
    /** @type {string} - Timestamp when recorded */
    recorded_at: v.string(),
  })
    .index('by_metric_type', ['metric_type'])
    .index('by_metric_name', ['metric_name'])
    .index('by_recorded_at', ['recorded_at']),

  /**
   * @collection error_logs
   * @description Application error logs for monitoring and debugging
   */
  error_logs: defineTable({
    /** @type {string} - Type of error */
    error_type: v.string(),
    /** @type {string} - Error message */
    error_message: v.string(),
    /** @type {string} - Stack trace */
    stack_trace: v.optional(v.string()),
    /** @type {Id<'users'>} - User who encountered the error */
    user_id: v.optional(v.id('users')),
    /** @type {any} - Additional context */
    context: v.optional(v.any()),
    /** @type {string} - Timestamp when error occurred */
    occurred_at: v.string(),
    /** @type {boolean} - Whether error is resolved */
    resolved: v.boolean(),
    /** @type {Id<'users'>} - User who resolved the error */
    resolved_by: v.optional(v.id('users')),
    /** @type {string} - Resolution timestamp */
    resolved_at: v.optional(v.string()),
    /** @type {string} - Resolution notes */
    resolution: v.optional(v.string()),
  })
    .index('by_resolved', ['resolved'])
    .index('by_error_type', ['error_type'])
    .index('by_occurred_at', ['occurred_at']),

  /**
   * @collection system_alerts
   * @description System-wide alerts and notifications for administrators
   */
  system_alerts: defineTable({
    /** @type {'error'|'performance'|'security'|'system'} - Type of alert */
    alert_type: v.union(
      v.literal('error'),
      v.literal('performance'),
      v.literal('security'),
      v.literal('system')
    ),
    /** @type {'low'|'medium'|'high'|'critical'} - Severity level */
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    /** @type {string} - Alert title */
    title: v.string(),
    /** @type {string} - Alert description */
    description: v.string(),
    /** @type {any} - Additional metadata */
    metadata: v.optional(v.any()),
    /** @type {string} - Creation timestamp */
    created_at: v.string(),
    /** @type {boolean} - Whether alert is acknowledged */
    acknowledged: v.boolean(),
    /** @type {Id<'users'>} - User who acknowledged */
    acknowledged_by: v.optional(v.id('users')),
    /** @type {string} - Acknowledgment timestamp */
    acknowledged_at: v.optional(v.string()),
    /** @type {boolean} - Whether alert is resolved */
    resolved: v.boolean(),
  })
    .index('by_resolved', ['resolved'])
    .index('by_severity', ['severity'])
    .index('by_alert_type', ['alert_type'])
    .index('by_created_at', ['created_at']),
});

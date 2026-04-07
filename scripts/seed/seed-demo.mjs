import { createHash } from 'node:crypto';

import {
  DEMO_ACCOUNTS,
  DEMO_BRANCHES,
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  createAdminClient,
  expectData,
  expectOk,
  getDemoPassword,
  minutesAgo,
  minutesFromNow,
} from './demo-config.mjs';
import { resetDemoData } from './reset-demo.mjs';

const customers = [
  'Atlas Retail Group',
  'MetroCare Clinics',
  'Harborline Logistics',
  'CivicPoint Offices',
  'Evergreen Grocers',
  'Summit Fitness',
  'Northline Property Trust',
  'Bluebird Hospitality',
];

function hashPayload(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function accountByKey(accounts, key) {
  const account = accounts[key];

  if (!account) {
    throw new Error(`Missing seeded account: ${key}`);
  }

  return account;
}

function branchByCode(branches, code) {
  const branch = branches[code];

  if (!branch) {
    throw new Error(`Missing seeded branch: ${code}`);
  }

  return branch;
}

async function seedDemoUsers(supabase) {
  const password = getDemoPassword();
  const seededAccounts = {};

  for (const account of DEMO_ACCOUNTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        title: account.title,
      },
    });

    if (error) {
      throw new Error(`Create demo user ${account.email}: ${error.message}`);
    }

    await expectOk(
      supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: account.email,
          full_name: account.fullName,
          is_active: true,
        },
        { onConflict: 'id' },
      ),
      `Upsert profile ${account.email}`,
    );

    seededAccounts[account.key] = {
      ...account,
      id: data.user.id,
    };
  }

  return seededAccounts;
}

async function seedOrganization(supabase, accounts) {
  return await expectData(
    supabase
      .from('organizations')
      .insert({
        name: DEMO_ORG_NAME,
        slug: DEMO_ORG_SLUG,
        created_by: accountByKey(accounts, 'owner').id,
      })
      .select('id, name, slug')
      .single(),
    'Create demo organization',
  );
}

async function seedBranches(supabase, organizationId) {
  const locations = await expectData(
    supabase
      .from('locations')
      .insert(
        DEMO_BRANCHES.map((branch) => ({
          organization_id: organizationId,
          name: branch.name,
          code: branch.code,
          timezone: branch.timezone,
          is_active: true,
        })),
      )
      .select('id, name, code'),
    'Create demo branches',
  );

  return Object.fromEntries(locations.map((location) => [location.code, location]));
}

async function seedMemberships(supabase, organizationId, accounts, branches) {
  await expectOk(
    supabase.from('organization_members').insert(
      Object.values(accounts).map((account) => ({
        organization_id: organizationId,
        user_id: account.id,
        role: account.role,
        is_active: true,
      })),
    ),
    'Create demo organization memberships',
  );

  await expectOk(
    supabase.from('location_member_access').upsert(
      Object.values(accounts).flatMap((account) =>
        DEMO_BRANCHES.map((branch) => ({
          organization_id: organizationId,
          location_id: branchByCode(branches, branch.code).id,
          user_id: account.id,
          is_active:
            account.allLocations === true || account.branchCodes?.includes(branch.code) === true,
        })),
      ),
      { onConflict: 'organization_id,location_id,user_id' },
    ),
    'Create demo branch access',
  );
}

async function seedBilling(supabase, organizationId) {
  const customerId = 'cus_demo_northstar';

  await expectOk(
    supabase.from('organization_entitlements').upsert(
      {
        organization_id: organizationId,
        plan: 'business',
        max_operators: 50,
        max_saved_views: 25,
        can_use_advanced_filters: true,
        can_use_analytics: true,
        can_use_priority_support: true,
      },
      { onConflict: 'organization_id' },
    ),
    'Create demo entitlements',
  );

  await expectOk(
    supabase.from('billing_customers').insert({
      organization_id: organizationId,
      stripe_customer_id: customerId,
    }),
    'Create demo billing customer',
  );

  await expectOk(
    supabase.from('billing_subscriptions').insert({
      organization_id: organizationId,
      stripe_customer_id: customerId,
      stripe_subscription_id: 'sub_demo_business_active',
      stripe_price_id: 'price_demo_business_monthly',
      stripe_product_id: 'prod_demo_business',
      plan: 'business',
      status: 'active',
      interval: 'month',
      currency: 'usd',
      amount_unit: 12900,
      current_period_start: minutesAgo(60 * 24 * 8),
      current_period_end: minutesFromNow(60 * 24 * 22),
      raw: {
        demo: true,
        source: 'sprint-12-seed',
      },
    }),
    'Create demo subscription',
  );

  await expectOk(
    supabase.from('billing_events').insert({
      stripe_event_id: 'evt_demo_subscription_created',
      event_type: 'customer.subscription.created',
      livemode: false,
      processed_at: minutesAgo(60 * 24 * 8),
      payload: {
        demo: true,
        organization_id: organizationId,
        status: 'active',
      },
    }),
    'Create demo billing event',
  );
}

async function seedSlaPolicies(supabase, organizationId, accounts) {
  const owner = accountByKey(accounts, 'owner');

  await expectOk(
    supabase.from('sla_policies').insert([
      {
        organization_id: organizationId,
        name: 'Critical incidents',
        description: 'Portfolio demo policy for high-urgency incident response.',
        entity_type: 'incident',
        severity: 'critical',
        first_response_target_minutes: 30,
        resolution_target_minutes: 240,
        warn_before_breach_minutes: 45,
        escalation_role: 'admin',
        precedence: 10,
        created_by_user_id: owner.id,
        updated_by_user_id: owner.id,
      },
      {
        organization_id: organizationId,
        name: 'Urgent jobs',
        description: 'Portfolio demo policy for urgent job dispatch.',
        entity_type: 'job',
        priority: 'urgent',
        first_response_target_minutes: 45,
        resolution_target_minutes: 360,
        warn_before_breach_minutes: 60,
        escalation_role: 'manager',
        precedence: 20,
        created_by_user_id: owner.id,
        updated_by_user_id: owner.id,
      },
      {
        organization_id: organizationId,
        name: 'Standard operations',
        description: 'Default policy for regular jobs and tasks.',
        first_response_target_minutes: 180,
        resolution_target_minutes: 1440,
        warn_before_breach_minutes: 120,
        escalation_role: 'manager',
        precedence: 100,
        created_by_user_id: owner.id,
        updated_by_user_id: owner.id,
      },
    ]),
    'Create demo SLA policies',
  );
}

function buildJobs(organizationId, accounts, branches) {
  const owner = accountByKey(accounts, 'owner');
  const assignees = [
    accountByKey(accounts, 'operatorToronto'),
    accountByKey(accounts, 'managerToronto'),
    accountByKey(accounts, 'operatorVancouver'),
    accountByKey(accounts, 'managerVancouver'),
    accountByKey(accounts, 'operatorCalgary'),
    accountByKey(accounts, 'admin'),
  ];
  const templates = [
    ['TOR', 'JOB-2101', 'Critical freezer compressor failure', 'urgent', 'blocked', 'reactive', -90],
    ['TOR', 'JOB-2102', 'Quarterly fire panel inspection', 'medium', 'scheduled', 'inspection', 1440],
    ['TOR', 'JOB-2103', 'Retail lighting retrofit phase two', 'high', 'in_progress', 'preventive', 360],
    ['TOR', 'JOB-2104', 'HVAC vibration follow-up', 'low', 'completed', 'vendor', -240],
    ['VAN', 'JOB-2105', 'Dock door safety sensor outage', 'urgent', 'in_progress', 'reactive', 120],
    ['VAN', 'JOB-2106', 'Lobby access reader replacement', 'medium', 'new', 'vendor', 2880],
    ['VAN', 'JOB-2107', 'Preventive generator service', 'high', 'completed', 'preventive', -2880],
    ['VAN', 'JOB-2108', 'Restaurant leak investigation', 'urgent', 'blocked', 'reactive', -45],
    ['CAL', 'JOB-2109', 'Warehouse heater calibration', 'medium', 'scheduled', 'preventive', 960],
    ['CAL', 'JOB-2110', 'Emergency roof access repair', 'high', 'in_progress', 'reactive', 300],
    ['CAL', 'JOB-2111', 'Backflow inspection closeout', 'low', 'completed', 'inspection', -180],
    ['CAL', 'JOB-2112', 'Security camera blind spot review', 'medium', 'new', 'inspection', 4320],
    ['OTT', 'JOB-2113', 'Elevator vendor coordination', 'urgent', 'blocked', 'vendor', -30],
    ['OTT', 'JOB-2114', 'Life safety signage refresh', 'medium', 'scheduled', 'preventive', 1680],
    ['OTT', 'JOB-2115', 'Water pressure complaint', 'high', 'in_progress', 'reactive', 240],
    ['OTT', 'JOB-2116', 'Monthly site walk closeout', 'low', 'completed', 'inspection', -360],
  ];

  return templates.map((template, index) => {
    const [branchCode, reference, title, priority, status, type, dueOffset] = template;
    const isCompleted = status === 'completed';

    return {
      organization_id: organizationId,
      location_id: branchByCode(branches, branchCode).id,
      reference,
      title,
      summary: `${title}. Seeded to make filters, SLA reports, and branch comparison meaningful.`,
      site_name: `${customers[index % customers.length]} - ${branchCode} site`,
      customer_name: customers[index % customers.length],
      priority,
      status,
      type,
      due_at: minutesFromNow(dueOffset),
      created_by_user_id: owner.id,
      assignee_user_id: assignees[index % assignees.length].id,
      checklist_summary: 'Initial dispatch, site access, safety review, and customer update are tracked.',
      resolution_summary: isCompleted ? 'Completed during the demo reporting window.' : null,
      first_response_at: minutesAgo(600 + index * 15),
      resolved_at: isCompleted ? minutesAgo(90 + index * 12) : null,
      created_at: minutesAgo(1200 + index * 120),
    };
  });
}

function buildIncidents(organizationId, accounts, branches) {
  const owner = accountByKey(accounts, 'owner');
  const assignees = [
    accountByKey(accounts, 'managerToronto'),
    accountByKey(accounts, 'managerVancouver'),
    accountByKey(accounts, 'admin'),
  ];
  const templates = [
    ['TOR', 'INC-1101', 'Cold-chain outage at flagship retail branch', 'critical', 'investigating', true],
    ['TOR', 'INC-1102', 'Escalated after-hours access issue', 'high', 'monitoring', false],
    ['VAN', 'INC-1103', 'Water ingress near loading dock', 'critical', 'open', true],
    ['VAN', 'INC-1104', 'Vendor missed generator service window', 'medium', 'resolved', false],
    ['CAL', 'INC-1105', 'Warehouse heating complaint surge', 'high', 'investigating', true],
    ['CAL', 'INC-1106', 'Security camera offline alert', 'medium', 'closed', false],
    ['OTT', 'INC-1107', 'Elevator outage customer escalation', 'critical', 'open', true],
    ['OTT', 'INC-1108', 'Repeated low water pressure reports', 'low', 'resolved', false],
  ];

  return templates.map((template, index) => {
    const [branchCode, reference, title, severity, status, slaRisk] = template;
    const isResolved = status === 'resolved' || status === 'closed';

    return {
      organization_id: organizationId,
      location_id: branchByCode(branches, branchCode).id,
      reference,
      title,
      summary: `${title}. Seeded to demonstrate incident triage, escalation, timelines, and SLA pressure.`,
      site_name: `${customers[index % customers.length]} - ${branchCode} site`,
      customer_name: customers[index % customers.length],
      severity,
      status,
      sla_risk: slaRisk,
      opened_at: minutesAgo(240 + index * 240),
      owner_user_id: owner.id,
      assignee_user_id: assignees[index % assignees.length].id,
      impact_summary: slaRisk
        ? 'Customer operations are disrupted and leadership visibility is required.'
        : 'Impact is contained and being tracked through the incident workflow.',
      next_action: isResolved
        ? 'Review closure notes and confirm audit trail.'
        : 'Coordinate branch owner update and refresh the next customer communication.',
      escalation_level: slaRisk ? 1 : 0,
      first_response_at: minutesAgo(210 + index * 220),
      resolved_at: isResolved ? minutesAgo(120 + index * 30) : null,
      acknowledged_at: minutesAgo(200 + index * 210),
      closed_at: status === 'closed' ? minutesAgo(180) : null,
      created_at: minutesAgo(240 + index * 240),
      last_activity_at: minutesAgo(20 + index * 15),
    };
  });
}

function buildTasks(organizationId, accounts, branches, jobs, incidents) {
  const owner = accountByKey(accounts, 'owner');
  const assignees = [
    accountByKey(accounts, 'operatorToronto'),
    accountByKey(accounts, 'managerToronto'),
    accountByKey(accounts, 'operatorVancouver'),
    accountByKey(accounts, 'operatorCalgary'),
    accountByKey(accounts, 'admin'),
  ];

  return [
    ['TASK-3101', 'Confirm freezer parts ETA', 'TOR', 'urgent', 'in_progress', jobs[0].id, null],
    ['TASK-3102', 'Send cold-chain customer update', 'TOR', 'high', 'todo', null, incidents[0].id],
    ['TASK-3103', 'Attach generator service certificate', 'VAN', 'medium', 'completed', jobs[6].id, null],
    ['TASK-3104', 'Review leak photos before vendor dispatch', 'VAN', 'high', 'blocked', jobs[7].id, null],
    ['TASK-3105', 'Call Calgary warehouse manager', 'CAL', 'medium', 'in_progress', null, incidents[4].id],
    ['TASK-3106', 'Prepare Ottawa elevator escalation notes', 'OTT', 'urgent', 'todo', null, incidents[6].id],
    ['TASK-3107', 'Close out backflow inspection notes', 'CAL', 'low', 'completed', jobs[10].id, null],
    ['TASK-3108', 'Recheck branch comparison anomalies', 'OTT', 'medium', 'todo', null, null],
  ].map((template, index) => {
    const [reference, title, branchCode, priority, status, linkedJobId, linkedIncidentId] =
      template;

    return {
      organization_id: organizationId,
      location_id: branchByCode(branches, branchCode).id,
      reference,
      title,
      summary: `${title}. Seeded as a follow-up action for demo operators.`,
      priority,
      status,
      due_at: minutesFromNow(index % 3 === 0 ? -60 : 240 + index * 120),
      created_by_user_id: owner.id,
      assignee_user_id: assignees[index % assignees.length].id,
      linked_job_id: linkedJobId,
      linked_incident_id: linkedIncidentId,
      completion_summary: status === 'completed' ? 'Completed for seeded demo history.' : null,
      first_response_at: minutesAgo(180 + index * 10),
      resolved_at: status === 'completed' ? minutesAgo(60 + index * 10) : null,
      created_at: minutesAgo(600 + index * 120),
    };
  });
}

async function seedOperations(supabase, organizationId, accounts, branches) {
  const jobs = await expectData(
    supabase.from('jobs').insert(buildJobs(organizationId, accounts, branches)).select('*'),
    'Create demo jobs',
  );

  const incidents = await expectData(
    supabase
      .from('incidents')
      .insert(buildIncidents(organizationId, accounts, branches))
      .select('*'),
    'Create demo incidents',
  );

  const tasks = await expectData(
    supabase
      .from('tasks')
      .insert(buildTasks(organizationId, accounts, branches, jobs, incidents))
      .select('*'),
    'Create demo tasks',
  );

  return { jobs, incidents, tasks };
}

async function seedTimelines(supabase, organizationId, accounts, records) {
  const owner = accountByKey(accounts, 'owner');
  const admin = accountByKey(accounts, 'admin');

  await expectOk(
    supabase.from('job_timeline_events').insert(
      records.jobs.flatMap((job, index) => [
        {
          organization_id: organizationId,
          job_id: job.id,
          event_type: 'created',
          title: 'Job created',
          description: `${job.reference} was created for the portfolio demo.`,
          actor_user_id: owner.id,
          actor_name: owner.fullName,
          created_at: job.created_at,
        },
        {
          organization_id: organizationId,
          job_id: job.id,
          event_type: job.status === 'completed' ? 'completed' : 'assignment',
          title: job.status === 'completed' ? 'Job completed' : 'Assignee updated',
          description:
            job.status === 'completed'
              ? 'Seeded completion event for analytics and timelines.'
              : 'Seeded assignment event for operator workflow depth.',
          actor_user_id: index % 2 === 0 ? admin.id : owner.id,
          actor_name: index % 2 === 0 ? admin.fullName : owner.fullName,
          created_at: minutesAgo(120 + index * 20),
        },
      ]),
    ),
    'Create demo job timeline events',
  );

  await expectOk(
    supabase.from('incident_timeline_events').insert(
      records.incidents.flatMap((incident, index) => [
        {
          organization_id: organizationId,
          incident_id: incident.id,
          event_type: 'created',
          title: 'Incident opened',
          description: `${incident.reference} was opened for seeded incident triage.`,
          actor_user_id: owner.id,
          actor_name: owner.fullName,
          created_at: incident.opened_at,
        },
        {
          organization_id: organizationId,
          incident_id: incident.id,
          event_type: incident.escalation_level > 0 ? 'escalation' : 'status_change',
          title: incident.escalation_level > 0 ? 'Escalation triggered' : 'Status updated',
          description:
            incident.escalation_level > 0
              ? 'Seeded escalation event for audit and incident workflow demos.'
              : 'Seeded status update for timeline review.',
          actor_user_id: index % 2 === 0 ? admin.id : owner.id,
          actor_name: index % 2 === 0 ? admin.fullName : owner.fullName,
          created_at: minutesAgo(80 + index * 25),
        },
      ]),
    ),
    'Create demo incident timeline events',
  );

  await expectOk(
    supabase.from('task_timeline_events').insert(
      records.tasks.map((task, index) => ({
        organization_id: organizationId,
        task_id: task.id,
        event_type: task.status === 'completed' ? 'completed' : 'created',
        title: task.status === 'completed' ? 'Task completed' : 'Task created',
        description: 'Seeded task activity for demo follow-up flows.',
        actor_user_id: owner.id,
        actor_name: owner.fullName,
        created_at: minutesAgo(80 + index * 30),
      })),
    ),
    'Create demo task timeline events',
  );
}

async function seedSlaSnapshots(supabase, organizationId, records) {
  const rows = [
    ...records.jobs.map((job, index) => ({
      organization_id: organizationId,
      location_id: job.location_id,
      entity_type: 'job',
      entity_id: job.id,
      status_category: ['completed', 'cancelled'].includes(job.status) ? 'terminal' : 'active',
      first_response_target_minutes: job.priority === 'urgent' ? 45 : 180,
      resolution_target_minutes: job.priority === 'urgent' ? 360 : 1440,
      first_response_due_at: minutesAgo(500 + index * 20),
      resolution_due_at: job.due_at,
      first_responded_at: job.first_response_at,
      resolved_at: job.resolved_at,
      first_response_breached_at: index % 5 === 0 ? minutesAgo(360 + index * 20) : null,
      resolution_breached_at:
        job.status !== 'completed' && new Date(job.due_at).getTime() < Date.now()
          ? minutesAgo(30 + index * 10)
          : null,
      risk_level:
        job.status !== 'completed' && new Date(job.due_at).getTime() < Date.now()
          ? 'breached'
          : index % 4 === 0
            ? 'at_risk'
            : 'normal',
      escalation_state:
        job.status !== 'completed' && new Date(job.due_at).getTime() < Date.now()
          ? 'warning'
          : 'none',
      warning_sent_at: index % 4 === 0 ? minutesAgo(90 + index * 10) : null,
      last_evaluated_at: minutesAgo(10 + index),
      created_at: job.created_at,
    })),
    ...records.incidents.map((incident, index) => ({
      organization_id: organizationId,
      location_id: incident.location_id,
      entity_type: 'incident',
      entity_id: incident.id,
      status_category: ['resolved', 'closed'].includes(incident.status) ? 'terminal' : 'active',
      first_response_target_minutes: incident.severity === 'critical' ? 30 : 120,
      resolution_target_minutes: incident.severity === 'critical' ? 240 : 1440,
      first_response_due_at: minutesAgo(240 + index * 20),
      resolution_due_at: minutesFromNow(index % 3 === 0 ? -45 : 240 + index * 90),
      first_responded_at: incident.first_response_at,
      resolved_at: incident.resolved_at,
      first_response_breached_at: incident.sla_risk ? minutesAgo(120 + index * 10) : null,
      resolution_breached_at: incident.sla_risk ? minutesAgo(45 + index * 10) : null,
      risk_level: incident.sla_risk ? 'breached' : 'normal',
      escalation_state: incident.sla_risk ? 'escalated' : 'none',
      warning_sent_at: incident.sla_risk ? minutesAgo(90 + index * 10) : null,
      escalation_triggered_at: incident.sla_risk ? minutesAgo(60 + index * 10) : null,
      last_evaluated_at: minutesAgo(5 + index),
      created_at: incident.created_at,
    })),
    ...records.tasks.map((task, index) => ({
      organization_id: organizationId,
      location_id: task.location_id,
      entity_type: 'task',
      entity_id: task.id,
      status_category: ['completed', 'cancelled'].includes(task.status) ? 'terminal' : 'active',
      first_response_target_minutes: 180,
      resolution_target_minutes: 1440,
      first_response_due_at: minutesAgo(300 + index * 20),
      resolution_due_at: task.due_at,
      first_responded_at: task.first_response_at,
      resolved_at: task.resolved_at,
      risk_level:
        task.status !== 'completed' && new Date(task.due_at).getTime() < Date.now()
          ? 'at_risk'
          : 'normal',
      escalation_state: 'none',
      last_evaluated_at: minutesAgo(12 + index),
      created_at: task.created_at,
    })),
  ];

  await expectOk(supabase.from('work_item_slas').insert(rows), 'Create demo SLA snapshots');
}

async function seedEscalations(supabase, organizationId, accounts, records) {
  const admin = accountByKey(accounts, 'admin');
  const targetIncidents = records.incidents.filter((incident) => incident.escalation_level > 0);

  await expectOk(
    supabase.from('incident_escalations').insert(
      targetIncidents.slice(0, 4).map((incident, index) => ({
        organization_id: organizationId,
        location_id: incident.location_id,
        incident_id: incident.id,
        triggered_by_user_id: admin.id,
        escalation_level: incident.escalation_level,
        reason: 'Seeded escalation for portfolio incident workflow review.',
        target_role: 'admin',
        status: index % 2 === 0 ? 'sent' : 'acknowledged',
        acknowledged_by_user_id: index % 2 === 0 ? null : admin.id,
        acknowledged_at: index % 2 === 0 ? null : minutesAgo(30 + index * 5),
        metadata: {
          demo: true,
          channel: 'ops-review',
        },
        triggered_at: minutesAgo(75 + index * 20),
      })),
    ),
    'Create demo incident escalations',
  );
}

async function seedCollaborationAndNotifications(supabase, organizationId, accounts, records) {
  const owner = accountByKey(accounts, 'owner');
  const admin = accountByKey(accounts, 'admin');
  const finance = accountByKey(accounts, 'finance');
  const watchableRecords = [
    ...records.jobs.slice(0, 8).map((job) => ({ type: 'job', record: job })),
    ...records.incidents.slice(0, 6).map((incident) => ({ type: 'incident', record: incident })),
  ];

  await expectOk(
    supabase.from('record_watchers').insert(
      watchableRecords.flatMap(({ type, record }) => [
        {
          organization_id: organizationId,
          location_id: record.location_id,
          entity_type: type,
          entity_id: record.id,
          user_id: owner.id,
          source: 'creator',
        },
        {
          organization_id: organizationId,
          location_id: record.location_id,
          entity_type: type,
          entity_id: record.id,
          user_id: record.assignee_user_id || admin.id,
          source: 'assignee',
        },
      ]),
    ),
    'Create demo watchers',
  );

  const comments = await expectData(
    supabase
      .from('record_comments')
      .insert(
        watchableRecords.slice(0, 8).map(({ type, record }, index) => ({
          organization_id: organizationId,
          location_id: record.location_id,
          entity_type: type,
          entity_id: record.id,
          author_user_id: index % 2 === 0 ? owner.id : admin.id,
          kind: index % 3 === 0 ? 'internal_note' : 'comment',
          body: 'Seeded demo note: customer updated, next action assigned, and SLA risk reviewed.',
          body_text:
            'Seeded demo note: customer updated, next action assigned, and SLA risk reviewed.',
          created_at: minutesAgo(45 + index * 12),
        })),
      )
      .select('id, organization_id, location_id, entity_type, entity_id'),
    'Create demo comments',
  );

  await expectOk(
    supabase.from('record_comment_mentions').insert(
      comments.slice(0, 4).map((comment) => ({
        organization_id: organizationId,
        location_id: comment.location_id,
        entity_type: comment.entity_type,
        entity_id: comment.entity_id,
        comment_id: comment.id,
        mentioned_user_id: finance.id,
        mentioned_by_user_id: owner.id,
      })),
    ),
    'Create demo comment mentions',
  );

  await expectOk(
    supabase.from('record_notifications').insert(
      watchableRecords.slice(0, 10).map(({ type, record }, index) => ({
        organization_id: organizationId,
        location_id: record.location_id,
        entity_type: type,
        entity_id: record.id,
        event_type:
          index % 4 === 0
            ? 'assignment'
            : index % 4 === 1
              ? 'comment'
              : index % 4 === 2
                ? 'status_change'
                : 'record_created',
        recipient_user_id: index % 3 === 0 ? owner.id : record.assignee_user_id || admin.id,
        actor_user_id: index % 2 === 0 ? admin.id : owner.id,
        title: `${record.reference} needs review`,
        body: 'Seeded notification for reviewer inbox and notification panel demos.',
        href: `/${type === 'job' ? 'jobs' : 'incidents'}/${record.id}`,
        read_at: index % 3 === 0 ? minutesAgo(20 + index * 5) : null,
        created_at: minutesAgo(25 + index * 10),
      })),
    ),
    'Create demo notifications',
  );
}

async function seedAuditAndAi(supabase, organizationId, accounts, branches, records) {
  const owner = accountByKey(accounts, 'owner');
  const admin = accountByKey(accounts, 'admin');

  const auditRows = [
    ...records.jobs.slice(0, 12).map((job, index) => ({
      organization_id: organizationId,
      location_id: job.location_id,
      actor_type: 'user',
      actor_user_id: index % 2 === 0 ? owner.id : admin.id,
      action: index % 3 === 0 ? 'job.status_updated' : 'job.assignee_updated',
      entity_type: 'job',
      entity_id: job.id,
      entity_label: job.reference,
      scope: 'operations',
      metadata: {
        demo: true,
        status: job.status,
        priority: job.priority,
      },
      created_at: minutesAgo(35 + index * 18),
    })),
    ...records.incidents.map((incident, index) => ({
      organization_id: organizationId,
      location_id: incident.location_id,
      actor_type: 'user',
      actor_user_id: index % 2 === 0 ? admin.id : owner.id,
      action: incident.escalation_level > 0 ? 'incident.escalated' : 'incident.status_updated',
      entity_type: 'incident',
      entity_id: incident.id,
      entity_label: incident.reference,
      scope: 'incident',
      metadata: {
        demo: true,
        severity: incident.severity,
        status: incident.status,
      },
      created_at: minutesAgo(50 + index * 22),
    })),
    {
      organization_id: organizationId,
      location_id: null,
      actor_type: 'user',
      actor_user_id: owner.id,
      action: 'billing.checkout_started',
      entity_type: 'billing_subscription',
      entity_label: 'Business plan',
      scope: 'billing',
      metadata: {
        demo: true,
        plan: 'business',
      },
      created_at: minutesAgo(60 * 24),
    },
  ];

  await expectOk(supabase.from('audit_logs').insert(auditRows), 'Create demo audit logs');

  const overviewPayload = {
    summary: 'Northstar is stable overall, with urgent attention needed in Toronto and Ottawa.',
    risks: [
      'Four overdue jobs',
      'Three incident SLA breaches',
      'Ottawa elevator outage requires leadership visibility',
    ],
    nextSteps: [
      'Reassign blocked urgent jobs',
      'Review open incident escalations',
      'Use branch comparison before daily standup',
    ],
  };
  const branchPayload = {
    summary: 'Toronto has the strongest throughput while Ottawa has the highest active risk.',
    strongestBranch: 'Toronto Central',
    highestRiskBranch: 'Ottawa East',
    nextSteps: ['Review Ottawa backlog', 'Escalate unresolved critical incidents'],
  };

  await expectOk(
    supabase.from('ai_runs').insert([
      {
        organization_id: organizationId,
        location_id: null,
        requested_by_user_id: owner.id,
        task_key: 'analytics_overview',
        prompt_version: 'sprint9-v1',
        provider: 'pulseops-deterministic',
        model: 'heuristic-v1',
        status: 'completed',
        input_hash: hashPayload({ organizationId, task: 'analytics_overview', demo: true }),
        request_payload: {
          dateRange: 'last_30_days',
          branchCount: Object.keys(branches).length,
        },
        response_payload: overviewPayload,
        completed_at: minutesAgo(35),
      },
      {
        organization_id: organizationId,
        location_id: null,
        requested_by_user_id: owner.id,
        task_key: 'analytics_branch_comparison',
        prompt_version: 'sprint9-v1',
        provider: 'pulseops-deterministic',
        model: 'heuristic-v1',
        status: 'completed',
        input_hash: hashPayload({
          organizationId,
          task: 'analytics_branch_comparison',
          demo: true,
        }),
        request_payload: {
          dateRange: 'last_30_days',
          branches: Object.keys(branches),
        },
        response_payload: branchPayload,
        completed_at: minutesAgo(28),
      },
    ]),
    'Create demo AI runs',
  );
}

async function seedSavedViews(supabase, organizationId, accounts) {
  const owner = accountByKey(accounts, 'owner');

  await expectOk(
    supabase.from('saved_list_views').insert([
      {
        organization_id: organizationId,
        user_id: owner.id,
        resource_type: 'jobs',
        name: 'Urgent overdue jobs',
        filters: {
          priority: 'urgent',
          due: 'overdue',
          sort: 'due_at:asc',
        },
      },
      {
        organization_id: organizationId,
        user_id: owner.id,
        resource_type: 'incidents',
        name: 'Critical active incidents',
        filters: {
          severity: 'critical',
          status: 'open,investigating',
          sort: 'opened_at:desc',
        },
      },
    ]),
    'Create demo saved views',
  );
}

async function seedDemoData() {
  const supabase = createAdminClient();

  await resetDemoData(supabase);

  const accounts = await seedDemoUsers(supabase);
  const organization = await seedOrganization(supabase, accounts);
  const branches = await seedBranches(supabase, organization.id);

  await seedMemberships(supabase, organization.id, accounts, branches);
  await seedBilling(supabase, organization.id);
  await seedSlaPolicies(supabase, organization.id, accounts);

  const records = await seedOperations(supabase, organization.id, accounts, branches);

  await seedTimelines(supabase, organization.id, accounts, records);
  await seedSlaSnapshots(supabase, organization.id, records);
  await seedEscalations(supabase, organization.id, accounts, records);
  await seedCollaborationAndNotifications(supabase, organization.id, accounts, records);
  await seedAuditAndAi(supabase, organization.id, accounts, branches, records);
  await seedSavedViews(supabase, organization.id, accounts);

  return {
    organization,
    userCount: Object.keys(accounts).length,
    branchCount: Object.keys(branches).length,
    jobCount: records.jobs.length,
    incidentCount: records.incidents.length,
    taskCount: records.tasks.length,
  };
}

seedDemoData()
  .then((result) => {
    console.log(
      `Seeded ${result.organization.name}: ${result.userCount} users, ${result.branchCount} branches, ${result.jobCount} jobs, ${result.incidentCount} incidents, ${result.taskCount} tasks.`,
    );
    console.log(`Demo password: ${getDemoPassword()}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

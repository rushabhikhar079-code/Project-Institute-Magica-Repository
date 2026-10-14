-- Enquiry Allocation Management — MySQL 8 schema
-- Timestamps are stored in UTC.

CREATE DATABASE IF NOT EXISTS enquiry_allocation
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE enquiry_allocation;

CREATE TABLE IF NOT EXISTS teams (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  UNIQUE KEY uq_teams_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS application_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(256) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  team_id CHAR(36) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_team (team_id),
  CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  description VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles (id),
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES application_users (id),
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  replaced_by_id CHAR(36) NULL,
  KEY ix_refresh_user (user_id),
  KEY ix_refresh_hash (token_hash),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES application_users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiries (
  id CHAR(36) NOT NULL PRIMARY KEY,
  reference_number VARCHAR(32) NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  company_name VARCHAR(160) NULL,
  email VARCHAR(256) NULL,
  phone VARCHAR(32) NULL,
  subject VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(32) NOT NULL,
  priority VARCHAR(16) NOT NULL,
  received_at DATETIME(6) NOT NULL,
  allocation_status VARCHAR(32) NOT NULL,
  assigned_employee_id CHAR(36) NULL,
  assigned_team_id CHAR(36) NULL,
  allocated_by_user_id CHAR(36) NULL,
  allocated_at DATETIME(6) NULL,
  due_at DATETIME(6) NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  last_modified_by CHAR(36) NULL,
  last_modified_at DATETIME(6) NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  row_version INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_enquiries_reference (reference_number),
  KEY ix_enquiries_status (allocation_status),
  KEY ix_enquiries_priority (priority),
  KEY ix_enquiries_source (source),
  KEY ix_enquiries_received (received_at),
  KEY ix_enquiries_assigned (assigned_employee_id),
  KEY ix_enquiries_team (assigned_team_id),
  KEY ix_enquiries_email (email),
  KEY ix_enquiries_phone (phone),
  CONSTRAINT fk_enq_assigned FOREIGN KEY (assigned_employee_id) REFERENCES application_users (id),
  CONSTRAINT fk_enq_team FOREIGN KEY (assigned_team_id) REFERENCES teams (id),
  CONSTRAINT fk_enq_allocated_by FOREIGN KEY (allocated_by_user_id) REFERENCES application_users (id),
  CONSTRAINT chk_enquiries_source CHECK (source IN ('Website','Email','Telephone','Referral','ManualEntry','Other')),
  CONSTRAINT chk_enquiries_priority CHECK (priority IN ('Low','Medium','High','Urgent')),
  CONSTRAINT chk_enquiries_status CHECK (allocation_status IN ('Unallocated','Allocated','Accepted','Rejected','Reassigned'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiry_allocations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  enquiry_id CHAR(36) NOT NULL,
  assigned_employee_id CHAR(36) NOT NULL,
  assigned_team_id CHAR(36) NULL,
  allocated_by_user_id CHAR(36) NOT NULL,
  allocated_at DATETIME(6) NOT NULL,
  status VARCHAR(32) NOT NULL,
  remarks VARCHAR(1000) NULL,
  due_at DATETIME(6) NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 1,
  idempotency_key VARCHAR(64) NULL,
  KEY ix_alloc_enquiry (enquiry_id),
  KEY ix_alloc_employee (assigned_employee_id),
  KEY ix_alloc_current (enquiry_id, is_current),
  UNIQUE KEY uq_alloc_idempotency (idempotency_key),
  CONSTRAINT fk_alloc_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries (id),
  CONSTRAINT fk_alloc_employee FOREIGN KEY (assigned_employee_id) REFERENCES application_users (id),
  CONSTRAINT fk_alloc_team FOREIGN KEY (assigned_team_id) REFERENCES teams (id),
  CONSTRAINT fk_alloc_by FOREIGN KEY (allocated_by_user_id) REFERENCES application_users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiry_allocation_history (
  id CHAR(36) NOT NULL PRIMARY KEY,
  enquiry_id CHAR(36) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  previous_status VARCHAR(32) NULL,
  new_status VARCHAR(32) NULL,
  previous_assignee_id CHAR(36) NULL,
  new_assignee_id CHAR(36) NULL,
  actor_user_id CHAR(36) NOT NULL,
  occurred_at DATETIME(6) NOT NULL,
  reason VARCHAR(1000) NULL,
  remarks VARCHAR(1000) NULL,
  correlation_id VARCHAR(64) NULL,
  KEY ix_hist_enquiry (enquiry_id, occurred_at),
  KEY ix_hist_event (event_type),
  CONSTRAINT fk_hist_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries (id),
  CONSTRAINT fk_hist_actor FOREIGN KEY (actor_user_id) REFERENCES application_users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(32) NOT NULL PRIMARY KEY,
  applied_at DATETIME(6) NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO schema_migrations (version, applied_at)
VALUES ('001_initial', UTC_TIMESTAMP(6));

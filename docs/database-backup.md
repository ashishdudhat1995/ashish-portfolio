# PostgreSQL Database Backup & Recovery Guide

This document explains the backup strategies, restore procedures, migration safety rules, and media storage recovery guidelines for the portfolio and CMS platform.

---

## 1. Backup Strategy & Expectations

The application relies on PostgreSQL as its single relational source of truth for portfolio content, CMS configurations, admin sessions, media metadata, and audit logs.

### Recommended Production Backup Cadence
- **Automated Daily Backups**: Create full PostgreSQL database snapshots daily using `pg_dump`.
- **Pre-Migration Backups**: Always execute a manual database backup prior to running Prisma database migrations (`npx prisma migrate deploy`).
- **Retention Policy**: Retain daily backups for at least 30 days and monthly backups for 1 year.

---

## 2. PostgreSQL Backup Procedures (`pg_dump`)

### Export Full Database Snapshot
Run the following command on the database host or backup agent:

```bash
pg_dump -h localhost -U postgres -d ashish_portfolio -F c -b -v -f /backups/portfolio_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Compressed Plain SQL Dump Alternative
```bash
pg_dump -h localhost -U postgres ashish_portfolio | gzip > /backups/portfolio_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 3. Database Restoration Procedure

### Restore from Custom Format (.dump)
```bash
# 1. Terminate active database connections
pg_restore -h localhost -U postgres -d ashish_portfolio --clean --if-exists -v /backups/portfolio_backup_YYYYMMDD_HHMMSS.dump
```

### Restore from Compressed Plain SQL (.sql.gz)
```bash
gunzip -c /backups/portfolio_backup_YYYYMMDD_HHMMSS.sql.gz | psql -h localhost -U postgres -d ashish_portfolio
```

---

## 4. Production Migration Safety Rules

1. **Never use `npx prisma db push` in production.** Always use `npx prisma migrate deploy` to execute tracked SQL migrations.
2. Verify migration SQL scripts locally in a staging database before running them on production.
3. Test backup restoration on a local or isolated staging server periodically to ensure data recoverability.

---

## 5. Media Files Storage Backup

- **Local Storage Mode (`server/uploads/`)**: Ensure the `server/uploads` directory is included in regular server backups or mapped to a persistent cloud volume.
- **S3 Storage Mode**: Enable S3 Object Versioning and Cross-Region Replication (CRR) on the production media bucket.

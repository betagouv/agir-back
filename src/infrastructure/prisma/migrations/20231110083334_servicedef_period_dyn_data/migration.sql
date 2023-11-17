-- AlterTable
ALTER TABLE "ServiceDefinition" ADD COLUMN     "dynamic_data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "minute_period" INTEGER,
ADD COLUMN     "scheduled_refresh" TIMESTAMPTZ(3);

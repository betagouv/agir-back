#curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/process_async_service
#curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/compute_reco_tags
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/send_email_notifications
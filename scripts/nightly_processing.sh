curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/clean_linky_data
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upgrade_user_todo
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upsert_ponderations
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/contacts/synchronize
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upsert_service_definitions
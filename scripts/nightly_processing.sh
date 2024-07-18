curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/clean_linky_data
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/contacts/synchronize
#curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upgrade_user_todo
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upsert_service_definitions
#curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/unsubscribe_oprhan_prms
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/article-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/defi-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/quiz-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/kyc-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/thematique-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/univers-statistique
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/compute_stats


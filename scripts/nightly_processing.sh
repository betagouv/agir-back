npm run execute clean_linky_data

npm run execute upsert_service_definitions

npm run execute unsubscribe_oprhan_prms

npm run execute all_defi_statistique

npm run execute article_statistique

npm run execute quizz_statistique

npm run execute kyc_statistique

npm run execute defi_statistique

npm run execute univers_statistique

npm run execute thematique_statistique

npm run execute univers_statistique

npm run execute service_statistique

npm run execute all_bilan_carbone

npm run execute update_user_couverture

npm run execute send_notifications

npm run execute create_brevo_contacts


##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/clean_linky_data
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/contacts/synchronize
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/upsert_service_definitions
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/unsubscribe_oprhan_prms
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/article-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/defi-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/quiz-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/kyc-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/thematique-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/univers-statistique
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/utilisateurs/compute_bilan_carbone
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/compute_stats
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/utilisateurs/update_user_couverture
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/notifications/email/send_notifications
##curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/create_brevo_contacts

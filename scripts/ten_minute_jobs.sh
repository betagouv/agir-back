curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/process_async_service
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/notifications/email/send_welcomes
npm run execute liste_prenoms
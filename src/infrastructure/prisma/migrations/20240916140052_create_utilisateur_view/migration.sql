CREATE OR REPLACE VIEW "UtilisateurVue" AS
  SELECT 
    EXTRACT(EPOCH FROM created_at) AS id,
    (logement->>'code_postal') AS code_postal,
    created_at AS date_inscription,
    derniere_activite AS date_derniere_connexion,
    rank AS classement_global,
    rank_commune AS classement_local,
    couverture_aides_ok AS couverture_aide,
    points_classement AS nombre_points,
    (logement->>'commune') AS commune,
    (logement->>'dpe') AS dpe,
    (CASE 
      WHEN logement->>'plus_de_15_ans' = 'true' THEN true
      WHEN logement->>'plus_de_15_ans' = 'false' THEN false
      ELSE NULL
    END) AS plus_de_15_ans,
    (logement->>'nombre_adultes') AS nombre_adultes,
    (logement->>'nombre_enfants') AS nombre_enfants,
    (CASE 
      WHEN logement->>'proprietaire' = 'true' THEN true
      WHEN logement->>'proprietaire' = 'false' THEN false
      ELSE NULL
    END) AS proprietaire,
    (logement->>'superficie') AS superficie,
    (logement->>'chauffage') AS chauffage,
    (logement->>'type') AS type,
    source_inscription
  FROM "Utilisateur";
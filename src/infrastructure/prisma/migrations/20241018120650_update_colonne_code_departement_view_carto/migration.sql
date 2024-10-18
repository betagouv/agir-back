CREATE OR REPLACE VIEW "CartographieVue" AS
  SELECT 
    row_number() OVER () AS id,
    (logement->>'code_postal') AS code_postal,
    couverture_aides_ok AS couvert_par_aides,
    CASE 
      WHEN (logement->>'code_postal') IS NULL THEN NULL
      ELSE SUBSTRING((logement->>'code_postal') FROM 1 FOR 2)
    END AS code_departement
  FROM "Utilisateur";
  
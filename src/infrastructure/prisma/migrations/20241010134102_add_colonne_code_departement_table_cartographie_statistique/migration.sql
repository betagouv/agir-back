CREATE OR REPLACE VIEW "CartographieVue" AS
  SELECT 
    row_number() OVER () AS id,
    (logement->>'code_postal') AS code_postal,
    couverture_aides_ok AS couvert_par_aides,
    code_departement
  FROM "Utilisateur";
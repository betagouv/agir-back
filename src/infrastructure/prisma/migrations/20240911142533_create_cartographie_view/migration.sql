CREATE OR REPLACE VIEW "CartographieVue" AS
  SELECT 
    row_number() OVER () AS id,
    code_departement AS code_postal,
    couverture_aides_ok AS couvert_par_aides
  FROM "Utilisateur";
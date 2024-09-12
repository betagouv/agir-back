CREATE OR REPLACE VIEW "PrenomVue" AS
  SELECT 
    prenom,
    row_number() OVER () AS id
  FROM "Utilisateur";
CREATE OR REPLACE VIEW "PrenomVue" AS
  SELECT 
    prenom,
    gen_random_uuid() AS id
  FROM "Utilisateur";
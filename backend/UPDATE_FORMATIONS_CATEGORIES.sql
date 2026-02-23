-- Add column if missing
ALTER TABLE formations ADD COLUMN IF NOT EXISTS categorie VARCHAR(100);

-- Catégorie: Tests (premiers 3)
UPDATE formations
SET categorie = 'Tests'
WHERE titre IN (
  'Formation DevOps & CI/CD',
  'Développement Web Full Stack',
  'Data Science & Machine Learning'
);

-- Catégorie: Compétences
UPDATE formations
SET categorie = 'Compétences'
WHERE titre IN (
  'Intelligence artificielle (IA)',
  'Cybersécurité',
  'Analyse des données',
  'Marketing numérique',
  'Parler anglais - English Proficiency',
  'IA générative (GenAI)',
  'Microsoft Excel - Niveau Expert',
  'Microsoft Power BI',
  'Project Management',
  'Python - Développement & Data Science'
);

-- Catégorie: Certificats
UPDATE formations
SET categorie = 'Certificats'
WHERE titre IN (
  'Certificat de cybersécurité Google',
  'Certificat Google Data Analytics',
  'Certificat d''assistance informatique Google',
  'Certificat de gestion de projet Google',
  'Certificat Google UX Design',
  'Certificat d''Analyste de données IBM',
  'Certificat IBM Science des données',
  'Certificat en Apprentissage automatique',
  'Certificat d''Analyste décisionnelle Microsoft Power BI',
  'Certificat de concepteur UI / UX'
);

-- Catégorie: Industries
UPDATE formations
SET categorie = 'Industries'
WHERE titre IN (
  'Business - Stratégie et Développement',
  'Informatique - Développement et Infrastructure',
  'Science des données - Carrière et Pratique',
  'Éducation et enseignement - Pédagogie numérique',
  'Ingénierie - Innovation et Gestion de projet technique',
  'Finance - Analyse financière et Gestion',
  'Soins de santé - Gestion et Administration hospitalière',
  'Ressources humaines (RH) - Gestion stratégique',
  'Technologies de l''information (IT) - Administration système',
  'Marketing - Stratégie Marketing et Brand Management'
);

-- Catégorie: Ressources Pro
UPDATE formations
SET categorie = 'Ressources Pro'
WHERE titre IN (
  'Test d''aptitude professionnelle - Préparation',
  'Points forts et points faibles pour entretiens',
  'Compétences à acquérir pour les hauts revenus',
  'Comment fonctionnent les crypto-monnaies ?',
  'Google Sheets - Fonctions avancées et Automatisation',
  'Comment apprendre l''Intelligence artificielle (IA)',
  'Certifications populaires en cybersécurité',
  'Préparation à la certification PMP',
  'Signes que vous obtiendrez le poste après un entretien',
  'Qu''est-ce que l''Intelligence artificielle (IA) ?'
);

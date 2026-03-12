-- ============================================
-- TABLES SYSTÈME DE FORMATIONS - TRU GROUP
-- ============================================

CREATE TABLE IF NOT EXISTS formations (
  id BIGSERIAL PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  duree VARCHAR(100) NOT NULL,
  format VARCHAR(50) NOT NULL, -- 'presentiel', 'en_ligne', 'hybride'
  lieu VARCHAR(255),
  modules JSONB, -- Liste des modules en JSON
  image_url TEXT,
  places_disponibles INTEGER DEFAULT 20,
  statut VARCHAR(50) DEFAULT 'active', -- 'active', 'terminee', 'annulee'
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_formations_set_updated_at ON formations;
CREATE TRIGGER trg_formations_set_updated_at
BEFORE UPDATE ON formations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS inscriptions_formations (
  id BIGSERIAL PRIMARY KEY,
  formation_id BIGINT REFERENCES formations(id) ON DELETE CASCADE,
  numero_inscription VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  profession VARCHAR(255),
  entreprise VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'en_attente', -- 'en_attente', 'confirmee', 'annulee'
  fiche_telechargee_le TIMESTAMPTZ,
  paiement_confirme_le TIMESTAMPTZ,
  montant_paye DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_inscriptions_set_updated_at ON inscriptions_formations;
CREATE TRIGGER trg_inscriptions_set_updated_at
BEFORE UPDATE ON inscriptions_formations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_inscriptions_numero ON inscriptions_formations(numero_inscription);
CREATE INDEX IF NOT EXISTS idx_inscriptions_email ON inscriptions_formations(email);
CREATE INDEX IF NOT EXISTS idx_formations_statut ON formations(statut);

-- Fonction pour générer numéro d'inscription unique
CREATE OR REPLACE FUNCTION generer_numero_inscription()
RETURNS TEXT AS $$
DECLARE
  annee TEXT;
  compteur INTEGER;
  numero TEXT;
BEGIN
  annee := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO compteur
  FROM inscriptions_formations
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  numero := 'FORM-' || annee || '-' || LPAD(compteur::TEXT, 4, '0');
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_numero_inscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_inscription IS NULL OR NEW.numero_inscription = '' THEN
    NEW.numero_inscription := generer_numero_inscription();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_numero_inscription ON inscriptions_formations;
CREATE TRIGGER trigger_set_numero_inscription
BEFORE INSERT ON inscriptions_formations
FOR EACH ROW
EXECUTE FUNCTION set_numero_inscription();


-- ====================
-- CATÉGORIE 1: COMPÉTENCES (10 formations)
-- ====================

INSERT INTO formations (titre, description, prix, duree, format, lieu, modules, places_disponibles, statut, date_debut, date_fin) VALUES

('Intelligence artificielle (IA)',
'Maîtrisez les fondamentaux de l''IA et apprenez à créer des systèmes intelligents. Formation complète couvrant les algorithmes, le machine learning et les applications pratiques de l''IA.',
450000, '8 semaines', 'hybride', 'Yaoundé / En ligne',
'["Introduction à l''IA", "Algorithmes d''apprentissage", "Réseaux de neurones", "Vision par ordinateur", "Traitement du langage naturel", "Projets pratiques IA"]',
25, 'active', '2026-03-10', '2026-05-05'),

('Cybersécurité',
'Protégez les systèmes et données contre les cyberattaques. Formation approfondie sur les techniques de sécurité, l''ethical hacking et la gestion des risques.',
400000, '6 semaines', 'presentiel', 'Douala, Cameroun',
'["Fondamentaux de la sécurité", "Ethical hacking", "Cryptographie", "Sécurité réseau", "Gestion des incidents", "Conformité et audits"]',
20, 'active', '2026-03-15', '2026-04-26'),

('Analyse des données',
'Transformez les données en insights stratégiques. Apprenez à collecter, analyser et visualiser les données pour prendre des décisions éclairées.',
380000, '5 semaines', 'en_ligne', 'Formation en ligne',
'["Introduction à l''analyse", "SQL et bases de données", "Excel avancé", "Statistiques descriptives", "Visualisation de données", "Tableau & Power BI"]',
30, 'active', '2026-03-20', '2026-04-24'),

('Marketing numérique',
'Maîtrisez les stratégies digitales modernes pour développer votre présence en ligne et générer des leads qualifiés.',
350000, '4 semaines', 'hybride', 'Yaoundé / En ligne',
'["SEO et référencement", "Publicité en ligne (Google Ads, Facebook Ads)", "Content marketing", "Email marketing", "Social media marketing", "Analytics et ROI"]',
25, 'active', '2026-04-01', '2026-04-29'),

('Parler anglais - English Proficiency',
'Améliorez votre anglais professionnel pour réussir dans un environnement international. Du niveau débutant à avancé.',
280000, '10 semaines', 'presentiel', 'Yaoundé, Cameroun',
'["English grammar fundamentals", "Business English", "Presentation skills", "Email writing", "Conversation practice", "TOEFL preparation"]',
15, 'active', '2026-03-10', '2026-05-19'),

('IA générative (GenAI)',
'Explorez l''IA générative avec ChatGPT, Midjourney, DALL-E et créez du contenu innovant. Formation pratique sur les prompts et applications.',
420000, '4 semaines', 'en_ligne', 'Formation en ligne',
'["Introduction à l''IA générative", "Maîtrise des prompts", "ChatGPT pour professionnels", "Génération d''images (Midjourney, DALL-E)", "Applications métier", "Éthique et limites"]',
30, 'active', '2026-04-05', '2026-05-03'),

('Microsoft Excel - Niveau Expert',
'Devenez expert Excel avec formules avancées, tableaux croisés dynamiques, macros VBA et automatisation.',
250000, '3 semaines', 'hybride', 'Douala / En ligne',
'["Formules et fonctions avancées", "Tableaux croisés dynamiques", "Power Query", "Macros et VBA", "Modélisation financière", "Automatisation des tâches"]',
20, 'active', '2026-03-18', '2026-04-08'),

('Microsoft Power BI',
'Créez des tableaux de bord professionnels et analysez vos données avec Power BI. Formation complète de la connexion aux données à la publication.',
380000, '5 semaines', 'en_ligne', 'Formation en ligne',
'["Introduction à Power BI", "Power Query et ETL", "Modélisation de données (DAX)", "Visualisations avancées", "Tableaux de bord interactifs", "Power BI Service et partage"]',
25, 'active', '2026-04-10', '2026-05-15'),

('Project Management',
'Gérez vos projets avec efficacité en utilisant les méthodologies Agile, Scrum et les meilleures pratiques PMI.',
400000, '6 semaines', 'presentiel', 'Yaoundé, Cameroun',
'["Fondamentaux de gestion de projet", "Méthodologies Agile & Scrum", "Planification et budgétisation", "Gestion des risques", "Leadership d''équipe", "Outils (MS Project, Jira)"]',
20, 'active', '2026-03-25', '2026-05-06'),

('Python - Développement & Data Science',
'Maîtrisez Python de zéro à expert. Programmation, automatisation, web scraping, data science et IA.',
380000, '8 semaines', 'hybride', 'Yaoundé / En ligne',
'["Bases Python et syntaxe", "Programmation orientée objet", "Manipulation de données (Pandas, NumPy)", "Visualisation (Matplotlib, Seaborn)", "Web scraping", "Introduction Machine Learning"]',
25, 'active', '2026-03-12', '2026-05-07');


-- ====================
-- CATÉGORIE 2: CERTIFICATS ET PROGRAMMES (10 formations)
-- ====================

INSERT INTO formations (titre, description, prix, duree, format, lieu, modules, places_disponibles, statut, date_debut, date_fin) VALUES

('Certificat de cybersécurité Google',
'Programme certifiant Google pour devenir analyste en cybersécurité. Formation alignée sur les standards de l''industrie avec certification reconnue internationalement.',
550000, '6 mois', 'en_ligne', 'Formation en ligne',
'["Fondamentaux de la cybersécurité", "Gestion des risques et des menaces", "Sécurité des réseaux", "Linux et SQL", "Détection et réponse aux incidents", "Python pour la cybersécurité", "Préparation à la certification", "Projet final"]',
30, 'active', '2026-03-01', '2026-08-31'),

('Certificat Google Data Analytics',
'Devenez analyste de données certifié Google. Apprenez à nettoyer, analyser et visualiser les données avec des outils professionnels.',
520000, '6 mois', 'en_ligne', 'Formation en ligne',
'["Fondations de l''analyse de données", "Poser les bonnes questions", "Préparer les données", "Traiter les données", "Analyser les données", "Partager les insights", "R Programming", "Projet Capstone"]',
30, 'active', '2026-03-05', '2026-09-05'),

('Certificat d''assistance informatique Google',
'Préparez-vous à une carrière dans le support IT avec ce programme Google. Compétences pratiques en dépannage, réseaux et sécurité.',
480000, '5 mois', 'en_ligne', 'Formation en ligne',
'["Fondamentaux du support technique", "Réseaux informatiques", "Systèmes d''exploitation", "Administration système", "Sécurité IT", "Soft skills pour le support", "Projet final"]',
30, 'active', '2026-03-10', '2026-08-10'),

('Certificat de gestion de projet Google',
'Lancez votre carrière en gestion de projet avec le certificat professionnel Google. Méthodologies traditionnelles et Agile.',
520000, '6 mois', 'en_ligne', 'Formation en ligne',
'["Fondamentaux de la gestion de projet", "Initiation de projet", "Planification de projet", "Exécution de projet", "Gestion Agile", "Leadership d''équipe", "Outils et templates", "Projet Capstone"]',
30, 'active', '2026-04-01', '2026-10-01'),

('Certificat Google UX Design',
'Créez des expériences utilisateur exceptionnelles. Programme complet de design UX avec portfolio de projets professionnels.',
550000, '7 mois', 'en_ligne', 'Formation en ligne',
'["Fondamentaux UX", "Recherche utilisateur", "Wireframing et prototypage", "Design visuel", "Design responsive", "Figma et Adobe XD", "Portfolio UX", "Projet final"]',
25, 'active', '2026-03-15', '2026-10-15'),

('Certificat d''Analyste de données IBM',
'Programme IBM pour devenir data analyst professionnel. Excel, SQL, Python, outils de visualisation et projets réels.',
580000, '6 mois', 'en_ligne', 'Formation en ligne',
'["Introduction à l''analyse de données", "Excel pour l''analyse", "Python pour data science", "Bases de données et SQL", "Visualisation avec Python", "IBM Cognos Analytics", "Projet final avec données réelles"]',
25, 'active', '2026-03-20', '2026-09-20'),

('Certificat IBM Science des données',
'Programme complet IBM en data science. Python, machine learning, deep learning et déploiement de modèles IA.',
650000, '8 mois', 'en_ligne', 'Formation en ligne',
'["Qu''est-ce que la data science?", "Outils de data science", "Méthodologie data science", "Python et bases de données", "Machine learning avec Python", "Deep learning et TensorFlow", "Visualisation avancée", "Projet Capstone", "Déploiement de modèles"]',
20, 'active', '2026-04-01', '2026-12-01'),

('Certificat en Apprentissage automatique',
'Maîtrisez le machine learning avec cette certification intensive. Algorithmes, modèles supervisés/non-supervisés et projets pratiques.',
600000, '5 mois', 'hybride', 'Yaoundé / En ligne',
'["Introduction au ML", "Regression et classification", "Apprentissage non supervisé", "Réseaux de neurones", "Deep learning", "NLP et Computer Vision", "Déploiement de modèles", "Projet final"]',
20, 'active', '2026-04-05', '2026-09-05'),

('Certificat d''Analyste décisionnelle Microsoft Power BI',
'Certification Microsoft officielle en Power BI. Créez des tableaux de bord professionnels et devenez expert en Business Intelligence.',
520000, '4 mois', 'en_ligne', 'Formation en ligne',
'["Fondamentaux Power BI", "Connexion et transformation de données", "Modélisation de données", "Calculs DAX avancés", "Visualisations professionnelles", "Power BI Service", "Sécurité et gouvernance", "Préparation à l''examen PL-300"]',
25, 'active', '2026-03-25', '2026-07-25'),

('Certificat de concepteur UI / UX',
'Devenez designer UI/UX certifié. Design thinking, prototypage, tests utilisateurs et création de portfolios professionnels.',
550000, '6 mois', 'hybride', 'Douala / En ligne',
'["Design thinking", "Recherche utilisateur", "Architecture de l''information", "Wireframing", "UI Design et systèmes de design", "Prototypage interactif", "Tests utilisateurs", "Portfolio professionnel"]',
20, 'active', '2026-04-10', '2026-10-10');


-- ====================
-- CATÉGORIE 3: INDUSTRIES ET CARRIÈRES (10 formations)
-- ====================

INSERT INTO formations (titre, description, prix, duree, format, lieu, modules, places_disponibles, statut, date_debut, date_fin) VALUES

('Business - Stratégie et Développement',
'Développez vos compétences en stratégie d''entreprise, business development et gestion commerciale pour piloter la croissance.',
420000, '6 semaines', 'presentiel', 'Yaoundé, Cameroun',
'["Stratégie d''entreprise", "Business model et innovation", "Développement commercial", "Négociation B2B", "Gestion de la relation client", "Analyse concurrentielle"]',
20, 'active', '2026-03-15', '2026-04-26'),

('Informatique - Développement et Infrastructure',
'Formation complète en développement logiciel, architectures cloud et administration système pour les professionnels IT.',
480000, '8 semaines', 'hybride', 'Douala / En ligne',
'["Programmation moderne", "Architectures logicielles", "Cloud computing (AWS, Azure)", "DevOps et CI/CD", "Bases de données", "Sécurité informatique"]',
25, 'active', '2026-03-20', '2026-05-15'),

('Science des données - Carrière et Pratique',
'Lancez votre carrière en data science avec des compétences pratiques en analyse, machine learning et communication de données.',
550000, '10 semaines', 'en_ligne', 'Formation en ligne',
'["Fondamentaux data science", "Analyse exploratoire", "Machine learning pratique", "Big Data et Spark", "Storytelling avec les données", "Portfolio de projets"]',
20, 'active', '2026-04-01', '2026-06-10'),

('Éducation et enseignement - Pédagogie numérique',
'Modernisez vos méthodes d''enseignement avec les outils numériques et les approches pédagogiques innovantes.',
320000, '5 semaines', 'hybride', 'Yaoundé / En ligne',
'["Pédagogie active", "Outils numériques pour l''enseignement", "Création de contenus e-learning", "Classes virtuelles", "Évaluation et feedback", "Gestion de classe"]',
25, 'active', '2026-03-25', '2026-04-29'),

('Ingénierie - Innovation et Gestion de projet technique',
'Compétences en gestion de projets d''ingénierie, méthodologies lean et innovation technologique.',
450000, '7 semaines', 'presentiel', 'Douala, Cameroun',
'["Gestion de projets d''ingénierie", "Lean manufacturing", "Innovation et R&D", "Outils CAO/DAO", "Qualité et normes", "Leadership technique"]',
20, 'active', '2026-04-05', '2026-05-24'),

('Finance - Analyse financière et Gestion',
'Maîtrisez l''analyse financière, la modélisation et la gestion de portefeuille pour exceller dans la finance.',
480000, '6 semaines', 'en_ligne', 'Formation en ligne',
'["Analyse financière", "Modélisation Excel avancée", "Évaluation d''entreprises", "Gestion de portefeuille", "Finance d''entreprise", "Marchés financiers"]',
20, 'active', '2026-03-18', '2026-04-29'),

('Soins de santé - Gestion et Administration hospitalière',
'Formation en gestion hospitalière, administration de la santé et systèmes d''information médicaux.',
420000, '8 semaines', 'presentiel', 'Yaoundé, Cameroun',
'["Gestion hospitalière", "Systèmes de santé", "Administration médicale", "Dossier patient informatisé", "Qualité des soins", "Réglementation sanitaire"]',
15, 'active', '2026-04-10', '2026-06-05'),

('Ressources humaines (RH) - Gestion stratégique',
'Développez vos compétences RH modernes: recrutement, gestion des talents, SIRH et transformation digitale RH.',
380000, '6 semaines', 'hybride', 'Yaoundé / En ligne',
'["Recrutement et talent acquisition", "Gestion de la performance", "Formation et développement", "SIRH et digitalisation RH", "Marque employeur", "Droit du travail"]',
25, 'active', '2026-03-22', '2026-05-03'),

('Technologies de l''information (IT) - Administration système',
'Devenez administrateur système expert: serveurs, réseaux, cloud, sécurité et automatisation.',
450000, '8 semaines', 'presentiel', 'Douala, Cameroun',
'["Administration Windows Server", "Administration Linux", "Réseaux et protocoles", "Virtualisation (VMware, Hyper-V)", "Sécurité IT", "Scripting et automatisation"]',
20, 'active', '2026-04-01', '2026-05-27'),

('Marketing - Stratégie Marketing et Brand Management',
'Maîtrisez la stratégie marketing, le branding et la gestion de campagnes omnicanales pour développer votre marque.',
400000, '6 semaines', 'en_ligne', 'Formation en ligne',
'["Stratégie marketing", "Brand management", "Marketing digital", "Études de marché", "Marketing automation", "Mesure de performance (KPIs)"]',
25, 'active', '2026-03-28', '2026-05-09');


-- ====================
-- CATÉGORIE 4: RESSOURCES PROFESSIONNELLES (10 formations)
-- ====================

INSERT INTO formations (titre, description, prix, duree, format, lieu, modules, places_disponibles, statut, date_debut, date_fin) VALUES

('Test d''aptitude professionnelle - Préparation',
'Préparez-vous aux tests de recrutement avec exercices pratiques: tests psychotechniques, logique, raisonnement verbal et numérique.',
180000, '3 semaines', 'en_ligne', 'Formation en ligne',
'["Tests de raisonnement logique", "Tests psychotechniques", "Raisonnement verbal", "Raisonnement numérique", "Tests de personnalité", "Stratégies de réussite"]',
30, 'active', '2026-03-15', '2026-04-05'),

('Points forts et points faibles pour entretiens',
'Réussissez vos entretiens d''embauche en identifiant et présentant vos forces et faiblesses de manière stratégique.',
150000, '2 semaines', 'hybride', 'Yaoundé / En ligne',
'["Analyse SWOT personnelle", "Formulation des réponses", "Exemples concrets et storytelling", "Gestion du stress en entretien", "Simulations d''entretiens"]',
25, 'active', '2026-03-20', '2026-04-03'),

('Compétences à acquérir pour les hauts revenus',
'Identifiez et développez les compétences les plus rémunératrices sur le marché: tech, business, soft skills et négociation salariale.',
220000, '4 semaines', 'en_ligne', 'Formation en ligne',
'["Compétences tech à haute valeur", "Leadership et management", "Négociation et persuasion", "Personal branding", "Réseautage stratégique", "Négociation salariale"]',
30, 'active', '2026-03-25', '2026-04-22'),

('Comment fonctionnent les crypto-monnaies ?',
'Comprendre la blockchain, Bitcoin, Ethereum et l''écosystème crypto. Trading, wallets et sécurité des actifs numériques.',
280000, '4 semaines', 'en_ligne', 'Formation en ligne',
'["Blockchain et technologies décentralisées", "Bitcoin et cryptomonnaies principales", "Smart contracts et Ethereum", "Trading et investissement crypto", "Wallets et sécurité", "Régulation et fiscalité"]',
25, 'active', '2026-04-01', '2026-04-29'),

('Google Sheets - Fonctions avancées et Automatisation',
'Maîtrisez Google Sheets: formules avancées, doublons, scripts Apps Script et collaboration en temps réel.',
200000, '3 semaines', 'en_ligne', 'Formation en ligne',
'["Formules et fonctions avancées", "Mise en évidence des doublons", "Mise en forme conditionnelle", "Tableaux croisés dynamiques", "Google Apps Script", "Automatisation et integration"]',
30, 'active', '2026-03-18', '2026-04-08'),

('Comment apprendre l''Intelligence artificielle (IA)',
'Guide complet pour démarrer en IA: ressources, outils, parcours d''apprentissage et projets pratiques pour devenir expert.',
250000, '5 semaines', 'hybride', 'Yaoundé / En ligne',
'["Roadmap d''apprentissage IA", "Mathématiques pour l''IA", "Ressources et cours recommandés", "Outils et frameworks", "Premiers projets IA", "Communauté et réseautage"]',
25, 'active', '2026-04-05', '2026-05-10'),

('Certifications populaires en cybersécurité',
'Découvrez et préparez les certifications cyber les plus demandées: CEH, CISSP, CompTIA Security+, OSCP.',
320000, '6 semaines', 'en_ligne', 'Formation en ligne',
'["Vue d''ensemble des certifications cyber", "Préparation CompTIA Security+", "Préparation CEH (Ethical Hacker)", "Préparation CISSP", "Choisir sa certification", "Stratégies de réussite aux examens"]',
20, 'active', '2026-04-10', '2026-05-22'),

('Préparation à la certification PMP',
'Préparez l''examen PMP (Project Management Professional) avec méthodologie éprouvée, exercices et examens blancs.',
480000, '8 semaines', 'hybride', 'Douala / En ligne',
'["PMBOK 7è édition", "Domaines de performance", "Méthodologies Agile et hybrides", "Exercices de simulation", "Examens blancs", "Stratégies pour réussir l''examen PMP"]',
20, 'active', '2026-03-22', '2026-05-17'),

('Signes que vous obtiendrez le poste après un entretien',
'Décryptez les signaux positifs et négatifs en entretien. Follow-up efficace et stratégies post-entretien.',
120000, '2 semaines', 'en_ligne', 'Formation en ligne',
'["Signaux positifs en entretien", "Langage corporel du recruteur", "Questions révélatrices", "Email de remerciement efficace", "Follow-up stratégique", "Négociation de l''offre"]',
30, 'active', '2026-03-28', '2026-04-11'),

('Qu''est-ce que l''Intelligence artificielle (IA) ?',
'Introduction complète à l''IA pour débutants: concepts, applications, impact sociétal et opportunités professionnelles.',
180000, '3 semaines', 'en_ligne', 'Formation en ligne',
'["Histoire et fondements de l''IA", "Types d''IA: faible vs forte", "Applications de l''IA dans différents secteurs", "Machine Learning et Deep Learning", "IA et éthique", "Carrières dans l''IA"]',
30, 'active', '2026-04-15', '2026-05-06');


-- Commentaires
COMMENT ON TABLE formations IS 'Liste des formations proposées par TRU GROUP';
COMMENT ON TABLE inscriptions_formations IS 'Inscriptions aux formations avec numéros uniques';
COMMENT ON COLUMN inscriptions_formations.numero_inscription IS 'Numéro unique au format FORM-YYYY-0001';
COMMENT ON COLUMN formations.modules IS 'Liste des modules en JSON array';
